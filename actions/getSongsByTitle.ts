import { Song } from "@/types";
import { createClient } from "@supabase/supabase-js";
import getSongs from "./getSongs";
import { mapDeezerTrackToSong } from "@/libs/helpers";

// Internal function to search Supabase
const searchSupabaseSongs = async (title: string): Promise<Song[]> => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabase
    .from('songs')
    .select('*')
    .ilike('title', `%${title}%`)
    .order('created_at', { ascending: false });

    if (error) {
        console.log(error.message);
    }

    const supabaseSongs = (data || []).map((song) => ({
      ...song,
      source: 'supabase'
    }));

    return supabaseSongs as Song[];
};

// Internal function to search Deezer
const searchDeezerSongs = async (title: string): Promise<Song[]> => {
     try {
        const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(title)}`);
        if (!res.ok) throw new Error('Failed to search Deezer');

        const data = await res.json();
        if (!data || !data.data) return [];

       
        const deezerSongs: Song[] = data.data.map(mapDeezerTrackToSong).map((song: Omit<Song, 'user_id'>) => ({
            ...song,
            id: `deezer-${song.id}`, // Add prefix to avoid ID conflicts
            source: 'deezer'
        }));
        return deezerSongs;

    } catch (error) {
        console.log(error);
        return [];
    }
};

// The main exported function
const getSongsByTitle = async (title?: string): Promise<Song[]> => {
  if (!title) {
    return getSongs();
  }

  const [supabaseSongs, deezerSongs] = await Promise.all([
    searchSupabaseSongs(title),
    searchDeezerSongs(title)
  ]);

  return [...supabaseSongs, ...deezerSongs];
};

export default getSongsByTitle;

