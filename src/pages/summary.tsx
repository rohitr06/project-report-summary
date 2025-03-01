import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setSummary } from "../../src/store/summarySlices";
import ReactMarkdown from "react-markdown";
// import { Menu } from "@headlessui/react";
// import { ChevronDownIcon, ClipboardIcon, MailIcon, DocumentTextIcon, ThumbUpIcon, ThumbDownIcon } from "@heroicons/react/outline";
// import axios from "axios";

export default function SummaryPage() {
  const { summary, parameters } = useSelector((state: RootState) => state.summary);
  const dispatch = useDispatch();
  const [feedbackSent, setFeedbackSent] = useState(false);
  useEffect(() => {
    if (!summary && parameters?.length) {
      dispatch(
        setSummary(`Generated summary with focus on "${parameters.keywords}" and length "${parameters.length}".`)
      );
    }
  }, [summary, parameters, dispatch]);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-md rounded-md mt-20">
      <h1 className="text-2xl font-bold mb-4 text-center">Summary</h1>
      
      {summary ? (
        <div className="p-4 border rounded-md bg-gray-100 text-black text-justify leading-relaxed overflow-auto">
          <ReactMarkdown>{summary}</ReactMarkdown>
          {/* {summary} */}
        </div>
      ) : (
        <div className="flex justify-center items-center p-4">
          <span className="animate-pulse text-gray-500">Generating summary...</span>
        </div>
      )}
    </div>
  );
}
