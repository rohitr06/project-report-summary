import { configureStore } from "@reduxjs/toolkit";
import summaryReducer from "./summarySlices";
import keywordsReducer from "./keywordsSlice";
export const store = configureStore({
  reducer: {
    summary: summaryReducer,
    keywords: keywordsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
