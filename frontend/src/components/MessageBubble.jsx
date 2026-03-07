/**
 * MessageBubble — renders a single chat message with markdown support.
 * User messages appear on the right; assistant messages on the left.
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageBubble({ role, content }) {
    const isUser = role === "user";

    return (
        <div className={`flex items-start gap-4 py-6 px-4 md:px-8 ${isUser ? "bg-user-bubble" : "bg-bot-bubble"}`}>
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? "bg-blue-600" : "bg-emerald-600"
                    }`}
            >
                <span className="text-sm font-bold">{isUser ? "U" : "AI"}</span>
            </div>

            {/* Message Content */}
            <div className="markdown-body flex-1 min-w-0 text-gray-100 leading-7 overflow-hidden">
                {isUser ? (
                    <p className="whitespace-pre-wrap">{content}</p>
                ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                )}
            </div>
        </div>
    );
}
