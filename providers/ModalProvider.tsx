"use client";
import React from "react";
import { useEffect } from "react";
import AuthModal from "../components/AuthModal";
import UploadModal from "../components/UploadModal";
import SubscribeModal from "../components/SubscribeModal";
import { ProductsWithPrice } from "@/types";

interface ModalProviderProps {
    products: ProductsWithPrice[];
}

const ModelProvider: React.FC<ModalProviderProps> = (
    {products}
) =>{
    const [isMounted, setIsMounted] = React.useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }
    
    return (
        <>
            <AuthModal/>
            <UploadModal/>
            <SubscribeModal products = {products}/>
        </>
    );
}

export default ModelProvider;