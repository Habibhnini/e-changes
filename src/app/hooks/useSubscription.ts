import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect, useState } from "react";

export function useSubscriptionStatus() {
  const { token, checkTokenValidity } = useAuth(); // Now includes checkTokenValidity
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      // Check token validity before making request
      if (!token || !checkTokenValidity()) {
        setLoading(false);
        return; // logout() will be called automatically by checkTokenValidity
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/status`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Use token from context
              "Content-Type": "application/json",
            },
          }
        );

        // If token is expired, the AuthContext will handle logout automatically
        if (res.status === 401) {
          return; // Token expired, user will be redirected
        }

        const data = await res.json();
        if (res.ok) {
          setIsActive(data.isActive);
        } else {
          setIsActive(false);
        }
      } catch (err) {
        console.error("Subscription status fetch error:", err);
        setIsActive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [token, checkTokenValidity]);

  return { isActive, loading };
}
