import { useAuth } from "@/app/contexts/AuthContext"; // adjust path if needed
import { useEffect, useState } from "react";

export function useSubscriptionStatus() {
  const { token } = useAuth(); // 👈 use this
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/status`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        if (res.ok) {
          setIsActive(data.isActive);
        }
      } catch (err) {
        console.error("Erreur de souscription:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [token]);

  return { isActive, loading };
}
