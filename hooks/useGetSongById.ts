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
      // 'id' is a string ("7" or "deezer-123")
      const isDeezer = String(id).startsWith("deezer-");

      if (isDeezer) {
        // --- FETCH FROM OUR API PROXY ---
        try {
          const res = await fetch(`/api/get-song/${id}`);

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Error from proxy: ${errorText}`);
          }

          const songData: Song = await res.json();
          setSong(songData);
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("An unknown error occurred");
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        
        const numericId = parseInt(id, 10);

        
        if (isNaN(numericId)) {
          setIsLoading(false);
          return toast.error("Invalid song ID");
        }

        const { data, error } = await supabaseClient
          .from("songs")
          .select("*")
          .eq("id", numericId) // <-- Use the correct numeric ID
          .single();

        if (error) {
          setIsLoading(false); // <-- Add error handling back
          return toast.error(error.message);
        } else {
          // Re-convert to string so all IDs are strings in the app
          setSong({ ...data, id: String(data.id), source: "supabase" } as Song);
        }
        setIsLoading(false);
      }
    };

    fetchSong();
  }, [id, supabaseClient]);

  return useMemo(
    () => ({
      isLoading,
      song,
    }),
    [isLoading, song]
  );
};

export default useGetSongById;
