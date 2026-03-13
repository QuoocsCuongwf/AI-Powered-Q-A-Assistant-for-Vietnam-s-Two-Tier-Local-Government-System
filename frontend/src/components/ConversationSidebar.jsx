/**
 * ConversationSidebar — lists conversations with new/delete actions.
 */
import { useAuth } from "../context/AuthContext";

export default function ConversationSidebar({
    conversations,
    activeId,
    onSelect,
    onNew,
    onDelete,
}) {
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 bg-chat-sidebar flex flex-col h-full border-r border-chat-border">
            {/* New Chat Button */}
            <div className="p-3">
                <button
                    onClick={onNew}
                    className="w-full flex items-center gap-2 rounded-lg border border-chat-border
                     px-3 py-3 text-sm text-white hover:bg-chat-hover transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                            clipRule="evenodd"
                        />
                    </svg>
                    New Chat
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
                {conversations.map((conv) => (
                    <div
                        key={conv.id}
                        className={`group flex items-center rounded-lg px-3 py-2.5 text-sm cursor-pointer
                        transition-colors ${activeId === conv.id
                                ? "bg-chat-hover text-white"
                                : "text-gray-300 hover:bg-chat-hover hover:text-white"
                            }`}
                        onClick={() => onSelect(conv.id)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.29 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.68-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="truncate flex-1">{conv.title}</span>

                        {/* Delete button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(conv.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 ml-1 p-1 rounded
                         hover:bg-gray-600 transition-all"
                            title="Delete conversation"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-3.5 h-3.5 text-gray-400 hover:text-red-400"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                ))}

                {conversations.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-8">
                        No conversations yet
                    </p>
                )}
            </div>

            {/* User Footer */}
            <div className="border-t border-chat-border p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold">
                                {user?.email?.charAt(0).toUpperCase() || "U"}
                            </span>
                        </div>
                        <span className="text-sm text-gray-300 truncate">
                            {user?.full_name || user?.email || "User"}
                        </span>
                    </div>
                    <button
                        onClick={logout}
                        className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-chat-hover transition-colors"
                        title="Logout"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                                clipRule="evenodd"
                            />
                            <path
                                fillRule="evenodd"
                                d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}
