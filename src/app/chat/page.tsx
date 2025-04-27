"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { BsPaperclip } from "react-icons/bs";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

// Get auth token for API requests
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Create headers with auth token
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export default function ChatPage() {
  // Router and params
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedTransactionId = searchParams.get("transaction") || null;

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
  const [currentUser, setCurrentUser] = useState<any>(null);

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
      const response = await fetch("/api/mercure/auth");

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.token) {
        throw new Error("No token received");
      }

      return data.token;
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

      eventSource.onopen = () => {
        setConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "new_message" && data.message) {
            // Only add if it's not from current user
            if (data.message.sender.id !== currentUser?.id) {
              setMessages((prev) => {
                // Check for duplicates
                if (prev.some((m) => m.id === data.message.id)) {
                  return prev;
                }

                // Scroll to bottom after state update
                setTimeout(scrollToBottom, 100);

                return [...prev, data.message];
              });
            }
          }
        } catch (error) {
          // Silently handle parsing errors
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        setError("Connection error. Please try refreshing the page.");
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      setError("Connection setup failed: " + (err as Error).message);
    }
  }

  // Add polling fallback for when Mercure isn't working
  useEffect(() => {
    if (!selectedTransactionId) return;

    // Poll for new messages every few seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/messages/transaction/${selectedTransactionId}`,
          { headers: getAuthHeaders() }
        );

        if (response.ok) {
          const data = await response.json();
          // Update messages, but avoid flickering by preserving optimistic messages
          setMessages((prevMessages) => {
            // Find messages that only exist in the current state (optimistic ones)
            const tempMessages = prevMessages.filter(
              (prevMsg) =>
                !data.messages.some((newMsg) => newMsg.id === prevMsg.id)
            );

            // Only scroll if there are new messages
            if (
              data.messages.length >
              prevMessages.length - tempMessages.length
            ) {
              setTimeout(scrollToBottom, 100);
            }

            // Combine server messages with any temporary ones
            return [...data.messages, ...tempMessages];
          });
        }
      } catch (error) {
        // Silently handle polling errors
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [selectedTransactionId]);

  // Load current user profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          router.push("/login?redirect=/chat");
          return;
        }

        if (!response.ok) throw new Error("Failed to load user profile");

        const data = await response.json();
        setCurrentUser({
          id: data.id,
          name: data.fullName || data.email,
          profileImage: data.profileImage || "/profile-placeholder.jpg",
        });
      } catch (err) {
        setError("Could not load your profile");
      }
    };

    fetchCurrentUser();
  }, [router]);

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
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/messages/conversations", {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          router.push("/login?redirect=/chat");
          return;
        }

        if (!response.ok) throw new Error("Failed to load conversations");

        const data = await response.json();
        setConversations(data.conversations);

        // If we have conversations but no selected transaction, select the first one
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
  }, [selectedTransactionId, router]);

  // Load messages for selected transaction
  useEffect(() => {
    if (!selectedTransactionId) return;

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
          router.push("/login?redirect=/chat");
          return;
        }

        if (!response.ok) throw new Error("Failed to load messages");

        const data = await response.json();
        setMessages(data.messages);
        setService(data.service);
        setTransaction(data.transaction);
        setOtherUser(data.otherUser);
        setLoading(false);

        // If on mobile, switch to chat view when data is loaded
        if (isMobile && mobileView === "list") {
          setMobileView("chat");
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
  }, [selectedTransactionId, isMobile, mobileView, router]);

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
      if (messageInput.trim() && selectedTransactionId) {
        // Store the message content before clearing input
        const messageContent = messageInput;

        // Optimistically add message to UI
        const tempMessage = {
          id: `temp-${Date.now()}`, // temporary ID
          content: messageContent,
          sender: {
            id: currentUser?.id || 0,
            name: currentUser?.name || "Current User",
            profileImage:
              currentUser?.profileImage || "/profile-placeholder.jpg",
            isYou: true,
          },
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        // Add message to UI immediately
        setMessages((prev) => [...prev, tempMessage]);

        // Clear input
        setMessageInput("");

        // Refocus the input after sending
        setTimeout(() => {
          if (messageInputRef.current) {
            messageInputRef.current.focus();
          }
        }, 0);

        // Scroll to bottom after sending message
        setTimeout(scrollToBottom, 100);

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
                `/login?redirect=/chat?transaction=${selectedTransactionId}`
              );
            }, 2000);
            return;
          }

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
        } catch (err) {
          // Remove the optimistic message if it failed to send
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== tempMessage.id)
          );
          setError("Failed to send message");
        }
      }
    },
    [messageInput, selectedTransactionId, router, currentUser]
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

  // Mobile navigation handlers
  const handleOpenChat = useCallback(
    (conversationId: number) => {
      if (conversationId.toString() !== selectedTransactionId) {
        // Navigate to the selected conversation
        router.push(`/chat?transaction=${conversationId}`, { scroll: false });
      } else {
        setMobileView("chat");
      }
    },
    [selectedTransactionId, router]
  );

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
  if (loading && !service && selectedTransactionId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38AC8E]"></div>
      </div>
    );
  }

  // Render conversations list
  const renderConversationsList = () => (
    <div
      className={`bg-white overflow-y-auto ${
        isMobile ? "w-full" : isTablet ? "w-1/3" : "w-1/4"
      }`}
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
                    src="/placeholder.png"
                    alt={convo.user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
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
                            src="/placeholder.png"
                            alt={message.sender.name}
                            width={40}
                            height={40}
                            className="rounded-full"
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
                  type="button"
                  className="p-2 text-gray-900 hover:text-gray-700 cursor-pointer"
                >
                  <BsPaperclip size={24} />
                </button>

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
            className="flex items-center text-gray-700 font-semibold text-[15px]"
          >
            <IoChevronBack className="mr-1" /> Retour
          </button>
          <h2 className="text-base font-medium mx-auto">
            {service?.title || "Service"}
          </h2>
        </div>
      )}

      <div className="p-4">
        {!isMobile && !isTablet && (
          <h2 className="font-medium text-lg mb-3">À propos de cet échange</h2>
        )}

        {service && (
          <>
            {transaction && (
              <div className="mb-4 p-3 rounded-lg border border-gray-200">
                <div className="font-medium mb-2">Statut de la transaction</div>
                <div
                  className={`text-sm font-medium ${
                    transaction.status === "created"
                      ? "text-blue-500"
                      : transaction.status === "negotiation"
                      ? "text-purple-500"
                      : transaction.status === "success"
                      ? "text-green-500"
                      : transaction.status === "delivery"
                      ? "text-orange-500"
                      : transaction.status === "validation"
                      ? "text-yellow-500"
                      : transaction.status === "completed"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {formatTransactionStatus(transaction.status)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Créée le {formatMessageDate(transaction.createdAt)}
                </div>
                <div className="text-sm mt-2">
                  <span className="text-gray-600">Montant:</span>{" "}
                  {transaction.energyAmount}
                  <Image
                    src="/coin.png"
                    alt="Energy"
                    width={20}
                    height={20}
                    className="inline-block ml-1 h-4 w-4"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-medium">{service.title}</h3>
              <p className="text-[15px] text-gray-400 mt-1">
                {service.fullDescription}
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex justify-between">
                <span className="text-[15px] text-gray-600">Localisation</span>
                <span className="text-[15px] font-medium">
                  {service.details?.location || "Non spécifié"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[15px] text-gray-600">Durée</span>
                <span className="text-[15px] font-medium">
                  {service.details?.duration || "Non spécifié"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[15px] text-gray-600">Prix</span>
                <span className="text-[15px] font-medium">{service.price}</span>
              </div>
            </div>

            <div className="mt-6 border-t pt-4 border-gray-300">
              <div
                className={`flex ${
                  isNarrowDesktop ? "flex-col" : "flex-row"
                } gap-2 ${isNarrowDesktop ? "" : "justify-center"}`}
              >
                <button
                  className={`px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors cursor-pointer ${
                    isNarrowDesktop ? "w-full" : ""
                  }`}
                >
                  Signaler
                </button>
                <button
                  className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors cursor-pointer ${
                    isNarrowDesktop ? "w-full" : ""
                  }`}
                >
                  Annuler
                </button>
                <button
                  className={`px-4 py-2 bg-[#38AC8E] text-white rounded-lg text-sm hover:bg-teal-600 transition-colors cursor-pointer ${
                    isNarrowDesktop ? "w-full" : ""
                  }`}
                >
                  Valider
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Render based on screen size and view state
  if (isMobile) {
    // Mobile view
    return (
      <div className="h-screen w-full">
        {renderConnectionStatus()}
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
        {renderConnectionStatus()}
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
        {renderConnectionStatus()}

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
