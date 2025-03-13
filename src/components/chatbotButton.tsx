import { useState } from "react";
import ChatbotWindow from "./chatbotWindow";

// import { MessageCircle } from "lucide-react";
import Image from "next/image";

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className=" fixed bottom-4 right-8 ">
      {isOpen && <ChatbotWindow onClose={() => setIsOpen(false)} />}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="transition-all duration-300 ease-in-out transform "
      >
        <Image src={isHovered ? "/chatBotHover.png" : "/chatBot.png"}  alt="" width={40} height={40} />
      </button>
    </div>
  );
}