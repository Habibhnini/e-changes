"use client";
import { useState, useEffect, useRef } from "react";

export default function TransactionListener() {
  const [messages, setMessages] = useState([]);
  const [transactionId, setTransactionId] = useState("4"); // Default transaction ID
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  async function connectToTransaction() {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // Request token
      const authResponse = await fetch("/api/mercure/auth");
      const authData = await authResponse.json();
      const token = authData.token;

      // Connect to Mercure for this transaction
      const url = new URL("/api/mercure/proxy", window.location.origin);
      url.searchParams.append("topic", `chat/transaction/${transactionId}`);
      url.searchParams.append("authorization", token);

      console.log(
        `Connecting to transaction ${transactionId} at: ${url.toString()}`
      );

      const eventSource = new EventSource(url.toString());

      eventSource.onopen = () => {
        console.log("Connection established!");
        setConnected(true);
      };

      eventSource.onmessage = (event) => {
        console.log("RAW MESSAGE RECEIVED:", event.data);

        try {
          const data = JSON.parse(event.data);
          console.log("PARSED DATA:", data);
          setMessages((prev) => [...prev, data]);
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("EventSource error:", err);
        setConnected(false);
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error("Connection error:", err);
    }
  }

  // Connect when the component mounts
  useEffect(() => {
    connectToTransaction();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [transactionId]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Transaction Listener</h1>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="border p-2 rounded"
          placeholder="Transaction ID"
        />
        <button
          onClick={connectToTransaction}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect
        </button>
        <div
          className={`px-3 py-1 rounded ${
            connected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {connected ? "Connected" : "Disconnected"}
        </div>
      </div>

      <div className="border p-4 rounded bg-gray-50 h-64 overflow-auto">
        <h2 className="font-semibold mb-2">Received Messages:</h2>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages received yet</p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className="p-2 bg-white rounded border">
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(msg, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
