import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setParameters } from "../../src/store/summarySlices";
import { RootState } from "../../src/store/store";

const ParameterForm = () => {
  const [params, setParams] = useState({ length: "Short", keywords: "" });
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const dispatch = useDispatch();
  const extractedText = useSelector((state: RootState) => state.summary.extractedText);

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
          }
        })
        .catch((error) => console.error("Error fetching keywords:", error));
    }
  }, [extractedText]);

  const handleParameterChange = (updatedParams: { length: string; keywords: string }) => {
    setParams(updatedParams);
    dispatch(setParameters(updatedParams));
  };

  const handleKeywordClick = (keyword: string) => {
    handleParameterChange({ ...params, keywords: keyword });
  };

  return (
    <div className="mt-4">
      <div className="mb-6">
        <label className="block">Summary Length:</label>
        <select
          className="border p-2 w-full"
          value={params.length}
          onChange={(e) => handleParameterChange({ ...params, length: e.target.value })}
        >
          <option value="Short">Short</option>
          <option value="Medium">Medium</option>
          <option value="Long">Long</option>
        </select>
      </div>

      <label className="block mt-2">Key Focus Area:</label>
      <input
        type="text"
        className="border p-2 w-full"
        placeholder="Enter keywords"
        value={params.keywords}
        onChange={(e) => handleParameterChange({ ...params, keywords: e.target.value })}
      />

      {/* ✅ Display Suggested Keywords Below Input */}
      {suggestedKeywords.length > 0 && (
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
      )}
    </div>
  );
};

export default ParameterForm;
