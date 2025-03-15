import { useDropzone } from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { setFile, setExtractedText } from "../../src/store/summarySlices";
import { RootState } from "../../src/store/store";
import { useState } from "react";
import Image from 'next/image';
import { Trash2 } from "lucide-react";

const FileUpload = () => {
  const dispatch = useDispatch();
  const uploadedFile = useSelector((state: RootState) => state.summary.fileName);
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    dispatch(setFile({ fileName: file.name, fileSize: file.size }));

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setSuccessMessage("");
    setProgress(0);
    
    try {

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      }); 
      setProgress(70);
      const data = await response.json();
      if (response.ok) {
        dispatch(setExtractedText(data.text)); // Store in Redux
        sessionStorage.setItem("extractedText", data.text); // Store for chatbot
        setSuccessMessage("Text extracted successfully! Ready for summarization.");      
        setProgress(100);
      }
       else {
        alert("Upload failed: " + data.error);
        setProgress(0);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong!");
      setProgress(0);
    }
    setLoading(false);
  };
  const removeFile = async () => {
    if (!uploadedFile) return;

    try {

      const response = await fetch("/api/cancelUpload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: uploadedFile }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }
      setExtractedText(""); // Clear extracted text
          console.log("✅ File removed successfully:", uploadedFile);

    } catch (error) {
      console.error("Error canceling upload:", error);
    }
   
    dispatch(setFile({ fileName: "", fileSize: 0 })); // Clears uploaded file
    setProgress(0); // Reset progress bar

  };
  

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (

    <div >
      <div {...getRootProps()} className="drag-and-drop-frame border-solid p-4 rounded-md cursor-pointer text-center flex flex-col items-center justify-center gap-2">
        <input {...getInputProps()} />
        <div className="flex gap-2 flex-col items-center">
        <div>
        <Image
        src="/dragAndDrop.png"
        alt="Upload Icon"
        width={88}
        height={88}
        className="mx-auto bg-transparent"
        />
        </div>
        <div className="flex gap-2 flex-col items-center">
        <p className="drag-and-drop-text">Drag & Drop</p>
        <p className="choose-a-file text-white">Or <span className="choose-a-file-anchor">choose a file</span> </p>
        </div>
        <div> 
          <p className="max-file">Maximum file size 500MB.</p>

        </div>

        </div>
      </div>

      {/* {uploadedFile && <p className="mt-2 text-white">Uploaded: {uploadedFile}</p>}
      {loading && <p className="text-gray-500 mt-2">Processing file...</p>} */}

  
           {/* Uploaded File Display */}
           {uploadedFile && (
            <div className="uploaded-file-display">
        <div className="w-full max-w-full  p-3 rounded-lg flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Image src="/upload.png" alt="PDF Icon" width={32} height={32} />
            <div className="flex flex-col gap-1">
              <p className="uploaded-file-name">{uploadedFile}</p>
              <p className="uploaded-file-processing">{loading ? "Processing file....." : "Upload complete"}</p>
            </div>
          </div>

            <div className="flex flex-row items-center  gap-6">
          {/* Progress Bar */}
          {loading && (
            <div className="w-10 h-1 progress-bar-bg rounded-full overflow-hidden">
               <div
      className={`h-full transition-all bg-gradient-to-r from-[#C941A2] to-[#911FC9]}`}
      style={{ width: `${progress}%` }}
    ></div>
    </div>
          )}

          {/* Delete Button */}
          <button onClick={removeFile} className="text-gray-400 hover:text-red-500">
            <Trash2 size={18} />
          </button>
          </div>
        </div></div>
      )}
      </div>
      
    
  );
};

export default FileUpload;
