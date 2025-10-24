import  * as Dialog from '@radix-ui/react-dialog';
import React from "react";
import { IoMdClose } from 'react-icons/io';

interface ModalProps {
    isOpen?: boolean;
    onChange?: (open: boolean) => void;
    title?: string;
    description?: string;
    children?: React.ReactNode;
}

const Model:React.FC<ModalProps> = ({
    isOpen,
    onChange,
    title,
    description,
    children
}) => {
    return (
            <Dialog.Root
            open = {isOpen}
            defaultOpen = {isOpen}
            onOpenChange={onChange}
            >
                <Dialog.Portal>
                    <Dialog.Overlay 
                    className="fixed inset-0 
                    bg-neutral-900/90 
                    backdrop-blur-sm
                    overflow-y-auto
                    max-h-screen
                    grid
                    place-items-center
                    z-50"/>
                    <Dialog.Content
                    className="fixed 
                    drop-shadow-md
                    border
                    border-neutral-700
                    top-1/2 
                    left-1/2
                    max-h-screen
                    overflow-y-auto
                    md:h-auto
                    md:max-h-[85vh]
                    w-full
                    md:w-[98vw]
                    md:max-w-[450px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-md
                    bg-neutral-800
                    p-[25px]
                    focus:outline-none
                    z-50
                    flex flex-col
                    scrollbar-beauty">
                        <Dialog.Title
                        className='text-white
                        text-xl
                        text-center
                        font-bold
                        mb-4'>
                            {title}
                        </Dialog.Title>
                        <Dialog.Description className='
                        text-sm
                        text-center
                        text-neutral-400
                        leading-normal
                        mb-5'>
                            {description}
                        </Dialog.Description>
                        <div>
                            {children}
                        </div>
                        <Dialog.Close asChild>
                            <button className='
                            text-neutral-400
                            hover:text-white
                            transition
                            absolute
                            top-[10px]
                            right-[10px]
                            inline-flex
                            h-[25px]
                            w-[25px]
                            appearance-none
                            items-center
                            justify-center
                            rounded-full
                            focus:outline-none'>
                                <IoMdClose/>
                            </button>
                        </Dialog.Close>

                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
    );
}

export default Model;