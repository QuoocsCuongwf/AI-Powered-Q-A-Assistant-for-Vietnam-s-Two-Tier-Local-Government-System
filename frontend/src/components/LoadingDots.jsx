/**
 * LoadingDots — animated typing indicator shown while waiting for AI response.
 */
export default function LoadingDots() {
    return (
        <div className="flex items-start gap-4 py-6 px-4 md:px-8 bg-bot-bubble">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">AI</span>
            </div>
            <div className="flex items-center pt-2">
                <div className="loading-dots flex space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-gray-400 rounded-full inline-block" />
                    <span className="w-2.5 h-2.5 bg-gray-400 rounded-full inline-block" />
                    <span className="w-2.5 h-2.5 bg-gray-400 rounded-full inline-block" />
                </div>
            </div>
        </div>
    );
}
