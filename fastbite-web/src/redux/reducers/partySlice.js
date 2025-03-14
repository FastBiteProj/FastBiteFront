import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import ApiManager from "../../apiManager";

const baseUrl = import.meta.env.VITE_API_URL;

export const createParty = createAsyncThunk(
    'party/createParty',
    async (partyRequest, { rejectWithValue }) => {
        try {
            const apiData = {
                Url: `${baseUrl}/api/v1/party/createParty`,
                Method: 'POST',
                Headers: {
                    'Content-Type': 'application/json'
                },
                Data: partyRequest
            };
            const response = await ApiManager.apiRequest(apiData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const joinParty = createAsyncThunk(
    'party/joinParty',
    async (joinPartyRequest, { rejectWithValue }) => {
        try {
            const apiData = {
                Url: `${baseUrl}/api/v1/party/joinParty`,
                Method: 'POST',
                Headers: {
                    'Content-Type': 'application/json'
                },
                Data: joinPartyRequest
            };
            const response = await ApiManager.apiRequest(apiData);
            localStorage.setItem("currentPartyId", response)
            return response;
            
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getParty = createAsyncThunk(
    'party/getParty',
    async ({ rejectWithValue }) => {
        try {
            const partyId = localStorage.getItem("currentPartyId");
            console.log("PartyId redux:",partyId)
            const apiData = {
                Url: `${baseUrl}/api/v1/party/getParty?partyId=${partyId}`, 
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

export const addToPartyCart = createAsyncThunk(
    'party/addToPartyCart',
    async (request, { rejectWithValue }) => {
        try {
            const apiData = {
                Url: `${baseUrl}/api/v1/party/addToPartyCart`,
                Method: 'POST',
                Headers: {
                    'Content-Type': 'application/json'
                },
                Data: request
            };
            const response = await ApiManager.apiRequest(apiData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getPartyCart = createAsyncThunk(
    'party/getPartyCart',
    async (partyId, { rejectWithValue }) => {
        try {
            const apiData = {
                Url: `${baseUrl}/api/v1/party/getPartyCart?partyId=${partyId}`,
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

export const leaveParty = createAsyncThunk(
    'party/leaveParty',
    async ({ partyId, userId }, { rejectWithValue }) => {
        try {
            const apiData = {
                Url: `${baseUrl}/api/v1/party/leave`,
                Method: 'POST',
                Headers: {
                    'Content-Type': 'application/json'
                },
                Data: {
                    PartyId: partyId,
                    UserId: userId
                }
            };
            const response = await ApiManager.apiRequest(apiData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    currentParty: null,
    partyCart: [],
    partyLink: null,
    loading: false,
    error: null,
};

const partySlice = createSlice({
    name: 'party',
    initialState,
    reducers: {
        clearPartyState: (state) => {
            state.currentParty = null;
            state.partyCart = [];
            state.partyLink = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createParty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createParty.fulfilled, (state, action) => {
                state.loading = false;
                state.currentParty = action.payload.partyId;
                state.partyLink = action.payload.partyLink;
            })
            .addCase(createParty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(joinParty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinParty.fulfilled, (state, action) => {
                state.loading = false;
                state.currentParty = action.payload;
            })
            .addCase(joinParty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getParty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getParty.fulfilled, (state, action) => {
                state.loading = false;
                state.currentParty = action.payload;
            })
            .addCase(getParty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(addToPartyCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToPartyCart.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addToPartyCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getPartyCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPartyCart.fulfilled, (state, action) => {
                state.loading = false;
                state.partyCart = action.payload;
            })
            .addCase(getPartyCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(leaveParty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(leaveParty.fulfilled, (state) => {
                state.loading = false;
                state.currentParty = null;
                state.partyCart = [];
                state.partyLink = null;
            })
            .addCase(leaveParty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearPartyState } = partySlice.actions;
export default partySlice.reducer;