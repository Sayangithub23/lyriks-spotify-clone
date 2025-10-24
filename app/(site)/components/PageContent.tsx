// app/components/PageContent.tsx

"use client";

import { Song } from "@/types"
import SongItem from "@/components/SongItem";
import useOnPlay from "@/hooks/useOnPlay";

interface PageContentProps {
    songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({
    songs
}) => {
    const onPlay = useOnPlay(songs);

    if (songs.length === 0) {
        return (
            <div className="mt-4 text-neutral-400">
                No songs available!
            </div>
        )
    }

    return (
        <div
            className="
                grid
                grid-cols-2
                sm:grid-cols-3
                md:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-5
                2xl:grid-cols-8
                gap-4
                mt-4
            "
        >
            {songs.map((item) => (
                <SongItem
                    key={item.id}
                    // FIX: Use optional chaining (?.) to safely call onPlay
                    onClick={(id: string) =>{ 
                        console.log('1. CLICKED in PageContent with ID:', id);
                        onPlay?.(id)}}
                    data={item}
                />
            ))}
        </div>

    );
}

export default PageContent;