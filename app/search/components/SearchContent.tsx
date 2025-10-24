// app/search/components/SearchContent.tsx

"use client";

import MediaItem from "@/components/MediaItem"; // MediaItem now includes the button
import useOnPlay from "@/hooks/useOnPlay";
import { Song } from "@/types";
// No need to import LikedButton here anymore

interface SearchContentProps {
    songs: Song[];
}

const SearchContent: React.FC<SearchContentProps> = ({
    songs
}) => {
    const onPlay = useOnPlay(songs);
    if (songs.length === 0) {
        return (
            <div className="flex flex-col gap-y-2 w-full px-6 text-red-500">
                No Songs Found!!
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-2 w-full px-6">
            
            {songs.map((song) => (
                <MediaItem
                    key={song.id}
                    onClick={(id: string) => onPlay(id)} 
                    data={song}
                />
            ))}
        </div>
    )
}

export default SearchContent;