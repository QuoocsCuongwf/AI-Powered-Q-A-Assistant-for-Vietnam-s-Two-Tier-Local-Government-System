/**
 * ChatInput — message input box with send button.
 */
import { useState } from "react";

export default function ChatInput({ onSend, disabled }) {
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="border-t border-chat-border bg-chat-bg p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
                <div className="flex-1 relative">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        disabled={disabled}
                        rows={1}
                        className="w-full resize-none rounded-xl border border-chat-border bg-chat-input
                       px-4 py-3 pr-12 text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       max-h-48 overflow-y-auto"
                        style={{ minHeight: "48px" }}
                        onInput={(e) => {
                            e.target.style.height = "48px";
                            e.target.style.height = Math.min(e.target.scrollHeight, 192) + "px";
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={disabled || !message.trim()}
                    className="self-end rounded-xl bg-blue-600 px-4 py-3 text-white font-medium
                     hover:bg-blue-700 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                    </svg>
                </button>
            </form>
            <p className="text-center text-xs text-gray-500 mt-2 max-w-3xl mx-auto">
                AI can make mistakes. Consider checking important information.
            </p>
        </div>
    );
}
