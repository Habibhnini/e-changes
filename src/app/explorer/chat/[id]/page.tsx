"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { BsPaperclip } from "react-icons/bs";
import {
  IoChevronBack,
  IoChevronForward,
  IoInformationCircleOutline,
} from "react-icons/io5";

export default function ServiceChatPage() {
  // Use the useParams hook to get the id parameter
  const params = useParams();
  const id = params?.id as string;

  // Input ref for maintaining focus
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // State for the message input
  const [messageInput, setMessageInput] = useState("");

  // State for mobile view management
  const [mobileView, setMobileView] = useState("list"); // "list", "chat", "details"
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // Define message type
  type Message = {
    id: number;
    text: string;
    sender: string;
    timestamp: Date;
  };

  // Initialize with empty messages array
  const [messages, setMessages] = useState<Message[]>([]);

  // Check if we're on mobile or tablet
  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
  const isNarrowDesktop = screenSize.width >= 1024 && screenSize.width < 1290;

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

  // Mock service data
  const service = {
    id: id,
    title: "Nom du service",
    category: "100 énergies",
    postedTime: "il y a 15 heures",
    details: {
      type: "Vélo",
      quantity: "1 PCE",
      material: "Non défini",
      condition: "Comme neuf",
      location: "Vichy",
    },
    fullDescription:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga",
    user: {
      name: "Julie A",
      profileImage: "/profile-placeholder.jpg",
      announcements: 2,
      rating: 4,
    },
    price: "60€",
    duration: "1H",
  };

  // Mock conversations list
  const conversations = [
    {
      id: 1,
      user: "Julie A",
      service: "Nom du service",
      hasNewMessages: false,
      lastActivity: "Pas encore de messages",
    },
  ];

  // Array of random responses that Julie might send
  const randomResponses = [
    "Bonjour ! Oui, bien sûr, nous pouvons discuter du prix. Qu'aviez-vous en tête ?",
    "Je vous remercie pour votre message. Le prix est négociable dans une certaine mesure. Quelle est votre proposition ?",
    "Merci de votre intérêt ! Je suis ouvert(e) à la discussion. Pouvez-vous me préciser vos besoins exactement ?",
    "Bonjour ! Je serais ravi(e) de discuter des détails avec vous. Quand seriez-vous disponible ?",
    "Absolument, nous pouvons trouver un arrangement qui convient à tous les deux. Avez-vous une idée de budget ?",
    "Bien sûr ! Le service peut être adapté selon vos besoins. Dites-moi ce qui vous intéresse le plus.",
    "Je suis flexible sur les conditions. Qu'est-ce qui vous conviendrait le mieux ?",
    "Bonjour et merci pour votre message ! Le prix affiché est indicatif, nous pouvons certainement en discuter.",
    "Je suis content(e) de votre intérêt pour mon service. Avez-vous des questions spécifiques ?",
    "Bien entendu, je suis ouvert(e) à la négociation. Avez-vous une date précise en tête pour le service ?",
  ];

  // Function to generate a random response from Julie
  const generateRandomResponse = useCallback(() => {
    // Get a random response from the array
    const randomIndex = Math.floor(Math.random() * randomResponses.length);
    const responseText = randomResponses[randomIndex];

    // Create and add the new message from Julie
    const newMessage = {
      id: messages.length + 2, // +2 because we'll add user message first
      text: responseText,
      sender: "julie",
      timestamp: new Date(Date.now() + 2000), // Set timestamp 2 seconds in the future
    };

    return newMessage;
  }, [messages.length, randomResponses]);

  // Handle sending a new message
  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (messageInput.trim()) {
        // Add the user's message
        const userMessage: Message = {
          id: messages.length + 1,
          text: messageInput,
          sender: "user",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setMessageInput("");

        // Refocus the input after sending
        setTimeout(() => {
          if (messageInputRef.current) {
            messageInputRef.current.focus();
          }
        }, 0);

        // Scroll to bottom after sending message
        setTimeout(() => {
          const chatContainer = document.querySelector(".chat-messages");
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);

        // Simulate Julie's response after a short delay
        setTimeout(() => {
          const julieResponse = generateRandomResponse();
          setMessages((prevMessages) => [...prevMessages, julieResponse]);

          // Scroll to bottom again after receiving response
          setTimeout(() => {
            const chatContainer = document.querySelector(".chat-messages");
            if (chatContainer) {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          }, 100);
        }, 1500); // Delay of 1.5 seconds before Julie responds
      }
    },
    [messageInput, messages.length, generateRandomResponse]
  );

  // Handle input change memoized to prevent recreating on every render
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessageInput(e.target.value);
    },
    []
  );

  // Generate stars based on rating
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

  // Format date to display
  const formatMessageDate = (date: Date) => {
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

  // Mobile navigation handlers - memoized to prevent recreation
  const handleOpenChat = useCallback(() => {
    setMobileView("chat");
  }, []);

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

  // Ensure focus is set on input when needed
  useEffect(() => {
    // Focus when component mounts if we're already in chat view
    if (mobileView === "chat" && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [mobileView]);

  // Render the conversations list component
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
        {conversations.map((convo) => (
          <div
            key={convo.id}
            className="p-3 rounded-xl cursor-pointer bg-gray-100 mb-2"
            onClick={handleOpenChat}
          >
            <div className="flex items-start">
              <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/placeholder.png"
                  alt={convo.user}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="text-base font-medium">{convo.user}</div>
                <div className="text-sm text-gray-400">
                  {convo.lastActivity}
                </div>
                <div className="text-sm text-teal-500 mt-1">
                  {convo.service}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render the chat view component
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
            <IoChevronBack className="mr-1  " /> Retour
          </button>
          <button
            onClick={handleOpenDetails}
            className="flex items-center text-gray-700 truncate max-w-[60%]"
          >
            <span className="truncate text-[15px] font-bold ">
              À propos de cet échange
            </span>{" "}
            <IoChevronForward className="ml-1 flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Chat header - Modified to make text wrap on mobile/tablet but not desktop */}
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
                {message.sender === "user" ? (
                  // User message
                  <div className="flex">
                    <div className="mr-3 flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                        <Image
                          src="/placeholder.png"
                          alt="Your profile"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center mb-1">
                        <div className="text-sm font-medium mr-2">Vous</div>
                        <div className="text-xs text-gray-500">
                          {formatMessageDate(message.timestamp)}
                        </div>
                      </div>
                      <div className="p-1 bg-white font-light text-[15px] break-words whitespace-pre-wrap w-full overflow-hidden">
                        {message.text}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Receiver message (Julie)
                  <div className="flex">
                    <div className="mr-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                        <Image
                          src="/placeholder.png"
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <div className="text-sm font-medium mr-2">Julie A</div>
                        <div className="text-xs text-gray-500">
                          {formatMessageDate(message.timestamp)}
                        </div>
                      </div>
                      <div className="p-1 bg-white font-light text-[15px] ">
                        {message.text}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat input - positioned at the bottom */}
      <div className="p-3 bg-white border-gray-200">
        <form onSubmit={handleSendMessage} className="flex flex-col">
          <textarea
            ref={messageInputRef}
            placeholder="Envoyer votre message..."
            className="w-full py-2 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            value={messageInput}
            onChange={handleInputChange}
            rows={1}
            style={{ height: "auto", minHeight: "50px", maxHeight: "120px" }}
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
    </div>
  );

  // Render the service details component
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
            className="flex items-center text-gray-700 font-semibold text-[15px] "
          >
            <IoChevronBack className="mr-1" /> Retour
          </button>
          <h2 className="text-base font-medium mx-auto">Nom du service</h2>
        </div>
      )}

      <div className="p-4">
        {!isMobile && !isTablet && (
          <h2 className="font-medium text-lg mb-3">À propos de cet échange</h2>
        )}

        <div className="mb-4">
          <h3 className="font-medium">Nom du service</h3>
          <p className="text-[15px] text-gray-400 mt-1">
            {service.fullDescription}
          </p>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex justify-between">
            <span className="text-[15px] text-gray-600">Localisation</span>
            <span className="text-[15px] font-medium">
              {service.details.location}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[15px] text-gray-600">Durée</span>
            <span className="text-[15px] font-medium">{service.duration}</span>
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
      </div>
    </div>
  );

  // Conditional rendering based on screen size and view state
  if (isMobile) {
    // Mobile view
    return (
      <div className="h-screen w-full">
        {mobileView === "list" && renderConversationsList()}
        {mobileView === "chat" && renderChatView()}
        {mobileView === "details" && renderServiceDetails()}
      </div>
    );
  } else if (isTablet) {
    // Tablet view
    return (
      <div className="flex h-full w-full">
        {mobileView === "list" && renderConversationsList()}
        {mobileView === "chat" && renderChatView()}
        {mobileView === "details" && renderServiceDetails()}
      </div>
    );
  } else {
    // Desktop view
    return (
      <div className="flex h-full max-w-[82%] mx-auto">
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
