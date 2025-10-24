"use client";

import { Price, ProductsWithPrice } from "@/types";
import Modal from "./Modal";
import Button from "./Button";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";
import { postData } from "@/libs/helpers";
import { getStripe } from "@/libs/stripeClient";
import useAuthModal from "@/hooks/useAuthModal";
import useSubscribeModal from "@/hooks/useSubscribeModal";

interface SubscribeModalProps {
  products: ProductsWithPrice[];
  subscription?: boolean;
}

const formatPrice = (price: Price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency || "usd",
    minimumFractionDigits: 0,
  }).format((price.unit_amount || 0) / 100);

const SubscribeModal: React.FC<SubscribeModalProps> = ({
  products
}) => {
  const subscribeModal = useSubscribeModal();
  const { user, isLoading, subscription } = useUser();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  
  const onChange = (open: boolean) => {
    if(!open) {
      subscribeModal.onClose();
    }
  }

  const authModal = useAuthModal();
  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!user) { 
      setPriceIdLoading(undefined);
      authModal.onOpen();
      return toast.error("You must be logged in to subscribe");
    }
    if (subscription) {
      setPriceIdLoading(undefined);
      return toast("You are already subscribed");
    }

    try {
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });

      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast.error((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  let content = (
    <div className="text-center">No Products available</div>
  );

  if (products.length) {
    content = (
      <div className="flex flex-col gap-y-4">
        {products.map((product) => {
          const activePrices = product.prices?.filter((p) => p.active) || [];
          if (!activePrices.length) {
            return (
              <div key={product.id} className="text-center">
                No prices available for {product.name}
              </div>
            );
          }

          return activePrices.map((price) => (
            <Button
              key={price.id}
              className="w-full"
              onClick={() => handleCheckout(price)}
              disabled={isLoading || price.id === priceIdLoading}
            >
              {`Subscribe for ${formatPrice(price)}/${price.interval}`}
            </Button>
          ));
        })}
      </div>
    );
  }

  if (subscription) {
    content = (
      <div className="text-center font-semibold">Already subscribed</div>
    );
  }

  return (
    <Modal
      title="Only $8.99/month"
      description="Subscribe for ad-free content and exclusive features."
      isOpen={subscribeModal.isOpen}
      onChange={onChange}
    >
      {content}
    </Modal>
  );
};

export default SubscribeModal;
