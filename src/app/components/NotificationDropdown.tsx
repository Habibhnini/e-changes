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
  const { user, token, notifications, unreadCount, setUnreadCount } = useAuth();

  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) {
            // Reset unread count when opened
            setUnreadCount?.(0);
          }
        }}
        className="p-2 pl-1 rounded-md  relative cursor-pointer"
      >
        <img src="/bell.png" alt="Notifications" className="w-4 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 h-5 min-w-[20px] flex items-center justify-center leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-md z-50">
          <div className="p-3 border-b font-semibold text-gray-700">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                Aucune notification.
              </div>
            ) : (
              notifications.map((notif: Notification) => (
                <Link
                  key={notif.id}
                  href={notif.link}
                  className="block px-4 py-3 hover:bg-gray-100 text-sm border-b border-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <div className="font-medium text-gray-800">{notif.title}</div>
                  <div className="text-gray-600 text-xs">{notif.content}</div>
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
