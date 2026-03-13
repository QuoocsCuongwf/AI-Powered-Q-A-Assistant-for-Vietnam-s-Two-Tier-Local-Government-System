/**
 * ChatWindow — the main message display area with auto-scroll.
 */
import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import LoadingDots from "./LoadingDots";

export default function ChatWindow({ messages, isLoading }) {
    const bottomRef = useRef(null);

    // Auto-scroll to bottom when messages change or loading starts
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto">
            {messages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-16 h-16 mb-4 text-gray-600"
                    >
                        <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 20.97v-3.065a47.316 47.316 0 0 1-1.087-.091c-1.922-.25-3.291-1.861-3.405-3.727a49.39 49.39 0 0 1 0-7.747c.247-1.866 1.616-3.477 3.405-3.727ZM15.75 8.25a.75.75 0 0 1 .75.75c0 5.385-3.406 9.998-8.168 11.753a.75.75 0 0 1-.475-1.42c4.16-1.534 7.143-5.58 7.143-10.333a.75.75 0 0 1 .75-.75Z" />
                    </svg>
                    <h2 className="text-xl font-semibold mb-2 text-gray-300">
                        Legal Chatbot
                    </h2>
                    <p className="text-sm max-w-md text-center">
                        Start a conversation by typing a message below.
                        <br />
                        Ask me anything — I'm here to help!
                    </p>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                    ))}
                    {isLoading && <LoadingDots />}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
}
