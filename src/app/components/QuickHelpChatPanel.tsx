import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, Sparkles, Tag } from "lucide-react";
import { aiApi } from "@/services/aiApi";

type ChatMsg = { role: "user" | "assistant"; text: string; category?: string | null };

export function QuickHelpChatPanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Hi — I'm QuickHelp AI. Describe a home issue and I'll route you to the right service.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef(`qh-panel-${Date.now()}`);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const ctx = messages.slice(-6).map((x) => x.text);
      const res = await aiApi.chat(text, ctx, sessionIdRef.current);
      const reply = res?.response ?? "I can help with home services — try describing the issue.";
      const cat = res?.detected_category ?? res?.detected_intent;
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: reply,
          category: cat && cat !== "general" ? String(cat) : null,
        },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setMessages((m) => [...m, { role: "assistant", text: `Sorry — ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[420px] rounded-xl border border-border bg-card shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-1.5">
            AI Assistant <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </h3>
          <p className="text-xs text-muted-foreground">Rule-based routing + smart tips</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-background border border-border rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" && msg.category && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-primary mb-1">
                  <Tag className="w-3 h-3" />
                  {msg.category}
                </span>
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl rounded-bl-md border border-border bg-background px-3 py-2 flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="e.g. AC not cooling"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 shadow-md hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
