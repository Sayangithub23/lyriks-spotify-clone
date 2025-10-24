import { Song } from "@/types"
import usePlayer from "./usePlayer"
import useAuthModal from "./useAuthModal"
import { useUser } from "./useUser";



const useOnPlay = (songs: Song[]) =>{
    const authModal = useAuthModal();
    const player = usePlayer();
    const {user} = useUser();
    
    const onPlay = (id: string) => {
        if(!user){
            return authModal.onOpen();
        }
        
        console.log('2. ACTION in useOnPlay is setting ID:', id);
        player.setId(id);
        player.setIds(songs.map((song)=> song.id)); 
    };
    return onPlay; 
}

export default useOnPlay;
