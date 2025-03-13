import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import FileUpload from "../../src/components/FileUpload";
import ParameterForm from "../../src/components/parameterForm";
import { RootState } from "../../src/store/store";
import { setSummary } from "../../src/store/summarySlices";
import ChatbotButton from "@/components/chatbotButton";
import Image from "next/image";


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
    
    <div className="max-w-4xl  h-screen  mx-auto p-8  shadow-sm mt-2 ">

      <div className="flex flex-row justify-between items-center mb-2">
      <h1 className="text-white upload-the-report font-medium text-2xl sm:text-3xl md:text-4xl leading-normal tracking-normal w-auto h-[51px] sm:h-auto text-center sm:text-left">Upload the Document</h1>
      <Image src="/x.png" className="w-[26.3px] h-[26.3px] sm:w-8 sm:h-8 md:w-8 md:h-8 lg:w-8 lg:h-8 
             mb-4 sm:mb-0 top-[10.85px] right-[10.85px] sm:top-4 sm:right-4 
             cursor-pointer" alt="close" width={40} height={40} />
      </div>
      <FileUpload />
      <br />
      <ParameterForm />
      <div className="flex mt-4  gap-5 justify-end items-center pb-6">
      <button
        className=" cancel-btn  py-2 px-6 bg-transparent   hover:bg-gradient-to-r hover:from-[#911FC9] hover:to-[#C941A2]"
      >
        Cancel
      </button>
      <button
        className=" generate-summary-btn py-2 px-6  "
        onClick={handleGenerateSummary}
      >
        Generate Summary
      </button>
      {extractedText && <ChatbotButton />}
      </div>
      
    </div>
    
    
  );
}
