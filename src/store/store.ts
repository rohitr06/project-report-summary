import { configureStore } from "@reduxjs/toolkit";
import summaryReducer from "./summarySlices";

export const store = configureStore({
  reducer: {
    summary: summaryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
