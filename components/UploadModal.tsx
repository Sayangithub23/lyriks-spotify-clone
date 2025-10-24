"use client";
import Modal from "./Modal";
import uniqid from "uniqid";
import useUploadModal from "@/hooks/useUploadModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Input from "./Input";
import Button from "./Button";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

const UploadModal = () => {
  const uploadModal = useUploadModal();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      author: "",
      title: "",
      song: null,
      image: null,
    },
  });
  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      uploadModal.onClose();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];

      if (!imageFile || !songFile || !user) {
        toast.error("Missing Fields");
        setIsLoading(false);
        return;
      }
      const uniqueID = uniqid();

      // ======================== THE FIX ========================
      // Sanitize the title to create a URL-safe string for the filename
      const safeTitle = values.title
        .replace(/[^a-zA-Z0-9 ]/g, "") // Remove all special characters except spaces
        .replace(/\s+/g, "-") // Replace all spaces with a single hyphen
        .toLowerCase(); // Convert to lowercase
      // =========================================================

      //Upload Song - Now using the 'safeTitle'
      const { data: songData, error: songError } = await supabaseClient.storage
        .from("songs")
        .upload(`song-${safeTitle}-${uniqueID}`, songFile, {
          // <-- Use safeTitle
          cacheControl: "3600",
          upsert: false,
        });

      if (songError) {
        setIsLoading(false);
        return toast.error("Failed to upload song!!");
      }

      //Upload Image - Also using the 'safeTitle'
      const { data: imageData, error: imageError } =
        await supabaseClient.storage
          .from("images")
          .upload(`image-${safeTitle}-${uniqueID}`, imageFile, {
            // <-- Use safeTitle
            cacheControl: "3600",
            upsert: false,
          });

      // ... rest of your function

      if (imageError) {
        setIsLoading(false);
        return toast.error("Failed to upload image!");
      }

      // FIX #3: Add a check to ensure upload data exists before proceeding
      if (!songData || !imageData) {
        setIsLoading(false);
        return toast.error("Could not get upload details. Please try again.");
      }

      const { error: supabaseError } = await supabaseClient
        .from("songs")
        .insert({
          user_id: user.id,
          title: values.title,
          author: values.author,
          image_path: imageData.path,
          song_path: songData.path,
        });

      if (supabaseError) {
        setIsLoading(false);
        // FIX #2: Use the .message property for the toast error
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      toast.success("Song Uploaded!");
      reset();
      uploadModal.onClose();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Add a song"
      description="Upload an mp3 to your library"
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex
            flex-col
            gap-y-4"
      >
        <Input
          // FIX #1: Corrected typo from 'tittle' to 'title'
          id="title"
          disabled={isLoading}
          {...register("title", { required: true })}
          placeholder="Song title"
        />
        <Input
          id="author"
          disabled={isLoading}
          {...register("author", { required: true })}
          placeholder="Song author"
        />
        <div>
          <div className="pb-1">Select audio file</div>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept="audio/*"
            {...register("song", { required: true })}
          />
        </div>
        <div>
          <div className="pb-1">Select image</div>
          <Input
            id="image"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register("image", { required: true })}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          Create
        </Button>
      </form>
    </Modal>
  );
};

export default UploadModal;
