import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiManager from '../../apiManager';

const baseUrl = import.meta.env.VITE_API_URL;

export const fetchClientId = createAsyncThunk(
    'payment/fetchClientId',
    async (_, { rejectWithValue }) => {
        try {
            const apiData = {
                Url: `${baseUrl}/api/v1/Checkout/client-id`,
                Method: 'GET',
                Headers: {
                    'Content-Type': 'application/json'
                }
            };

            const response = await ApiManager.apiRequest(apiData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        clientId: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClientId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClientId.fulfilled, (state, action) => {
                state.loading = false;
                state.clientId = action.payload.clientId;
            })
            .addCase(fetchClientId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default paymentSlice.reducer;