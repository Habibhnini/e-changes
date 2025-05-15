export async function createCheckoutSession(): Promise<{
  sessionId: string;
  publicKey: string;
}> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Échec de la création de la session Stripe");
  }

  return res.json();
}
