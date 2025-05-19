// app/subscription/page.tsx or any component
"use client";

import { getStripe } from "../utils/stripe"; // the utility that calls loadStripe

export default function SubscribeButton() {
  const handleSubscribe = async () => {
    const res = await fetch("http://51.83.99.222:9000/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    const stripe = await getStripe();
    await stripe!.redirectToCheckout({ sessionId: data.sessionId });
  };

  return (
    <button
      onClick={handleSubscribe}
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
    >
      S’abonner
    </button>
  );
}
