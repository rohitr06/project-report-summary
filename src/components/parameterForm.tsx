import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setParameters, setExtractedText} from "../../src/store/summarySlices";
import { RootState } from "../../src/store/store";

const ParameterForm = () => {
  const [params, setParams] = useState({ length: "Short", keywords: "" });
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const dispatch = useDispatch();
  const extractedText = useSelector((state: RootState) => state.summary.extractedText);
  const [displayedKeywords, setDisplayedKeywords] = useState<string[]>([]);
  
  const [remainingBatches, setRemainingBatches] = useState<string[][]>([]);
  // 🔹 Fetch AI-Suggested Keywords after text extraction
  useEffect(() => {
    if (extractedText) {
      fetch("/api/extract-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedText }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.keywords) {

            setSuggestedKeywords(data.keywords);
          setDisplayedKeywords(data.keywords[0] || []); // Show first batch
          setRemainingBatches(data.keywords.slice(1)); // Store remaining batches
          }
        })
        .catch((error) => console.error("Error fetching keywords:", error));
    }
  }, [extractedText]);

  const handleParameterChange = (updatedParams: { length: string; keywords: string }) => {
    setParams(updatedParams);
    dispatch(setParameters(updatedParams));
  };


  
  
  const handleKeywordClick = (index: number) => {
   if (index < 0 || index >= displayedKeywords.length) return;
   const selectedKeyword = displayedKeywords[index];
   if (!selectedKeyword) return;
   const updatedKeywords = params.keywords
   ? `${params.keywords}, ${selectedKeyword}`
   : selectedKeyword;
    
   const nextBatch = [...remainingBatches];
  const newKeyword = nextBatch.length > 0 ? nextBatch[0].shift() : null;
  
  const updatedDisplayedKeywords = [...displayedKeywords];
  if (newKeyword) {
    updatedDisplayedKeywords[index] = newKeyword; // Replace in displayed keywords
  }

  // Remove empty batches
  if (nextBatch.length > 0 && nextBatch[0].length === 0) nextBatch.shift();

  setDisplayedKeywords(updatedDisplayedKeywords);
  setRemainingBatches(nextBatch);
  handleParameterChange({ ...params, keywords: updatedKeywords });

};

const handleKeywordRemove = (keywordToRemove: string) => {
  const updatedKeywords = params.keywords
    .split(", ")
    .filter((keyword) => keyword !== keywordToRemove)
    .join(", ");

  handleParameterChange({ ...params, keywords: updatedKeywords });
};



  return (
    <div className="">
      <div className="mb-6 flex flex-col gap-2">
        <label className=" summary-len-text ">Summary Length:</label>
        <select
          className="summary-len-field bg-transparent text-white"
          value={params.length}
          onChange={(e) => handleParameterChange({ ...params, length: e.target.value })}
        >
          <option value="Short" className="bg-black text-white">Short</option>
          <option value="Medium" className="bg-black text-white">Medium</option>
          <option value="Long"className="bg-black text-white">Long</option>
        </select>
      </div>

      {/* <label className="block mt-2">Key Focus Area:</label>
      <input
        type="text"
        className="border p-2 w-full"
        placeholder="Enter keywords (optional)"
        value={params.keywords}
        onChange={(e) => handleParameterChange({ ...params, keywords: e.target.value })}
      /> */}

      {/* ✅ Display Suggested Keywords Below Input */}
      {/* {suggestedKeywords.length > 0 && (
        <div className="mt-2">
          <p className="text-gray-600">Suggested Keywords:</p>
          <div className="flex flex-wrap gap-2 mt-1 ">
            {suggestedKeywords.map((keyword, index) => (
              <span
                key={index}
                className="cursor-pointer bg-blue-200 text-blue-900 px-2 py-1 rounded-lg text-sm hover:bg-blue-300"
                onClick={() => handleKeywordClick(keyword)}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}  */}


<div className="">
  <label className="block summary-len-text ">Key Focus Area: </label>
  
  <div className="sel-keyword-field bg-transparent text-white flex  max-h-auto pb-2 flex-wrap mt-2 gap-2 min-h-[40px]">
    {params.keywords.split(", ").filter((keyword) => keyword.trim() !== "").map((keyword, index) => (
      
      <span
        key={index}
        className="selected-keyword h-7 px-3 py-1 rounded-lg text-sm max-w-max mt-2 flex items-center gap-2 transition-all duration-300 ease-in-out transform hover:scale-105"

>
        {keyword}
        {params.keywords &&(
        <button
          className="text-white hover:text-red-300 transition duration-300"
          onClick={() => handleKeywordRemove(keyword)}
        >
          ❌
        </button>)}
      </span>
    ))}
  </div>
</div>

{extractedText&&displayedKeywords.length > 0 && (
        <div className="mt-2">
          <p className="summary-len-text mb-4">Suggestion Keyword:</p>
          <div className="flex flex-wrap gap-2 space-around">
            {displayedKeywords.map((keyword, index) => (
              <span
                key={index}
                className="suggested-keyword "
                onClick={() => handleKeywordClick(index)}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParameterForm;
