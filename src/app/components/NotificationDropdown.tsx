// components/NotificationDropdown.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { EventSourcePolyfill } from "event-source-polyfill";

interface Notification {
  id: number;
  title: string;
  content: string;
  link: string;
  createdAt: string;
  isRead: boolean;
}

const NotificationDropdown: React.FC = () => {
  const {
    user,
    token,
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
  } = useAuth();

  const [open, setOpen] = useState(false);

  // Calculate actual unread count from notifications
  const actualUnreadCount = (notifications as Notification[]).filter(
    (notif) => !notif.isRead
  ).length;

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the notification locally to reflect the change
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
        }}
        className="p-2 pl-1 rounded-md relative cursor-pointer"
      >
        <img src="/bell.png" alt="Notifications" className="w-4 h-5" />
        {actualUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 h-5 min-w-[20px] flex items-center justify-center leading-none">
            {actualUnreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-[-40px] mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-md z-50">
          <div className="p-3 border-b font-semibold text-gray-700">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {(notifications as Notification[]).length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                Aucune notification.
              </div>
            ) : (
              (notifications as Notification[]).map((notif: Notification) => (
                <Link
                  key={notif.id}
                  href={notif.link}
                  className={`
                    block px-4 py-3 text-sm border-b border-gray-100 relative
                    ${
                      notif.isRead
                        ? "bg-white hover:bg-gray-50 text-gray-600"
                        : "bg-blue-50 hover:bg-blue-100 text-gray-900 border-l-4 border-l-blue-500"
                    }
                  `}
                  onClick={() => {
                    markAsRead(notif.id);
                    setOpen(false);
                  }}
                >
                  {/* Unread indicator dot */}
                  {!notif.isRead && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}

                  <div
                    className={`font-medium ${
                      notif.isRead
                        ? "text-gray-600"
                        : "text-gray-900 font-semibold"
                    }`}
                  >
                    {notif.title}
                  </div>
                  <div
                    className={`text-xs ${
                      notif.isRead ? "text-gray-500" : "text-gray-700"
                    }`}
                  >
                    {notif.content}
                  </div>
                  <div className="text-gray-400 text-[10px]">
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
