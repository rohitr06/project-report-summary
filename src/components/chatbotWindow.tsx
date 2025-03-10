import { useState,useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ChatbotWindowProps {
  onClose: () => void;
}

export default function ChatbotWindow({ onClose }: ChatbotWindowProps) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [storedItems, setStoredItems] = useState<string[]>([]);
  const storeExtractedText = (text: string) => {
    if (text.trim().length > 0) {
      setStoredItems((prevItems) => {
        const updatedItems = [...prevItems, text];
        //! console.log("Updated Stored Items:", updatedItems);
        return updatedItems;
      });
    } else {
      console.warn("Extracted text is empty, skipping store.");
    }
  };

  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);
  
  
  
  useEffect(() => {
    
    const storedText = sessionStorage.getItem("extractedText") || '';
    //! console.log("🔍 Retrieved Extracted Text:", storedText); 
        
      setExtractedText(storedText);
      
    
  }, []);


  useEffect(() => {
    window.addEventListener("beforeunload", () => {
      localStorage.removeItem("chatMessages");
      sessionStorage.removeItem("extractedText");
    });
  
    // Load messages from local storage if available
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  
    return () => {
      window.removeEventListener("beforeunload", () => {
        localStorage.removeItem("chatMessages");
        sessionStorage.removeItem("extractedText");
      });
    };
  }, []);

  const updateStoredMessages = (newMessages: { sender: string; text: string }[]) => {
    localStorage.setItem("chatMessages", JSON.stringify(newMessages));
  };

  const sendMessage = async () => {
  //!   console.log("Sending Message - Extracted Text Length:", extractedText.length);
  //! console.log("Sending Message - Extracted Text Preview:", extractedText.slice(0, 200));
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateStoredMessages(newMessages);
    //? setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input,
          extractedText: extractedText 
         })
      });
      const data = await response.json();
      const botMessage = { sender: "bot", text: data.reply };
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      updateStoredMessages(updatedMessages);

      //? setMessages(prevMessages => [...prevMessages, { sender: "bot", text: data.reply }]);
    } catch (error) {
      const errorMsg = { sender: "bot", text: "Error fetching response." };
      const updatedMessages = [...newMessages, errorMsg];
      setMessages(updatedMessages);
      updateStoredMessages(updatedMessages);
      //? console.error("Error sending message:", error);
      //? setMessages(prevMessages => [...prevMessages, { 
      //?   sender: "bot", 
      //?   text: "Error fetching response." 
      // }]);    
      }
    setInput("");
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-20 right-6 bg-white shadow-lg w-80 rounded-lg overflow-hidden">
      <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
        
        <button onClick={onClose} className="text-white"><X size={20} /></button>
      
      
      <button
  className="bg-red-400 text-white px-3 py-1 rounded-lg "
  onClick={() => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  }}
>
  Clear
</button>
</div>
      <div className="p-3 h-64 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 my-1 rounded-md ${msg.sender === "user" ? "bg-gray-200 text-right" : "bg-blue-100 text-left"}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="p-3 border-t flex">
        <input 
          type="text" 
          className="flex-1 p-2 border rounded-l-md" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..." 
        />
        <button className="bg-blue-500 text-white px-4 rounded-r-md" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}