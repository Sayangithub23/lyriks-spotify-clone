"use client";
import usePlayer from "@/hooks/usePlayer";
import useGetSongById from "@/hooks/useGetSongById";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import PlayerContent from "./PlayerContent";
const Player = () =>{ 
    const player = usePlayer();
    const {song} = useGetSongById(player.activeId);
    const songUrl = useLoadSongUrl(song!);
     console.log('4. PLAYER re-rendered. Active ID is:', player.activeId);
     console.log('5. PLAYER fetched song data:', song);

    if(!song || !songUrl || !player.activeId){
        return null;
    }

    return (
        <div className="
        fixed
        bottom-0
        bg-black
        w-full
        py-2
        h-[80px]
        px-4
        ">
           <PlayerContent 
           key = {songUrl}
           song = {song}
           songUrl={songUrl}/>
        </div>
    );
}

export default Player;