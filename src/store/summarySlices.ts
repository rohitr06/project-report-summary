import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SummaryState {
  fileName: string | null;
  fileSize: number | null;
  extractedText: string; 
  parameters: Record<string, string>;
  summary: string;
}

const initialState: SummaryState = {
  fileName: null,
  fileSize: null,
  extractedText: "", 
  parameters: {},
  summary: "",
};

const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    setFile: (state, action: PayloadAction<{ fileName: string; fileSize: number }>) => {
      state.fileName = action.payload.fileName;
      state.fileSize = action.payload.fileSize;
    },
    setExtractedText: (state, action: PayloadAction<string>) => {
      state.extractedText = action.payload; 
    },
    setParameters: (state, action: PayloadAction<Record<string, string>>) => {
      state.parameters = action.payload;
    },
    setSummary: (state, action: PayloadAction<string>) => {
      state.summary = action.payload;
    },
  },
});

export const { setFile, setExtractedText, setParameters, setSummary } = summarySlice.actions;
export default summarySlice.reducer;
