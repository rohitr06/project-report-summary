import { useState,useEffect, useRef } from "react";
import Image from "next/image";
import { Magnet, X } from "lucide-react";
import React from "react";


interface ChatbotWindowProps {
  onClose: () => void;
}




export default function ChatbotWindow({ onClose }: ChatbotWindowProps) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([{ sender: "bot", text: "I'm a Al bot and I can answer as many questions.\n \n Try out asking one?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);  //autoscroll 


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
    setLoading(true);

    const loadingMessage = { sender: "bot", text: "Good question! Preparing right answer for you" };
    setMessages([...newMessages, loadingMessage]);
    

    setTimeout(async () => {
      
      // setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: "Just a moment, gathering more details..." }]);
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
      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      updateStoredMessages([...newMessages, botMessage]);

      //? setMessages(prevMessages => [...prevMessages, { sender: "bot", text: data.reply }]);
    } catch (error) {
      const errorMsg = { sender: "bot", text: "Error fetching response." };
      const finalMessages = [...newMessages, errorMsg];
        setMessages(finalMessages);
        updateStoredMessages(finalMessages);

// setMessages((prev) => [...prev.slice(0, -1), errorMsg]);
// updateStoredMessages([...newMessages.slice(0, -1), errorMsg]);
//       //? console.error("Error sending message:", error);
//       //? setMessages(prevMessages => [...prevMessages, { 
//       //?   sender: "bot", 
//       //?   text: "Error fetching response." 
      // }]);    
      }
      setLoading(false);
    }, 2000);

    setInput("");
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.ctrlKey) {
      sendMessage();
      e.preventDefault(); 
    } else if (e.key === "Enter" && e.ctrlKey) {
      setInput((prev) => prev + "\n"); 
    } else if (e.key === "ArrowUp") {
      
      const userMessages = messages.filter((msg) => msg.sender === "user");
      if (userMessages.length > 0) {
        setInput(userMessages[userMessages.length - 1].text); 
      } else {
        setInput(""); 
      }
    } else if (e.key === "ArrowDown") {
      
      const userMessages = messages.filter((msg) => msg.sender === "user");
      if (userMessages.length > 1) {
        setInput(userMessages[0].text); 
      } else {
        setInput(""); 
      }
    }
  };
  

  return (
    <div className=" fixed ml-5  chat-bot-win  bg-white shadow-lg max-w-sm md:max-w-md lg:max-w-lg rounded-2xl overflow-hidden border border-gray-200">
      <div className="bg-[#D5BAFD] text-white  flex justify-between items-center  w-full py-2 px-2 sm:px-4">
        <div className="flex items-center ">
        {/* <button onClick={onClose} className="text-white"><X size={20} /></button> */}
        <button onClick={onClose} className="text-black chatbot-arrow p-1 " >&lt;</button>
        {/* <Image src="/backImage.png" alt="back" width={35} height={35} onClick={onClose}  className=" chatbot-arrow"/> */}

        <Image src="/chatBotLogo.png" alt="Chatbot" width={30} height={30}  className=" sm:w-12 sm:h-11 w-9 h-10"/>
        <div className="flex flex-col ml-2">  
        <h1 className="   chat-bot-header-text ">GlideBot</h1>
        <h1 className=" chat-bot-header-sub-text ">A bot based on AI</h1>
        </div>
        
        </div>
      <button
  className="bg-red-400 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold"
  onClick={() => {
    setMessages([{ sender: "bot", text: "I'm a Al bot and I can answer as many questions.\n \n Try out asking one?" }]);
    localStorage.removeItem("chatMessages");
  }}
>
  Clear
</button>
</div>

      <div className="p-2 sm:p-3 md:p-4 h-64 md:h-64 lg:h-72 overflow-y-auto ">
        {messages.map((msg, idx) => (
          

<div key={idx} className={`flex items-start gap-2 ${msg.sender === "user" ? "justify-end" : ""}`}>  {/* Check if it's the user's first message and apply styles */}
  

<div>
  {msg.sender === "bot" && (msg.text === "Just a moment, gathering more details..." || msg.text === "Good question! Preparing right answer for you" ) ? (
                <div className="w-full flex flex-col items-center justify-center py-2 ml-8">
                <Image src="/loading.gif" alt="Loading" width={40} height={40} className=" opacity-50 h-40 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28" />

                
                <p className="text-xs sm:test-sm font-medium opacity-50 loading-text text-center ">{msg.text}</p>
              </div>
                
              ) :   null}

     </div>         
{/* BOT PROFILE IMAGE */}
{msg.sender === "bot" && msg.text !== "“Just a moment, gathering more details..." && msg.text !== "Good question! Preparing right answer for you"  && (
  <Image 
    src="/chatBotLogo.png" 
    alt="Bot Avatar" 
    width={32} 
    height={32} 
    className="mt-1 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
  />
)}


{/* CHAT BUBBLE */}
{msg.text !== "" && msg.text !== "“Just a moment, gathering more details..." && msg.text !== "Good question! Preparing right answer for you"   ? (

<div className={`p-2 sm:p-3 max-w-[70%] sm:max-w-[75%] md:max-w-[80%] text-xs sm:text-sm rounded-xl mb-2 ${msg.sender === "user" ? "bg-[#DAEBFF] text-right" : "bg-[#EBEAF9] text-left"}`}>
   {/* Check if it's the bot's first message and apply styles */}
   {msg.sender === "bot" && idx === 0 ? (
          <span className="font-bold chatbot-bot-message">
            Hi there! You can call me GlideBot
            <br />
          </span>
        ) : null}


        
        {/* Replace \n with actual line breaks */}
        {msg.sender === "bot"  &&
msg.text !== "Just a moment, gathering more details..." ? ( msg.text.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            <span className="chatbot-bot-message-body break-words">{line}</span>
            {i < msg.text.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))): null}
  {/* {msg.text} */}

  {/* Disclaimer Message */}
  {msg.sender === "bot" && msg.text !== "Just a moment, gathering more details..."  && msg.text !== "Good question! Preparing right answer for you"   ?(
<div className=" text-gray-500 text-xs flex items-center gap-1 px-1 pt-1">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
  </svg>
  <span className="text-xs">These answers are based on AI and might be inaccurate.</span>
</div>):  null}
        

{msg.sender === "user" ?
msg.text.split("\n").map((line, i) => (
  <React.Fragment key={i}>
    <span className="chatbot-user-message break-words">{line}</span>
    {i < msg.text.split("\n").length - 1 && <br />}
  </React.Fragment>
)):null}


</div>

):null}

{/* USER PROFILE IMAGE */}
{msg.sender === "user" && (
  <Image 
    src="/userImage.png" 
    alt="User" 
    width={32} 
    height={32} 
    className="mt-1 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
  />
)}

</div>


         
        ))}
      <div ref={messagesEndRef} />

      </div>

{/* CHAT INPUT */}
      <div className="sm:p-3 p-2 md:p-4 items-center gap-2 ">
        <div className="flex flex-row chatbot-input bg-[#eeeeee] sm:p-3 p-2 border rounded-2xl text-sm items-center justify-between w-full " >
        <input 
          type="text" 
         className="bg-transparent flex-grow outline-none text-xs sm:text-sm"
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start a chat" 
        />

        <button className=" text-black  rounded-full text-xl sm:text-2xl font-semibold ml-2 flex-shrink-0" onClick={sendMessage}>
        ➤
          </button>
          </div>
      </div>
    </div>
  );
}