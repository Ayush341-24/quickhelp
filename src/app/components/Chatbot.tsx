import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi } from "@/services/aiApi";

// Initialize Gemini API
// NOTE: Ideally this should be in a secure backend or use a proxy to hide the key, 
// but for this frontend-only demo, we'll use the environment variable directly.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
        { role: "model", text: "Hi there! I'm your QuickHelp assistant. How can I help you find a service today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const sessionIdRef = useRef(`quickhelp-${Date.now()}`);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text?: string) => {
        const userMessage = text || input.trim();
        if (!userMessage) return;

        if (!text) setInput(""); // Only clear input if typing
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setIsLoading(true);

        try {
            const shortContext = messages.slice(-6).map((m) => m.text);
            const aiReply = await aiApi.chat(userMessage, shortContext, sessionIdRef.current);
            const responseText =
                aiReply?.response ||
                "I can help you with diagnostics, helper recommendations, and booking guidance.";
            const cat = aiReply?.detected_category || aiReply?.detected_intent;
            const withCategory =
                cat && cat !== "general"
                    ? `[${cat}] ${responseText}`
                    : responseText;

            setMessages((prev) => [...prev, { role: "model", text: withCategory }]);

        } catch (error: any) {
            // Fallback to Gemini only when AI backend is unavailable.
            if (API_KEY) {
                try {
                    const genAI = new GoogleGenerativeAI(API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                    const result = await model.generateContent(userMessage);
                    setMessages((prev) => [...prev, { role: "model", text: result.response.text() }]);
                } catch (geminiError: any) {
                    setMessages((prev) => [...prev, { role: "model", text: `Assistant error: ${geminiError.message}` }]);
                }
            } else {
                setMessages((prev) => [...prev, { role: "model", text: `Assistant error: ${error.message}` }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? "bg-destructive rotate-90" : "bg-primary"
                    } text-white`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[380px] h-[500px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary p-4 flex items-center gap-3 text-primary-foreground">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    QuickHelp AI <Sparkles className="w-3 h-3 text-yellow-300" />
                                </h3>
                                <p className="text-xs opacity-90">Usually replies instantly</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-background border border-border text-foreground rounded-tl-none shadow-sm"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-background border border-border p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        <span className="text-xs text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Questions */}
                        {messages.length === 1 && (
                            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                                {["How do I book?", "What services?", "Is it safe?", "Pricing?"].map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => handleSend(q)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-secondary-foreground text-xs rounded-full transition-colors border border-border"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-card border-t border-border">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask about services..."
                                    className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !input.trim()}
                                    className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
