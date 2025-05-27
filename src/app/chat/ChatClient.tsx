"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { BsPaperclip } from "react-icons/bs";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import TransactionDetails from "./TransactionDetails";
import { useAuth } from "../contexts/AuthContext";
import TransactionPropositionDetails from "./TransactionPropositionDetails";

export default function ChatPage() {
  // Router and params
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedTransactionId = searchParams.get("transaction") || null;
  const { user: currentUser, token } = useAuth();
  // WebSocket reference - single connection for simplicity
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connection status
  const [connected, setConnected] = useState(false);

  // Refs
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // UI states
  const [messageInput, setMessageInput] = useState("");
  const [mobileView, setMobileView] = useState("list"); // "list", "chat", "details"
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // Data states
  const [messages, setMessages] = useState<any[]>([]);
  const [service, setService] = useState<any>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const previousAmountRef = useRef<number | null>(null);
  const [initialNavDone, setInitialNavDone] = useState(false);
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };

  // Check screen size
  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
  const isNarrowDesktop = screenSize.width >= 1024 && screenSize.width < 1290;

  // Helper function to scroll chat to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    if (!selectedTransactionId) return;

    (async () => {
      try {
        const res = await fetch(`/api/transactions/${selectedTransactionId}`, {
          method: "GET",
          headers: getAuthHeaders(), // ← adds Authorization: Bearer <token>
        });
        if (!res.ok) throw new Error(res.statusText);
        const { transaction } = await res.json();
        setTransaction(transaction);
      } catch (err) {
        // console.error("Failed to load transaction:", err);
        setError("Impossible de charger la transaction");
      }
    })();
  }, [selectedTransactionId]);

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper function to get Mercure authentication token
  async function authenticateMercure() {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/mercure/auth?transaction=${selectedTransactionId}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(), // Bearer <app-jwt> etc.
      });

      if (!response.ok) {
        throw new Error(`Mercure auth failed: ${response.status}`);
      }
      const data = await response.json();
      return data.token as string;
    } catch (err) {
      setError("Authentication failed: " + (err as Error).message);
      return null;
    }
  }

  // Connect to Mercure for real-time updates
  async function connectToMercure() {
    if (!selectedTransactionId) {
      return;
    }

    // Close previous connection if it exists
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Authenticate first
    const token = await authenticateMercure();
    if (!token) return;

    try {
      // Use the proxy with the correct topic
      const url = new URL("/api/mercure/proxy", window.location.origin);
      url.searchParams.append(
        "topic",
        `chat/transaction/${selectedTransactionId}`
      );
      url.searchParams.append("authorization", token);

      const eventSource = new EventSource(url.toString());

      // In your ChatPage.js component, add these debugging logs:
      // Check if the EventSource is being created properly

      // In the onopen handler, log successful connection
      eventSource.onopen = () => {
        setConnected(true);
        setError(null);
      };

      // In the onmessage handler, log ALL received messages
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // inside eventSource.onmessage in ChatPage.tsx
          if (data.type === "transaction_updated" && data.transaction) {
            setTransaction((prev: any) => {
              const updated = {
                ...prev,
                ...data.transaction,
              };

              // Detect amount change and show success popup
              if (
                typeof previousAmountRef.current === "number" &&
                data.transaction.energyAmount !== previousAmountRef.current
              ) {
                setSuccessMessage(
                  "✅ Le montant a été mis à jour avec succès."
                );
                setTimeout(() => setSuccessMessage(null), 3000);
              }

              previousAmountRef.current = data.transaction.energyAmount;

              return updated;
            });
          }

          if (data.type === "new_message" && data.message) {
            // ← SKIP messages you yourself just sent
            if (data.message.sender.id === currentUser?.id) {
              return;
            }

            // Then the existing dedupe logic
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) {
                return prev;
              }

              setTimeout(scrollToBottom, 100);
              return [
                ...prev,
                {
                  ...data.message,
                  sender: {
                    ...data.message.sender,
                    isYou: data.message.sender.id === currentUser?.id,
                  },
                },
              ];
            });
          } else {
          }
        } catch (error) {}
      };

      // Log all errors
      eventSource.onerror = (error) => {
        setConnected(false);
        setError("Connection error. Please try refreshing the page.");
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      setError("Connection setup failed: " + (err as Error).message);
    }
  }

  // Add polling fallback for when Mercure isn't working

  // Connect to Mercure when the component mounts or transaction changes
  useEffect(() => {
    if (!selectedTransactionId || !currentUser) return;

    connectToMercure();

    // Clean up on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [selectedTransactionId, currentUser]);

  // Load conversation list
  useEffect(() => {
    if (!token || !currentUser) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/messages/conversations", {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          router.push("/auth?redirect=/chat");
          return;
        }

        const data = await response.json();
        setConversations(data.conversations);

        if (data.conversations.length > 0 && !selectedTransactionId) {
          router.push(`/chat?transaction=${data.conversations[0].id}`, {
            scroll: false,
          });
        }
      } catch (err) {
        setError("Could not load conversation list");
      }
    };

    fetchConversations();
  }, [token, currentUser, selectedTransactionId, router]);

  // Load messages for selected transaction
  useEffect(() => {
    if (!selectedTransactionId || !token || !currentUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/messages/transaction/${selectedTransactionId}`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (response.status === 401) {
          router.push("/auth?redirect=/chat");
          return;
        }

        if (!response.ok) throw new Error("Failed to load messages");

        const data = await response.json();
        setMessages(data.messages);
        setService(data.service);
        setTransaction((prev: any) => {
          const updated = {
            ...prev,
            ...data.transaction,
          };

          // Detect amount change and show success popup
          if (
            typeof previousAmountRef.current === "number" &&
            data.transaction.energyAmount !== previousAmountRef.current
          ) {
            setSuccessMessage("✅ Le montant a été mis à jour avec succès.");
            setTimeout(() => setSuccessMessage(null), 3000);
          }

          previousAmountRef.current = data.transaction.energyAmount;

          return updated;
        });

        setOtherUser(data.otherUser);
        setLoading(false);

        // MODIFIED: Only automatically switch to chat on first load
        if (isMobile && mobileView === "list" && !initialNavDone) {
          setMobileView("chat");
          setInitialNavDone(true);
        }

        // Scroll to bottom after messages load
        setTimeout(scrollToBottom, 100);

        // Mark messages as read
        markMessagesAsRead(selectedTransactionId);
      } catch (err) {
        setError("Could not load messages");
        setLoading(false);
      }
    };

    fetchMessages();
  }, [
    token,
    currentUser,
    selectedTransactionId,
    isMobile,
    mobileView,
    initialNavDone,
  ]);

  // 3. Make sure initial view is correctly set
  useEffect(() => {
    // On initial load with no transaction, default to list view on mobile
    if (isMobile && !selectedTransactionId) {
      setMobileView("list");
    }
  }, []);

  // Your existing navigation handlers will work fine with this approach

  const handleOpenChat = useCallback(
    (conversationId: number) => {
      if (conversationId.toString() !== selectedTransactionId) {
        // Navigate to the selected conversation
        router.push(`/chat?transaction=${conversationId}`, { scroll: false });
        // Reset initial nav when changing transactions
        setInitialNavDone(false);
      } else {
        setMobileView("chat");
      }
    },
    [selectedTransactionId, router]
  );
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read
  const markMessagesAsRead = async (transactionId: string) => {
    try {
      await fetch(`/api/messages/transaction/${transactionId}/read`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } catch (err) {
      // Silently handle error
    }
  };

  // Send a message
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!messageInput.trim() || !selectedTransactionId) return;

      const messageContent = messageInput;

      // 1) Build a proper display name
      const nameParts = [currentUser?.firstName, currentUser?.lastName].filter(
        Boolean
      );
      const name =
        nameParts.length > 0
          ? nameParts.join(" ")
          : (currentUser?.lastName && currentUser?.firstName) || "Unknown";

      // 2) Build a valid profileImage string
      const photoPath = currentUser?.userInfo?.photoIdPath ?? "";
      let profileImage = "";
      if (photoPath) {
        if (photoPath.startsWith("http")) {
          profileImage = photoPath;
        } else if (photoPath.startsWith("/")) {
          profileImage = photoPath;
        } else {
          const apiRoot = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
          profileImage = apiRoot ? `${apiRoot}/${photoPath}` : photoPath;
        }
      }

      // 3) Create the temp message
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        sender: {
          id: currentUser!.id,
          name,
          profileImage, // guaranteed to be a string (maybe empty)
          isYou: true,
        },
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      // Optimistically add it
      setMessages((prev) => [...prev, tempMessage]);
      setMessageInput("");
      scrollToBottom();

      try {
        const response = await fetch(
          `/api/messages/transaction/${selectedTransactionId}/reply`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ content: messageContent }),
          }
        );

        if (response.status === 401) {
          setError("Your session has expired. Please log in again.");
          setTimeout(() => {
            router.push(
              `/auth?redirect=/chat?transaction=${selectedTransactionId}`
            );
          }, 2000);
          return;
        }

        if (!response.ok) throw new Error("Failed to send message");

        const sentMessage = await response.json();

        // Replace temp with the real message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? {
                  ...sentMessage,
                  sender: { ...sentMessage.sender, isYou: true },
                }
              : msg
          )
        );
      } catch (err) {
        // Remove the temp if it failed
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        setError("Failed to send message");
      }
    },
    [messageInput, selectedTransactionId, currentUser, router]
  );

  // Handle message input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessageInput(e.target.value);
    },
    []
  );

  // Generate stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`w-3 h-3 ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  // Format date for messages
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${
      [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ][date.getMonth()]
    } ${date.getFullYear()}, ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  // Format transaction status
  const formatTransactionStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      created: "Créée",
      negotiation: "En négociation",
      success: "Acceptée",
      delivery: "En livraison",
      validation: "En validation",
      completed: "Terminée",
      failure: "Échouée",
      cancelled: "Annulée",
    };

    return statusMap[status] || status;
  };

  // Format last activity to relative time
  const formatLastActivity = (activity: string): string => {
    if (activity === "Pas encore de messages") return activity;

    try {
      const date = new Date(activity);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "il y a quelques secondes";
      if (diffInSeconds < 3600)
        return `il y a ${Math.floor(diffInSeconds / 60)} minutes`;
      if (diffInSeconds < 86400)
        return `il y a ${Math.floor(diffInSeconds / 3600)} heures`;
      return `il y a ${Math.floor(diffInSeconds / 86400)} jours`;
    } catch (e) {
      return activity;
    }
  };

  const handleBackToList = useCallback(() => {
    setMobileView("list");
  }, []);

  const handleOpenDetails = useCallback(() => {
    setMobileView("details");
  }, []);

  const handleBackToChat = useCallback(() => {
    setMobileView("chat");
  }, []);

  // Focus input when mobile view changes to chat
  useEffect(() => {
    if (mobileView === "chat" && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [mobileView]);

  // Debug indicator - small and non-intrusive
  const renderConnectionStatus = () => (
    <div className="fixed bottom-2 right-2 bg-white border border-gray-300 rounded-full py-1 px-3 text-xs shadow-md">
      {connected ? (
        <span className="text-green-600">●</span>
      ) : (
        <span className="text-red-600">●</span>
      )}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38AC8E]"></div>
      </div>
    );
  }

  // Render conversations list
  const renderConversationsList = () => (
    <div
      className={`bg-white ${
        isMobile ? "w-full" : isTablet ? "w-1/3" : "w-1/4"
      } h-screen overflow-y-auto`}
    >
      <div className="p-4 border-gray-200">
        <div className="relative">
          <select className="w-full p-2 pl-4 pr-8 text-sm rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0 border-0 bg-gray-50">
            <option>Tous les échanges</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Chat list */}
      <div className="p-2">
        {conversations.length === 0 ? (
          <div className="p-3 text-gray-500 text-center">
            Aucune conversation
          </div>
        ) : (
          conversations.map((convo) => (
            <div
              key={convo.id}
              className={`p-3 rounded-xl cursor-pointer ${
                convo.id.toString() === selectedTransactionId
                  ? "bg-gray-100"
                  : "hover:bg-gray-50"
              } mb-2`}
              onClick={() => handleOpenChat(convo.id)}
            >
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      convo.user.profileImage
                        ? `${process.env.NEXT_PUBLIC_API_URL}${convo.user.profileImage}`
                        : "/placeholder.png"
                    }
                    alt={convo.user.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-base font-medium flex items-center">
                    {convo.user.name}
                    {convo.unreadCount > 0 && (
                      <span className="ml-2 bg-[#38AC8E] text-white text-xs rounded-full px-2 py-1">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatLastActivity(convo.lastActivity)}
                  </div>
                  <div className="text-sm text-teal-500 mt-1 truncate">
                    {convo.service.title}
                  </div>
                  {convo.transaction && (
                    <div className="text-xs text-gray-400 mt-1">
                      {formatTransactionStatus(convo.transaction.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render chat view
  const renderChatView = () => (
    <div
      className={`flex flex-col h-full bg-white ${
        isMobile
          ? "w-full"
          : isTablet
          ? "flex-1"
          : "flex-1 mx-4 my-4 rounded-3xl border border-gray-300"
      } overflow-hidden`}
    >
      {/* Mobile/Tablet header */}
      {(isMobile || isTablet) && (
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <button
            onClick={handleBackToList}
            className="flex items-center text-gray-700 font-semibold text-[15px]"
          >
            <IoChevronBack className="mr-1" /> Retour
          </button>
          <button
            onClick={handleOpenDetails}
            className="flex items-center text-gray-700 truncate max-w-[60%]"
          >
            <span className="truncate text-[15px] font-bold">
              À propos de cet échange
            </span>{" "}
            <IoChevronForward className="ml-1 flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Empty state when no transaction is selected */}
      {!selectedTransactionId && (
        <div className="flex justify-center items-center h-full text-gray-500 flex-col">
          <div className="text-gray-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="text-center px-4">
            Sélectionnez une conversation pour commencer à chatter
          </span>
        </div>
      )}

      {/* Chat content when a transaction is selected */}
      {selectedTransactionId && (
        <>
          {/* Chat header */}
          <div className="py-3 bg-white">
            <div className="flex items-center justify-center mt-5 px-4 md:px-8">
              <div className="border-t border-gray-300 w-1/5"></div>
              <span
                className={`text-xs md:text-sm text-gray-600 px-2 md:px-4 text-center ${
                  isMobile || isTablet ? "" : "whitespace-nowrap"
                }`}
              >
                Pour plus de sécurité et de protection, veillez à conserver les
                communications
              </span>
              <div className="border-t border-gray-300 w-1/5"></div>
            </div>
          </div>

          {/* Chat messages */}
          <div
            ref={chatContainerRef}
            className={`${
              isMobile || isTablet
                ? "h-[calc(100vh-300px)]"
                : "h-[calc(100vh-293px)]"
            } overflow-y-auto p-4 chat-messages overflow-x-hidden`}
          >
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <span>Envoyez maintenant votre premier message</span>
              </div>
            ) : (
              <div className="space-y-8">
                {messages.map((message) => (
                  <div key={message.id} className="flex flex-col">
                    {/* All messages show the actual sender name */}
                    <div className="flex">
                      <div className="mr-3 flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                          <Image
                            src={
                              message.sender.profileImage
                                ? `${process.env.NEXT_PUBLIC_API_URL}${message.sender.profileImage}`
                                : "/placeholder.png"
                            }
                            alt={message.sender.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center mb-1">
                          <div className="text-sm font-medium mr-2">
                            {message.sender.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatMessageDate(message.createdAt)}
                          </div>
                        </div>
                        <div
                          className={`p-1 bg-white font-light text-[15px] break-words whitespace-pre-wrap w-full overflow-hidden ${
                            message.sender.isYou ? "text-teal-800" : ""
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="p-3 bg-white border-gray-200">
            <form onSubmit={handleSendMessage} className="flex flex-col">
              <textarea
                ref={messageInputRef}
                placeholder="Envoyer votre message..."
                className="w-full py-2 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  // Send message on Enter key (without Shift key for new line)
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // Prevent new line
                    handleSendMessage(e as unknown as React.FormEvent);
                  }
                }}
                rows={1}
                style={{
                  height: "auto",
                  minHeight: "50px",
                  maxHeight: "120px",
                }}
              />

              <div className="flex justify-between mt-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none text-sm cursor-pointer"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );

  // Render service details
  const renderServiceDetails = () => (
    <div
      className={`bg-white overflow-y-auto ${
        isMobile ? "w-full" : isTablet ? "w-1/3" : "w-1/4"
      }`}
    >
      {/* Mobile/Tablet header */}
      {(isMobile || isTablet) && (
        <div className="flex items-center p-3 border-b border-gray-200">
          <button
            onClick={handleBackToChat}
            className="flex items-center text-gray-700 font-semibold text-[15px] cursor-pointer"
          >
            <IoChevronBack className="mr-1" /> Retour
          </button>
          <h2 className="text-base font-medium mx-auto">
            {service?.title || "Service"}
          </h2>
        </div>
      )}
      {successMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-green-600 text-white text-sm rounded-lg shadow-lg animate-fade-in-out">
          {successMessage}
        </div>
      )}

      {transaction && service && service.vendor && (
        <TransactionDetails
          transactionId={selectedTransactionId!}
          service={service}
          transaction={transaction}
          currentUser={currentUser}
          screenSize={screenSize}
          formatMessageDate={formatMessageDate}
          formatTransactionStatus={formatTransactionStatus}
          onUpdateTransaction={(updatedTx) => setTransaction(updatedTx)}
          successMessage={successMessage}
        />
      )}

      {/* Use the new TransactionDetails component
      <TransactionDetails
        transactionId={selectedTransactionId}
        service={service}
        transaction={transaction}
        otherUser={otherUser}
        currentUser={currentUser}
        onSendMessage={async (content) => {
          // Create a programmatic send function
          const tempMessage = {
            id: `temp-${Date.now()}`,
            content: content,
            sender: {
              id: currentUser?.id || 0,
              name:
                (currentUser?.lastName && currentUser.firstName) ||
                "Current User",
              profileImage:
                currentUser?.userInfo?.profileImage ||
                "/profile-placeholder.jpg",
              isYou: true,
            },
            createdAt: new Date().toISOString(),
            isRead: false,
          };

          // Add message to UI immediately
          setMessages((prev) => [...prev, tempMessage]);

          try {
            const response = await fetch(
              `/api/messages/transaction/${selectedTransactionId}/reply`,
              {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ content }),
              }
            );

            if (!response.ok) throw new Error("Failed to send message");

            const sentMessage = await response.json();

            // Replace the temporary message with the server response
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === tempMessage.id
                  ? {
                      ...sentMessage,
                      sender: {
                        ...sentMessage.sender,
                        isYou: true,
                      },
                    }
                  : msg
              )
            );

            // Scroll to bottom after sending message
            setTimeout(scrollToBottom, 100);
          } catch (err) {
            // Remove the optimistic message if it failed to send
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== tempMessage.id)
            );
            console.error("Failed to send message:", err);
          }
        }}
        screenSize={screenSize}
        formatMessageDate={formatMessageDate}
        formatTransactionStatus={formatTransactionStatus}
        onUpdateTransaction={(updatedTransaction) => {
          setTransaction(updatedTransaction);
        }}
      />
       */}
    </div>
  );

  // Render based on screen size and view state
  if (isMobile) {
    // Mobile view
    return (
      <div className="h-screen w-full">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        {mobileView === "list" && renderConversationsList()}
        {mobileView === "chat" && renderChatView()}
        {mobileView === "details" && renderServiceDetails()}
      </div>
    );
  } else if (isTablet) {
    // Tablet view
    return (
      <div className="flex h-full w-full">
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        )}
        {mobileView === "list" && renderConversationsList()}
        {mobileView === "chat" && renderChatView()}
        {mobileView === "details" && renderServiceDetails()}
      </div>
    );
  } else {
    // Desktop view
    return (
      <div className="flex h-full max-w-[82%] mx-auto relative">
        {/* Left sidebar - Chat list */}
        {renderConversationsList()}

        {/* Middle section - Current chat */}
        {renderChatView()}

        {/* Right sidebar - Service info */}
        {renderServiceDetails()}
      </div>
    );
  }
}
