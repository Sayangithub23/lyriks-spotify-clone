"use client";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { useEffect } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import useAuthModal from "@/hooks/useAuthModal";


const AuthModal = () => {
  const supabaseClient = useSupabaseClient(); // Replace with actual Supabase client initialization
  const router = useRouter();
  const {session} = useSessionContext(); // Replace with actual session retrieval logic
  const {onClose, isOpen} = useAuthModal();

  useEffect(() => {
    if(session){
      onClose();
    }
  }, [session, router, onClose]);

  const onChange = (open: boolean) =>{
    if(!isOpen){
      onClose();
    }
  }

  if (!supabaseClient) {
    return null;
  }
  return (
    <Modal
        title="Welcome back"
        description="Login to your account!"
        isOpen = {isOpen}
        onChange={onChange}
    >
        <Auth
        theme="dark"
        providers={['github']}
        magicLink
            supabaseClient={supabaseClient}
            appearance={
             {
                theme: ThemeSupa,
                variables: {
                    default: {
                        colors: {
                          brand: '#404040',
                          brandAccent: '#22c55e',
                        },
                    },
                }
             } 
            } />
    </Modal>
  );
    
};

export default AuthModal;