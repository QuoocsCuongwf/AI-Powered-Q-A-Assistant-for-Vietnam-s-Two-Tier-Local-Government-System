/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "chat-bg": "#343541",
                "chat-sidebar": "#202123",
                "chat-input": "#40414f",
                "chat-hover": "#2a2b32",
                "chat-border": "#4e4f60",
                "user-bubble": "#343541",
                "bot-bubble": "#444654",
            },
            animation: {
                "bounce-dot": "bounce 1.4s infinite ease-in-out both",
            },
        },
    },
    plugins: [],
};
