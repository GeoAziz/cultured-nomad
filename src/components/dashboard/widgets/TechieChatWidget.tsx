// Techie Chat Widget (Demo)
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export default function TechieChatWidget() {
  const [messages, setMessages] = useState([
    { sender: "Techie One", text: "Anyone working on the AI Chatbot?" },
    { sender: "Techie Two", text: "Yes! Let's sync up this week." },
    { sender: "Mentor Kristi", text: "I can help with the backend." },
  ]);
  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "You", text: input }]);
    setInput("");
  }

  return (
    <Card className="glass-card animate-fade-in border-blue-300">
      <CardHeader className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-blue-500 animate-pulse" />
        <CardTitle className="text-blue-600 font-bold">Techie Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
          {messages.map((m, idx) => (
            <div key={idx} className="p-2 rounded bg-blue-100/60 text-blue-800 animate-fade-in">
              <span className="font-semibold">{m.sender}:</span> {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            className="border rounded px-2 py-1 flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
            onClick={sendMessage}
          >Send</button>
        </div>
      </CardContent>
    </Card>
  );
}
