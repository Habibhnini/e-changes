"use client";
import { useState, useEffect, useRef } from "react";

export default function MercureTest() {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  // Function to authenticate with Mercure
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

      console.log("Mercure authentication successful");
      return data.token;
    } catch (err) {
      console.error("Error authenticating with Mercure:", err);
      setError("Authentication failed: " + (err as Error).message);
      return null;
    }
  }

  // Function to connect to Mercure via the proxy
  async function connectToMercure() {
    // Close previous connection if it exists
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Authenticate first
    const token = await authenticateMercure();
    if (!token) return;

    try {
      // Use your local proxy instead of connecting directly to Mercure
      const url = new URL("/api/mercure/proxy", window.location.origin);
      url.searchParams.append("topic", "chat/test");
      url.searchParams.append("authorization", token);

      console.log("Connecting to Mercure via proxy:", url.toString());

      const eventSource = new EventSource(url.toString());

      eventSource.onopen = () => {
        console.log("Connection established with Mercure hub");
        setConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        console.log("Received message:", event.data);

        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        setConnected(false);
        setError("Connection error. See console for details.");
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error("Error setting up EventSource:", err);
      setError("Connection setup failed: " + (err as Error).message);
    }
  }

  // Connect when the component mounts
  useEffect(() => {
    connectToMercure();

    // Clean up on unmount
    return () => {
      if (eventSourceRef.current) {
        console.log("Closing Mercure connection");
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Function to test publishing a message
  async function testPublish() {
    try {
      const response = await fetch("/api/messages/mercure/test");
      const data = await response.json();

      if (data.success) {
        console.log("Message published successfully:", data);
      } else {
        console.error("Publish failed:", data);
        alert("Failed to publish test message");
      }
    } catch (err) {
      console.error("Error publishing test message:", err);
      alert("Error publishing test message: " + err.message);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mercure Real-time Test</h1>

      <div className="mb-4">
        <p>
          Status:{" "}
          {connected ? (
            <span className="text-green-600 font-bold">Connected</span>
          ) : (
            <span className="text-red-600 font-bold">Disconnected</span>
          )}
        </p>
        {error && <p className="text-red-600">{error}</p>}
      </div>

      <div className="mb-4">
        <button
          onClick={connectToMercure}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Reconnect
        </button>

        <button
          onClick={testPublish}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Publish Test Message
        </button>
      </div>

      <div className="border p-4 rounded bg-gray-50 h-64 overflow-auto">
        <h2 className="text-lg font-semibold mb-2">Received Messages:</h2>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages received yet...</p>
        ) : (
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <li key={index} className="p-2 bg-white rounded shadow">
                {JSON.stringify(message)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
