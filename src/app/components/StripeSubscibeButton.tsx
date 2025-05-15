import { loadStripe } from "@stripe/stripe-js";
import React from "react";

interface StripeSubscribeButtonProps {
  buttonText?: string;
  className?: string;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function StripeSubscribeButton({
  buttonText = "S'abonner",
  className = "bg-gray-200 text-gray-700 w-full py-2 rounded-xl hover:bg-gray-300 cursor-pointer",
}: StripeSubscribeButtonProps) {
  const handleStripeSubscription = async () => {
    const stripe = await stripePromise;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la création de la session Stripe."
        );
      }

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (err) {
      console.error("Erreur pendant le paiement Stripe:", err);
      alert(
        "Une erreur s'est produite lors de la tentative de paiement. Veuillez réessayer."
      );
    }
  };

  return (
    <button onClick={handleStripeSubscription} className={className}>
      {buttonText}
    </button>
  );
}
