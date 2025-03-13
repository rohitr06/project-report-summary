import { createSlice } from '@reduxjs/toolkit';

interface KeywordsState {
    suggestedKeywords: string[];
    displayedKeywords: string[];
    remainingBatches: string[][];
  }
  
  const initialState: KeywordsState = {
    suggestedKeywords: [],
    displayedKeywords: [],
    remainingBatches: [],
  };
  
const keywordsSlice = createSlice({
  name: "keywords",
  initialState,
  reducers: {
    setKeywords: (state, action) => {
      state.suggestedKeywords = action.payload.suggestedKeywords;
      state.displayedKeywords = action.payload.displayedKeywords;
      state.remainingBatches = action.payload.remainingBatches;
    },
    resetKeywords: (state) => {
      state.suggestedKeywords = [];
      state.displayedKeywords = [];
      state.remainingBatches = [];
    }
  }
});

export const { setKeywords, resetKeywords } = keywordsSlice.actions;
export default keywordsSlice.reducer;
