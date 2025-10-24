// hooks/usePlayer.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'; // <-- 1. Import

interface PlayerStore {
    ids: string[];
    activeId?: string;
    setId: (id: string) => void;
    setIds: (ids: string[]) => void;
    reset: () => void;
}

// 2. Wrap the function in devtools()
const usePlayer = create(devtools<PlayerStore>((set) => ({
    ids: [],
    activeId: undefined,
    setId: (id: string) => set({ activeId: id }),
    setIds: (ids: string[]) => set({ ids: ids }),
    reset: () => set({ ids: [], activeId: undefined })
})));

export default usePlayer;