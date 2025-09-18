"use client";

import { useState, FormEvent, useRef, useEffect } from "react";

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatBotProps {
  todayEmissions?: {
    transportEmissions?: number;
    energyEmissions?: number;
    foodEmissions?: number;
    digitalEmissions?: number;
    totalEmissions?: number;
    carDistanceKms?: number;
    carType?: string;
    flightKms?: number;
    electricityBill?: number;
    diet?: string;
  };
}


export default function ChatBot({ todayEmissions }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isGreetingLoading, setIsGreetingLoading] = useState(true);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      try {
        const response = await fetch('/api/welcome-fact');
        if (!response.ok) {
          throw new Error('Failed to fetch welcome message');
        }
        const data = await response.json();
        const initialMessage: Message = {
          role: 'model',
          content: data.welcomeMessage
        };
        setMessages([initialMessage]);
      } catch (error) {
        console.error(error);
        const fallbackMessage: Message = {
          role: 'model',
          content: "Hello! I'm Carbon Buddy. Ask me anything about your footprint or the environment."
        };
        setMessages([fallbackMessage]);
      } finally {
        setIsGreetingLoading(false);
      }
    };

    fetchWelcomeMessage();
  }, []);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    const carbonDataForApi = {
      transport: todayEmissions?.transportEmissions ?? 0,
      energy: todayEmissions?.energyEmissions ?? 0,
      food: todayEmissions?.foodEmissions ?? 0,
      digital: todayEmissions?.digitalEmissions ?? 0,
      total: todayEmissions?.totalEmissions ?? 0,
      carDistanceKms: todayEmissions?.carDistanceKms,
      carType: todayEmissions?.carType,
      flightKms: todayEmissions?.flightKms,
      electricityBill: todayEmissions?.electricityBill,
      diet: todayEmissions?.diet,
    };
    
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          carbon_data: carbonDataForApi,
        }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const data = await response.json();
      const modelMessage: Message = { role: "model", content: data.reply };
      setMessages((prev) => [...prev, modelMessage]);

    } catch (error) {
      console.error("Failed to fetch chat response:", error);
      const errorMessage: Message = { role: "model", content: "Sorry, I'm having trouble connecting. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  if (isGreetingLoading) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-lg h-[70vh] flex flex-col animate-fade-in">
        <div className="border-b pb-2 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Carbon Buddy Chat</h2>
          <p className="text-gray-500 text-sm">Ask me anything about your carbon footprint!</p>
        </div>
        <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500 animate-pulse">Fetching a fresh fact for you...</p>
        </div>
      </div>
    );
  }

  const hasNoData = !todayEmissions || !todayEmissions.totalEmissions || todayEmissions.totalEmissions === 0;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg h-[70vh] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="border-b pb-2 mb-4">
        <h2 className="text-xl font-bold text-gray-800">Carbon Buddy Chat</h2>
        <p className="text-gray-500 text-sm">Ask me anything about your carbon footprint!</p>
      </div>

      {/* Conditional Rendering: Show message if no data */}
      {hasNoData ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold text-gray-700">No data for today!</p>
            <p className="text-gray-500 text-sm">Please go to the Calculator tab and add an entry for today to get personalized advice.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto pr-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 p-3 rounded-lg">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <div className="mt-4 border-t pt-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                disabled={isLoading || !input.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}