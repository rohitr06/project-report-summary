import { useState } from "react";
import ChatbotWindow from "./chatbotWindow";
import { MessageCircle } from "lucide-react";

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6">
      {isOpen && <ChatbotWindow onClose={() => setIsOpen(false)} />}
      <button
        className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}