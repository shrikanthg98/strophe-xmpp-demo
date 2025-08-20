import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messageAppOpen: false,
  selectedStudy: {},
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setMessageAppOpen: (state, action) => {
      state.messageAppOpen = action.payload;
    },
    setSelectedStudy: (state, action) => {
      state.selectedStudy = action.payload;
    },
    resetAppState: () => initialState,
  },
});

export const { setMessageAppOpen, setSelectedStudy, resetAppState } =
  appSlice.actions;
export default appSlice.reducer;
