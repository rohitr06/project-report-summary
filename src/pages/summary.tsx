import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setSummary } from "../../src/store/summarySlices";
import ReactMarkdown from "react-markdown";
import ChatbotButton from "@/components/chatbotButton";
import { Copy, ThumbsUp, ThumbsDown, MessageSquare, RefreshCw,Check } from "lucide-react";

// import { Menu } from "@headlessui/react";
// import { ChevronDownIcon, ClipboardIcon, MailIcon, DocumentTextIcon, ThumbUpIcon, ThumbDownIcon } from "@heroicons/react/outline";
// import axios from "axios";

export default function SummaryPage() {
  const { summary, parameters } = useSelector((state: RootState) => state.summary);
  const dispatch = useDispatch();
  const extractedText = useSelector((state: RootState) => state.summary.extractedText); 
  // const [feedbackSent, setFeedbackSent] = useState(false);
  useEffect(() => {
    if (!summary && parameters?.length) {
      dispatch(
        setSummary(`Generated summary with focus on "${parameters.keywords}" and length "${parameters.length}".`)
      );
    }
  }, [summary, parameters, dispatch]);

  
    const [copied, setCopied] = useState(false);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [regenload, setRegenLoad] = useState(false);


    const sendFeedback = async (action: "like" | "dislike" | "regenerate") => {
      try {
        setLoading(true);
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action, summary }),
        });
  
        const data = await response.json();
        if (action === "regenerate" && data.summary) {
          dispatch(setSummary(data.summary)); // Update summary in Redux store
        } else {
          console.log(data.message);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error sending feedback:", error);
        setLoading(false);
      }
    };

    const handleCopy = async () => {
      try {
        const textToCopy = summary; 
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
  
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    };

    const handleLike = async () => {
      if (liked) return; // Prevent duplicate clicks
      setLiked(true);
      setDisliked(false); // Remove dislike if liked
      await sendFeedback("like");
    
      // Reset state after 2 seconds
      setTimeout(() => {
        setLiked(false);
      }, 1000);
    };

    const handleDislike = async () => {
      if (disliked) return; // Prevent duplicate clicks
      setDisliked(true);
      setLiked(false); // Remove like if disliked
      await sendFeedback("dislike");
    
      // Reset state after 2 seconds
      setTimeout(() => {
        setDisliked(false);
      }, 1000);
    };

    const handleRegenerate = async () => {
      setRegenLoad(true);
      await sendFeedback("regenerate");
      setRegenLoad(false);
    };

  return (<div className="flex flex-col items-center p-4">

    <div className="w-full sm:max-w-2xl max-w-lg mx-auto p-6 sm:p-8 bg-[#EBEAF9] shadow-md rounded-md mt-6 sm:mt-12">
      <h1 className="text-xl sm:text-2xl font-bold bg-transparent mb-4 text-center sum-heading">Summary</h1>
      
      {summary ? (
        
        <div className="p-5 border sum-text rounded-md bg-white text-[#131416] text-justify leading-relaxed overflow-auto">
          <ReactMarkdown>{summary}</ReactMarkdown>
          {/* {summary} */}
        
        <div className="flex justify-center space-x-2 mt-4 ">
          
        <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-gray-200">
        {copied ? (
          <Check className="w-5 h-5 text-gray-600" />
          ) : (
            <Copy className="w-5 h-5 text-gray-600" />
            )}
          
        </button>
       
        <button onClick={handleLike} className="p-2 rounded-lg">
          {liked ? (
            <ThumbsUp className="w-5 h-5 text-green-600 fill-current stroke-none" />

          ):(
                      <ThumbsUp className="w-5 h-5 text-gray-600 " />

          )}
        </button>
        <button onClick={handleDislike} className="p-2 rounded-lg hover:bg-gray-200">
          {disliked ? (
                        <ThumbsDown className="w-5 h-5 text-red-500 fill-current stroke-none" />

          ):(
            <ThumbsDown className="w-5 h-5 text-gray-600" />

          )}
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-200">
          <MessageSquare className="w-5 h-5 text-gray-600" />
        </button>
        <button onClick={handleRegenerate} className="p-2 rounded-lg hover:bg-gray-200">
        <RefreshCw className={`w-5 h-5 text-gray-600 ${regenload ? "animate-spin duration-1000 ease-in-out" : ""}`} />      
          </button>
      </div>
      </div>
      ) : (
        <div className="flex justify-center items-center p-4">
          <span className="animate-pulse text-gray-500">Generating summary...</span>
        </div>
      )}



    </div>
    <div className="relative flex flex-col md:flex-row items-center  justify-end w-full max-w-2xl mt-6 gap-3">
    <button
        className=" cancel-btn  py-2 px-6 bg-transparent   hover:bg-gradient-to-r hover:from-[#911FC9] hover:to-[#C941A2]"
      >
        Cancel
      </button>
    </div>
    <div >
        {extractedText && 
         <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
          <ChatbotButton />
          </div>
          }
        </div></div>
  );
}
