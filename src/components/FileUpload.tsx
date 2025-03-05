import { useDropzone } from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { setFile, setExtractedText } from "../../src/store/summarySlices";
import { RootState } from "../../src/store/store";
import { useState } from "react";

const FileUpload = () => {
  const dispatch = useDispatch();
  const uploadedFile = useSelector((state: RootState) => state.summary.fileName);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      }); 

      const data = await response.json();
      if (response.ok) {
        dispatch(setExtractedText(data.text)); // Store in Redux
        sessionStorage.setItem("extractedText", data.text); // Store for chatbot
        setSuccessMessage("Text extracted successfully! Ready for summarization.");      
      }
       else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong!");
    }
    setLoading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed p-4 rounded-md cursor-pointer text-center">
        <input {...getInputProps()} />
        <p>Drag & drop a PDF here, or click to upload.</p>
      </div>

      {uploadedFile && <p className="mt-2 text-black">Uploaded: {uploadedFile}</p>}
      {loading && <p className="text-gray-500 mt-2">Processing file...</p>}
    </div>
  );
};

export default FileUpload;
