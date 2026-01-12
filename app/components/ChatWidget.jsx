'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Minimize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your virtual assistant. How can I help you today? You can ask about our cars, booking, or our location.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Logic to determine API URL
            // If we are in dev, it might be localhost:5001, in prod it might be relative or a full URL
            // Ideally we use a NEXT_PUBLIC_API_URL or relative path if proxy is set up.
            // Assuming relative path /api/chat works if next.config rewrites are set, 
            // OR direct call to backend url.

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

            const res = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.text }),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await res.json();

            // Add bot response
            setMessages(prev => [...prev, { text: data.text, sender: 'bot' }]);

            // Handle Action (Redirect)
            if (data.action && data.action.type === 'redirect') {
                setTimeout(() => {
                    router.push(data.action.url);
                }, 1500); // Small delay to let user read the message
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Closed State - Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
                >
                    <MessageCircle size={32} />
                </button>
            )}

            {/* Open State - Chat Window */}
            {isOpen && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[500px] transition-all duration-300 animate-in fade-in slide-in-from-bottom-10">

                    {/* Header */}
                    <div className="bg-neutral-950 p-4 flex justify-between items-center border-b border-neutral-800">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <h3 className="text-white font-semibold">Luxury Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-neutral-400 hover:text-white transition-colors"
                        >
                            <Minimize2 size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user'
                                            ? 'bg-yellow-500 text-black rounded-br-none'
                                            : 'bg-neutral-800 text-neutral-200 rounded-bl-none border border-neutral-700'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-neutral-800 text-neutral-200 rounded-2xl rounded-bl-none px-4 py-2 text-sm border border-neutral-700 flex space-x-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-0"></div>
                                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-neutral-950 border-t border-neutral-800">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 bg-neutral-900 border border-neutral-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-yellow-500/50 transition-colors text-sm placeholder:text-neutral-600"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black p-2 rounded-xl transition-colors flex items-center justify-center"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
