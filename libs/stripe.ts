import Stripe from "stripe";


export const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY ?? '', 
    {
        apiVersion: "2025-08-27.basil",
        appInfo:{
            name: 'Lyriks',
            version: '0.1.0'
        }
    }
);