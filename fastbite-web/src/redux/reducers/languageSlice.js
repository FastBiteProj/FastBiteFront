import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLanguage: 'en' // язык по умолчанию
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    }
  }
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer; 