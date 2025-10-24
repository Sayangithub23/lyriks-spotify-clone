import { Price, Song } from "@/types"; // ✅ Merged imports

// --- Existing Code ---

export const getUrl = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";

  url = url.includes("http") ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === "/" ? url.slice(0, -1) : url;
  return url;
};

export const postData = async ({
  url,
  data,
}: {
  url: string;
  data?: { price: Price };
}) => {
  console.log("POST REQUEST:", url, data);
  const res: Response = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.log("Error in POST:", { url, data, res });
    throw new Error(`Error: ${res.status}`);
  }
  return res.json();
};

export const toDateTime = (secs: number | null | undefined): Date | null => {
  if (!secs) {
    console.warn("[toDateTime] Received null/undefined timestamp");
    return null;
  }

  try {
    const date = new Date(secs * 1000);

    if (isNaN(date.getTime())) {
      console.error("[toDateTime] Invalid timestamp:", secs);
      return null;
    }

    return date;
  } catch (err) {
    console.error("[toDateTime] Error converting timestamp:", secs, err);
    debugger;
    return null;
  }
};

// --- New Code Added ---

// Defines the structure of a Deezer track
interface DeezerTrack {
  id: number;
  title: string;
  preview: string;
  artist: {
    name: string;
  };
  album: {
    cover_medium: string;
  };
  release_date: string;
}

// Maps a Deezer track object to your local Song type (excluding user_id)
export const mapDeezerTrackToSong = (
  track: DeezerTrack
): Omit<Song, "user_id"> => {
  return {
    id: String(track.id), // Deezer uses numeric IDs, convert to string
    title: track.title,
    author: track.artist.name,
    song_path: track.preview, // 30-second preview URL
    image_path: track.album.cover_medium,
    created_at: track.release_date,
  };
};
