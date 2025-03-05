import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import FileUpload from "../../src/components/FileUpload";
import ParameterForm from "../../src/components/parameterForm";
import { RootState } from "../../src/store/store";
import { setSummary } from "../../src/store/summarySlices";
import ChatbotButton from "@/components/chatbotButton";


export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();
  const file = useSelector((state: RootState) => state.summary.fileName);
  const extractedText = useSelector((state: RootState) => state.summary.extractedText);
  const parameters = useSelector((state: RootState) => state.summary.parameters);
  

  const handleGenerateSummary = async () => {
    console.log("📤 handleStoreSummary function triggered");
    if (!file) {
      alert("Please upload a file before generating a summary.");
      return;
    }

    if (extractedText) {
      console.log("📄 Extracted Text:", extractedText);
    }
    if (!extractedText) {
      alert("Text extraction failed. Try re-uploading the file.");
      return;
    }

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractedText, 
          length: parameters.length || "Short",
          keywords: parameters.keywords || "About",
        }),
      });
      console.log("📤 API Request Sent to /api/store-summary"); 
      const data = await response.json();
      console.log("API Response:", data);  //just for debugging in the console
      if (response.ok) {
        router.push("/summary");
        dispatch(setSummary(data.summary)); //stored the generated summary in Redux
        
      } else {
        console.error("Error:", data.error);
        alert("Failed to generate summary.");
      }
      console.log("Summary stored successfully!"); //checking whether the summary is stored or not 
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div>
    <div className="max-w-2xl mx-auto p-8 bg-gray-50 rounded-lg shadow-sm mt-20 hover:shadow-2xl">
      <h1 className="text-black text-xl font-bold mb-4">Upload Project Report</h1>
      <FileUpload />
      <br />
      <ParameterForm />
      <button
        className="mt-6 bg-blue-500 text-white p-2 rounded-md w-full"
        onClick={handleGenerateSummary}
      >
        Generate Summary
      </button>
      
    </div>
    {extractedText && <ChatbotButton />}
    </div>
  );
}
