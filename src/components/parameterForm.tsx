import { useState } from "react";
import { useDispatch } from "react-redux";
import { setParameters } from "../../src/store/summarySlices";

const ParameterForm = () => {
  const [params, setParams] = useState({ length: "Short", keywords: "" });
  const dispatch = useDispatch();

  const handleParameterChange = () => {
    dispatch(setParameters(params));
  };

  return (
    <div className="mt-4">
      <div className="mb-6">
        <label className="block">Summary Length:</label>
        <select
          className="border p-2 w-full"
          value={params.length}
          onChange={(e) => {
            setParams({ ...params, length: e.target.value });
            handleParameterChange();
          }}
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
        onChange={(e) => {
          setParams({ ...params, keywords: e.target.value });
          handleParameterChange();
        }}
      />
    </div>
  );
};

export default ParameterForm;
