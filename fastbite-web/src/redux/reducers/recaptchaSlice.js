import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ApiManager from '../../apiManager';

const baseUrl = import.meta.env.VITE_API_URL;

export const fetchSiteKey = createAsyncThunk(
  "recaptcha/fetchSiteKey",
  async (_, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Recaptcha/SiteKey`,
        Method: "GET",
        Headers: {
          "Content-Type": "application/json"
        }
      };

      const response = await ApiManager.apiRequest(apiData);
      console.log("Fetched Site Key from server:", response.siteKey);
      return response.siteKey;
    } catch (error) {
      console.error("Error fetching Site Key:", error);
      return rejectWithValue(error.message);
    }
  }
);

const recaptchaSlice = createSlice({
  name: "recaptcha",
  initialState: {
    siteKey: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSiteKey.fulfilled, (state, action) => {
        state.siteKey = action.payload;
        state.loading = false;
        console.log("Site Key set in state:", state.siteKey);
      })
      .addCase(fetchSiteKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default recaptchaSlice.reducer;
