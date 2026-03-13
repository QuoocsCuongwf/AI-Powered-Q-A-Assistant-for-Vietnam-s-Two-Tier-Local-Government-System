/**
 * ChatPage — main chat interface with sidebar and message area.
 */
import { useState, useEffect, useCallback } from "react";
import ConversationSidebar from "../components/ConversationSidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { conversationAPI, chatAPI } from "../api/client";

export default function ChatPage() {
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Load conversations on mount ─────────────────────────────
    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const res = await conversationAPI.list();
            setConversations(res.data.conversations);
        } catch (err) {
            console.error("Failed to load conversations:", err);
        }
    };

    // ── Load messages when active conversation changes ──────────
    useEffect(() => {
        if (activeConversationId) {
            loadMessages(activeConversationId);
        } else {
            setMessages([]);
        }
    }, [activeConversationId]);

    const loadMessages = async (conversationId) => {
        try {
            const res = await chatAPI.getMessages(conversationId);
            setMessages(res.data.messages);
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    };

    // ── Create new conversation ────────────────────────────────
    const handleNewConversation = async () => {
        try {
            const res = await conversationAPI.create("New Conversation");
            const newConv = res.data;
            setConversations((prev) => [newConv, ...prev]);
            setActiveConversationId(newConv.id);
            setMessages([]);
        } catch (err) {
            console.error("Failed to create conversation:", err);
        }
    };

    // ── Delete conversation ─────────────────────────────────────
    const handleDeleteConversation = async (id) => {
        try {
            await conversationAPI.delete(id);
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (activeConversationId === id) {
                setActiveConversationId(null);
                setMessages([]);
            }
        } catch (err) {
            console.error("Failed to delete conversation:", err);
        }
    };

    // ── Send message ────────────────────────────────────────────
    const handleSendMessage = useCallback(
        async (text) => {
            let convId = activeConversationId;

            // Auto-create conversation if none is active
            if (!convId) {
                try {
                    const res = await conversationAPI.create("New Conversation");
                    const newConv = res.data;
                    setConversations((prev) => [newConv, ...prev]);
                    setActiveConversationId(newConv.id);
                    convId = newConv.id;
                } catch (err) {
                    console.error("Failed to create conversation:", err);
                    return;
                }
            }

            // Optimistic UI: add user message immediately
            const tempUserMsg = {
                id: `temp-user-${Date.now()}`,
                conversation_id: convId,
                role: "user",
                content: text,
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, tempUserMsg]);
            setIsLoading(true);

            try {
                const res = await chatAPI.sendMessage(convId, text);
                const { user_message, assistant_message } = res.data;

                // Replace optimistic user message with real one, and add assistant message
                setMessages((prev) => [
                    ...prev.filter((m) => m.id !== tempUserMsg.id),
                    user_message,
                    assistant_message,
                ]);

                // Refresh conversation list to get updated titles
                loadConversations();
            } catch (err) {
                console.error("Chat error:", err);
                // Add error message
                const errorMsg = {
                    id: `error-${Date.now()}`,
                    conversation_id: convId,
                    role: "assistant",
                    content:
                        "⚠️ Sorry, something went wrong. Please try again.\n\n" +
                        `*Error: ${err.response?.data?.detail || err.message}*`,
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, errorMsg]);
            } finally {
                setIsLoading(false);
            }
        },
        [activeConversationId]
    );

    return (
        <div className="flex h-screen bg-chat-bg">
            {/* Mobile sidebar toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-chat-sidebar border border-chat-border text-white"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path
                        fillRule="evenodd"
                        d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 fixed md:relative z-40 transition-transform duration-300`}
            >
                <ConversationSidebar
                    conversations={conversations}
                    activeId={activeConversationId}
                    onSelect={(id) => {
                        setActiveConversationId(id);
                        setSidebarOpen(false); // Close on mobile after selection
                    }}
                    onNew={handleNewConversation}
                    onDelete={handleDeleteConversation}
                />
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0">
                <ChatWindow messages={messages} isLoading={isLoading} />
                <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </main>
        </div>
    );
}
