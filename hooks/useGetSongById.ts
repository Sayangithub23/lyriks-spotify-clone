import { useEffect, useMemo, useState } from "react";
import { Song } from "@/types";
import { useSessionContext } from "@supabase/auth-helpers-react";
import toast from "react-hot-toast";

const useGetSongById = (id?: string) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [song, setSong] = useState<Song | undefined>(undefined);
    const { supabaseClient } = useSessionContext();

    useEffect(() => {
        if (!id) {
            return;
        }

        setIsLoading(true);

        const fetchSong = async () => {
            const isDeezer = String(id).startsWith('deezer-');

            if (isDeezer) {
                try {
                    const res = await fetch(`/api/get-song/${id}`);
                    
                    if (!res.ok) {
                         const errorText = await res.text();
                         throw new Error(`Error from proxy: ${errorText}`);
                    }

                    const songData: Song = await res.json();
                    setSong(songData);

                } catch (error: any) {
                    toast.error(error.message);
                } finally {
                    setIsLoading(false);
                }

            } else {
                // --- FETCH FROM SUPABASE (Original logic is fine) ---
                const { data, error } = await supabaseClient
                    .from('songs')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    toast.error(error.message);
                } else {
                    setSong({ ...data, source: 'supabase' } as Song);
                }
                setIsLoading(false);
            }
        }

        fetchSong();

    }, [id, supabaseClient]);

    return useMemo(() => ({
        isLoading,
        song
    }), [isLoading, song]);
}

export default useGetSongById;