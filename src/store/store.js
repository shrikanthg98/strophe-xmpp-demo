import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../slices/chatSlice";
import appReducer from "../slices/appSlice";
import { chatApi } from "../services/chatApi";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    app: appReducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware),
});
