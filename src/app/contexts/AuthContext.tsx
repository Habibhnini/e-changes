"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

interface User {
  userInfo: any;
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  energyBalance: number;
  roles: string[];
  verified?: boolean;
  referralCode?: string;
}

interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  referralCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  region?: string;
  country?: string;
  acceptedTerms?: boolean;
  photoId?: File;
  idCardFront?: File;
  idCardBack?: File;
}

interface Notification {
  id: number;
  title: string;
  content: string;
  link: string;
  createdAt: string;
  isRead: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (registrationData: RegistrationData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  uploadIdentityDocuments: (
    photoId: File,
    idCardFront: File,
    idCardBack: File
  ) => Promise<void>;
  completeSubscription: (billingDetails: BillingDetails) => Promise<void>;
  updateUserEnergyBalance: (balance: number) => void;
  notifications: Notification[];
  unreadCount: number;
  setUnreadCount?: (value: number) => void;
  refreshUserProfile: () => Promise<void>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  checkTokenValidity: () => boolean;
  makeAuthenticatedRequest: (
    url: string,
    options?: RequestInit
  ) => Promise<Response>;
}

interface BillingDetails {
  country: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  region?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const eventSourceRef = useRef<EventSource | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const tokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 NEW: Token expiration utility
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // 🔥 NEW: Check token validity
  const checkTokenValidity = (): boolean => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken || isTokenExpired(storedToken)) {
      logout();
      return false;
    }
    return true;
  };

  // 🔥 ENHANCED: Initial token check and periodic validation
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      // Check if token is expired on mount
      if (isTokenExpired(storedToken)) {
        logout();
        return;
      }

      setToken(storedToken);

      // Set up periodic token validation
      tokenCheckIntervalRef.current = setInterval(() => {
        if (!checkTokenValidity()) {
          if (tokenCheckIntervalRef.current) {
            clearInterval(tokenCheckIntervalRef.current);
          }
        }
      }, 600000); // Check every minute
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);

    // Cleanup interval on unmount
    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
    };
  }, []);

  // 🔥 ENHANCED: Fetch user profile with token validation
  const fetchUserProfile = async (currentToken: string) => {
    try {
      const response = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      // Handle token expiration
      if (response.status === 401) {
        logout();
        throw new Error("Token expired");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    const currentToken = localStorage.getItem("token");
    if (currentToken && !isTokenExpired(currentToken)) {
      await fetchUserProfile(currentToken);
    } else {
      logout();
    }
  };

  // 🔥 ENHANCED: API call wrapper with token validation
  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ) => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken || isTokenExpired(currentToken)) {
      logout();
      throw new Error("Token expired");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (response.status === 401) {
      logout();
      throw new Error("Token expired");
    }

    return response;
  };

  // 🔥 ENHANCED: Mercure authentication with token validation
  const authenticateNotificationMercure = async (userId: number) => {
    try {
      const res = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mercure/auth?topic=/user/${userId}/notifications`
      );

      if (!res.ok) throw new Error("Notification Mercure auth failed");

      const data = await res.json();
      return data.token;
    } catch (err) {
      return null;
    }
  };

  // 🔥 ENHANCED: Fetch notifications with token validation
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const res = await makeAuthenticatedRequest("/api/notifications/unread");
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.length);
        }
      } catch (err) {
        console.error("Failed to fetch unread notifications", err);
      }
    };

    if (user?.id && token) {
      fetchUnreadNotifications();
    }
  }, [user?.id, token]);

  useEffect(() => {
    if (!user?.id || !token) return;

    let eventSource: EventSource;

    const connectNotifications = async () => {
      const mercureToken = await authenticateNotificationMercure(user.id);
      if (!mercureToken) return;

      const url = new URL("/api/mercure/proxy", window.location.origin);
      url.searchParams.append("topic", `/user/${user.id}/notifications`);
      url.searchParams.append("authorization", mercureToken);

      eventSource = new EventSource(url.toString());
      eventSource.onmessage = (event) => {
        try {
          const notif = JSON.parse(event.data);
          setNotifications((prev) => [notif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        } catch (err) {
          //  console.error("Error parsing notification:", err);
        }
      };

      eventSource.onerror = (err) => {
        //  console.error("Notification Mercure error", err);
      };
    };

    connectNotifications();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [user?.id, token]);

  // 🔥 ENHANCED: Wallet Mercure with token validation
  const authenticateWalletMercure = async (userId: number) => {
    try {
      const res = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mercure/auth?topic=/user/${userId}/wallet`
      );

      if (!res.ok) {
        throw new Error("Wallet Mercure auth failed");
      }

      const data = await res.json();
      return data.token;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    if (!user?.id || !token) return;

    let isMounted = true;

    const connect = async () => {
      const mercureToken = await authenticateWalletMercure(user.id);
      if (!mercureToken || !isMounted) return;

      const url = new URL("/api/mercure/proxy", window.location.origin);
      url.searchParams.append("topic", `/user/${user.id}/wallet`);
      url.searchParams.append("authorization", mercureToken);

      const eventSource = new EventSource(url.toString());

      eventSource.onopen = () => {};

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (typeof data.balance === "number") {
            updateUserEnergyBalance(data.balance);
          }
        } catch (err) {}
      };

      eventSource.onerror = (err) => {};

      eventSourceRef.current = eventSource;
    };

    connect();

    return () => {
      isMounted = false;
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [user?.id, token]);

  const updateUserEnergyBalance = (newBalance: number) => {
    setUser((prevUser) =>
      prevUser ? { ...prevUser, energyBalance: newBalance } : null
    );

    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      parsed.energyBalance = newBalance;
      localStorage.setItem("user", JSON.stringify(parsed));
    }
  };

  // Login function
  const login = async (email: string, password: string, rememberMe = false) => {
    setLoading(true);
    try {
      const response = await fetch("/api/login_check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      // Only store token in localStorage if rememberMe is true
      if (rememberMe) {
        localStorage.setItem("token", data.token);
      }

      setToken(data.token);
      await fetchUserProfile(data.token);

      // 🔥 NEW: Start token validation interval after successful login
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
      tokenCheckIntervalRef.current = setInterval(() => {
        if (!checkTokenValidity()) {
          if (tokenCheckIntervalRef.current) {
            clearInterval(tokenCheckIntervalRef.current);
          }
        }
      }, 600000);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function - Updated for first step of registration
  const register = async (registrationData: RegistrationData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registrationData.email,
          password: registrationData.password,
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          city: registrationData.city,
          referralCode: registrationData.referralCode,
          acceptedTerms: registrationData.acceptedTerms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);

      // 🔥 NEW: Start token validation interval after successful registration
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
      tokenCheckIntervalRef.current = setInterval(() => {
        if (!checkTokenValidity()) {
          if (tokenCheckIntervalRef.current) {
            clearInterval(tokenCheckIntervalRef.current);
          }
        }
      }, 600000);

      // If we have identity documents, upload them right away
      if (
        registrationData.photoId &&
        registrationData.idCardFront &&
        registrationData.idCardBack
      ) {
        await uploadIdentityDocuments(
          registrationData.photoId,
          registrationData.idCardFront,
          registrationData.idCardBack
        );
      }

      // If we have billing details, complete the subscription
      if (
        registrationData.country &&
        registrationData.addressLine1 &&
        registrationData.postalCode
      ) {
        await completeSubscription({
          country: registrationData.country,
          addressLine1: registrationData.addressLine1,
          addressLine2: registrationData.addressLine2,
          city: registrationData.city || "",
          postalCode: registrationData.postalCode,
          region: registrationData.region,
        });
      }
      await startStripeCheckout(registrationData.email);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const startStripeCheckout = async (email: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/stripe/register-subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Stripe subscription failed");
    }

    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    }
  };

  // Upload identity documents
  const uploadIdentityDocuments = async (
    photoId: File,
    idCardFront: File,
    idCardBack: File
  ) => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      const formData = new FormData();
      formData.append("photoId", photoId);
      formData.append("idCardFront", idCardFront);
      formData.append("idCardBack", idCardBack);

      // 🔥 ENHANCED: Use authenticated request wrapper
      const response = await makeAuthenticatedRequest("/api/verify-identity", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Identity verification failed");
      }

      // Refresh user profile to get updated verification status
      await fetchUserProfile(token);

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  // Complete subscription with billing details
  const completeSubscription = async (billingDetails: BillingDetails) => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      // 🔥 ENHANCED: Use authenticated request wrapper
      const response = await makeAuthenticatedRequest("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billingDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Subscription failed");
      }

      // Refresh user profile to get updated subscription status
      await fetchUserProfile(token);

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  // 🔥 ENHANCED: Logout function
  const logout = () => {
    // Clear token validation interval
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }

    // Close any open EventSource connections
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear storage and state
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);

    // Redirect to login
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        uploadIdentityDocuments,
        completeSubscription,
        isAuthenticated: !!user,
        updateUserEnergyBalance,
        notifications,
        unreadCount,
        setUnreadCount,
        refreshUserProfile,
        setNotifications,
        checkTokenValidity,
        makeAuthenticatedRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
