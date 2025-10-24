import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { mapDeezerTrackToSong } from "@/libs/helpers"; // Make sure this helper exists

// Internal function for Supabase songs (your original logic)
const getSupabaseSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error);
  }

  // We add a 'source' property to distinguish them
  const supabaseSongs = (data || []).map((song) => ({
    ...song,
    source: 'supabase'
  }));
  
  return supabaseSongs as Song[]; // Make sure your Song type can handle 'source'
};

// Internal function for Deezer chart
const getDeezerChartSongs = async (): Promise<Song[]> => {
  try {
    const res = await fetch('https://api.deezer.com/chart/0/tracks?limit=10');
    if (!res.ok) throw new Error('Failed to fetch from Deezer');
    
    const data = await res.json();
    if (!data || !data.data) return [];

    // ✅ FIX: Added type 'Omit<Song, 'user_id'>' to the 'song' parameter
    const deezerSongs: Song[] = data.data.map(mapDeezerTrackToSong).map((song: Omit<Song, 'user_id'>) => ({
        ...song,
        id: `deezer-${song.id}`, // Add a prefix to avoid ID conflicts
        source: 'deezer'
    }));
    return deezerSongs;

  } catch (error) {
    console.log(error);
    return [];
  }
};

// The main exported function
const getSongs = async (): Promise<Song[]> => {
  // Run both fetches in parallel
  const [supabaseSongs, deezerSongs] = await Promise.all([
    getSupabaseSongs(),
    getDeezerChartSongs()
  ]);

  // Combine the results
  return [...supabaseSongs, ...deezerSongs];
};

export default getSongs;
