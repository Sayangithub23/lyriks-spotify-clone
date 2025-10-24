"use client";
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { RxCaretLeft, RxCaretRight } from 'react-icons/rx';
import { HiHome } from 'react-icons/hi';
import { useUser } from "../hooks/useUser";
import { BiSearch } from 'react-icons/bi';
import Button from './Button';
import useAuthModal from '@/hooks/useAuthModal';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { FaUserAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import usePlayer from '@/hooks/usePlayer';

interface HeaderProps {
    children?: React.ReactNode;
    className?: string;

}

const Header: React.FC<HeaderProps> = ({
    children,
    className
}) => {
    const player = usePlayer();
    const authModal = useAuthModal();
    const router = useRouter();

    const supabaseClient = useSupabaseClient();
    const {user, subscription} = useUser(); 

    const handleLogout = async () => {
        const {error} = await supabaseClient.auth.signOut();

        player.reset();
        router.refresh();
        if(error){
            toast.error(error.message);
        }else{
            toast.success('Logged out successfully');
        }
    };
 return (
    <div className=
    {twMerge(`
    h-fit
    bg-gradient-to-b
    from-blue-500
    p-6
    `, className)}>
      <div
      className="
      w-full
      mb-4
      flex
      items-center
      justify-between
      "
      >
        <div className='
        hidden
        md:flex
        gap-x-2
        items-center
        '>
            <button
            className='
            rounded-full
            bg-black
            flex
            items-center
            justify-center
            hover:opacity-75
            transition
            '
            >
                <RxCaretLeft 
                onClick={() => router.back()}
                size={35}
                className='
                text-white
                hover:opacity-75
                transition
                cursor-pointer
                ' />
            </button>
            <button
            className='
            rounded-full
            bg-black
            flex
            items-center
            justify-center
            hover:opacity-75
            transition
            '
            >
                <RxCaretRight 
                onClick={() => router.forward()}
                size={35}
                className='
                text-white
                hover:opacity-75
                transition
                cursor-pointer
                ' />
            </button>
        </div>
        <div className='
        flex
        md:hidden
        gap-x-2
        items-center
        '>
            <button
            className='
            rounded-full
            bg-white
            p-2
            flex
            items-center
            justify-center  
            hover:opacity-75
            transition
            '
            >
                <HiHome
                className='text-black' size={20}/>
            </button>
            <button
            className='
            rounded-full
            bg-white
            p-2
            flex
            items-center
            justify-center  
            hover:opacity-75
            transition
            '
            >
                <BiSearch
                className='text-black' size={20}/>
            </button>
        </div>
        <div
        className='
        flex
        justify-between
        items-center
        gap-x-4
        '>
            {user ? (
                // This part will now correctly display when a user object exists
                <div className='flex gap-x-4 items-center'>
                    <Button
                        onClick={handleLogout}
                        className='bg-white px-6 py-2 text-black font-bold'
                    >
                        Logout
                    </Button>
                    <Button
                    onClick={() => router.push('/account')}
                    className='
                    bg-white
                    rounded-full
                    text-blue-500
                    '
                    >
                        <FaUserAlt/>
                    </Button>
                </div>
            ) : (
            <>
                <div>
                    <Button
                    onClick={authModal.onOpen}
                    className='
                    bg-transparent
                    text-neutral-300
                    font-semibold'
                    >
                        Sign Up
                    </Button>
                </div>
                <div>
                    <Button
                    onClick={authModal.onOpen}
                    className='
                    bg-white
                    px-6
                    text-black
                    font-bold
                    py-2'
                    >
                        Log In
                    </Button>
                </div>
            </>
            )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default Header;