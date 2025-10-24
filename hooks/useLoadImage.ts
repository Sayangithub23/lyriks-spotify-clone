import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Song } from "@/types";

const useLoadImage = (song: Song) => {
  const supabaseClient = useSupabaseClient();

  if (!song) {
    return null;
  }

  // --- THE FIX ---
  // If the image_path is already a full URL (from Deezer), return it directly.
  if (song.image_path.startsWith('https://')) {
    return song.image_path;
  }

  // Otherwise, use the old logic to get the public URL from Supabase storage.
  const { data: imageData } = supabaseClient
    .storage
    .from('images') // Make sure 'images' is your bucket name
    .getPublicUrl(song.image_path);

  return imageData.publicUrl;
};

export default useLoadImage;