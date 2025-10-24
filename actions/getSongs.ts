import { Song } from "@/types";
import { createClient } from "@supabase/supabase-js"; 
import { mapDeezerTrackToSong } from "@/libs/helpers"; 


const getSupabaseSongs = async (): Promise<Song[]> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error);
  }


  const supabaseSongs = (data || []).map((song) => ({
    ...song,
    source: 'supabase'
  }));
  
  return supabaseSongs as Song[]; 
};


const getDeezerChartSongs = async (): Promise<Song[]> => {
  try {
    const res = await fetch('https://api.deezer.com/chart/0/tracks?limit=10');
    if (!res.ok) throw new Error('Failed to fetch from Deezer');
    
    const data = await res.json();
    if (!data || !data.data) return [];

  
    const deezerSongs: Song[] = data.data.map(mapDeezerTrackToSong).map((song: Omit<Song, 'user_id'>) => ({
        ...song,
        id: `deezer-${song.id}`, 
        source: 'deezer'
    }));
    return deezerSongs;

  } catch (error) {
    console.log(error);
    return [];
  }
};

const getSongs = async (): Promise<Song[]> => {
  // Run both fetches in parallel
  const [supabaseSongs, deezerSongs] = await Promise.all([
    getSupabaseSongs(),
    getDeezerChartSongs()
  ]);

  
  return [...supabaseSongs, ...deezerSongs];
};

export default getSongs;

