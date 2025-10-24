import {create} from "zustand";

interface useUploadStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

const useUploadModal = create<useUploadStore>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false}),
}));

export default useUploadModal;