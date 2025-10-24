import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { mapDeezerTrackToSong } from "@/libs/helpers";

const getLikedSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 1. Fetch all liked song rows
  const { data: likedSongsData, error } = await supabase
    .from('liked_songs')
    .select('song_id, source') // Get the ID and the new 'source' column
    .eq('user_id', session?.user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }
  if (!likedSongsData) {
    return [];
  }

  // 2. Separate IDs by source
  const supabaseSongIds = likedSongsData
    .filter(item => item.source === 'supabase')
    .map(item => item.song_id);
    
  const deezerSongIds = likedSongsData
    .filter(item => item.source === 'deezer')
    .map(item => item.song_id.replace('deezer-', '')); // Remove prefix

  // 3. Fetch details for each source in parallel
  
  // Fetch Supabase songs
  const fetchSupabaseSongs = async () => {
    if (supabaseSongIds.length === 0) return [];
    const { data: supabaseSongs, error: sbError } = await supabase
      .from('songs')
      .select('*')
      .in('id', supabaseSongIds);
    
    if (sbError) {
      console.log(sbError);
      return [];
    }
    return (supabaseSongs || []).map(song => ({ ...song, source: 'supabase' })) as Song[];
  };

  // Fetch Deezer songs
  const fetchDeezerSongs = async () => {
    if (deezerSongIds.length === 0) return [];
    
    try {
      const songPromises = deezerSongIds.map(async (id) => {
        const res = await fetch(`https://api.deezer.com/track/${id}`);
        if (!res.ok) return null;
        const trackData = await res.json();
        return {
            ...mapDeezerTrackToSong(trackData),
            id: `deezer-${id}`, // Add prefix back
            source: 'deezer'
        };
      });
      const songs = await Promise.all(songPromises);
      return songs.filter(song => song !== null) as Song[];
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  // 4. Run fetches and combine all results
  const [supabaseSongs, deezerSongs] = await Promise.all([
    fetchSupabaseSongs(),
    fetchDeezerSongs()
  ]);

  const allLikedSongs = [...supabaseSongs, ...deezerSongs];

  // 5. ✅ NEW: Create a Map for quick lookup
  const songMap = new Map<string, Song>();
  allLikedSongs.forEach(song => {
    if(song) { // Add a check to ensure song is not null
      songMap.set(song.id, song);
    }
  });

  // 6. ✅ NEW: Map over the original sorted ID list to build the final, sorted array
  const sortedSongs = likedSongsData
    .map(item => songMap.get(item.song_id)) // Find the song from the map
    .filter(song => song !== undefined) as Song[]; // Filter out any that failed

  return sortedSongs;
};

export default getLikedSongs;