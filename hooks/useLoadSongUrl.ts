import { Song } from "@/types";
import { useSessionContext } from "@supabase/auth-helpers-react";

const useLoadSongUrl = (song: Song) => {
    const { supabaseClient } = useSessionContext();

    if (!song) {
        return '';
    }

    // --- THE FIX ---
    // If the song_path is a full URL (from Deezer), return it directly.
    if (song.song_path.startsWith('https://')) {
        return song.song_path;
    }

    // Otherwise, get it from Supabase storage.
    const { data: songData } = supabaseClient
        .storage
        .from('songs') // Make sure 'songs' is your bucket name
        .getPublicUrl(song.song_path);

    return songData.publicUrl;
}

export default useLoadSongUrl;