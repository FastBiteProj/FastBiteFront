import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import ApiManager from '../../apiManager';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;


export const fetchTables = createAsyncThunk(
  "reservation/fetchTables",
  async (date) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Table/Get`, 
        Params: { dateString: date },
        Method: "GET",
        Headers: {
          "Content-Type": "application/json"
        },
      };

      const data = await ApiManager.apiRequest(apiData);
      console.log(data);
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
);


export const createReservation = createAsyncThunk(
  'reservation/createReservation',
  async (reservationData, { rejectWithValue }) => {
    try {
      console.log(reservationData);
      const apiData = {
        Url: `${baseUrl}/api/v1/Reservation/Create`,
        Method: 'POST',
        Headers: {
          'Content-Type': 'application/json',
        },
        Data: reservationData
      };

      const data = await ApiManager.apiRequest(apiData);
      console.log('Reservation created:', data);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReservation = createAsyncThunk(
  "reservation/fetchReservation",
  async (reservationId, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Reservation/Get/${reservationId}`,
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

export const updateReservation = createAsyncThunk(
  "reservation/updateReservation",
  async ({ reservationId, reservationData }, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Reservation/Edit?Id=${reservationId}`,
        Method: 'PUT',
        Headers: {
          'Content-Type': 'application/json'
        },
        Data: reservationData
      };

      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteReservation = createAsyncThunk(
  "reservation/deleteReservation",
  async (reservationId, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Reservation/Delete?Id=${reservationId}`,
        Method: 'DELETE',
        Headers: {
          'Content-Type': 'application/json'
        }
      };

      await ApiManager.apiRequest(apiData);
      return reservationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const reservationSlice = createSlice({
  name: 'reservation',
  initialState: {
    selectedTable: null,
    selectedDate: '',
    selectedTime: '',
    guestsCount: 1,
    orders: {
      items: {},
      total: 0,
    },
    tables: [],
    status: 'idle',
    error: null
  },
  reducers: {
    setSelectedTable: (state, action) => {
      state.selectedTable = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = action.payload;
    },
    setGuestsCount: (state, action) => {
      state.guestsCount = action.payload;
    },
    addOrderItem: (state, action) => {
      const { id, name, price, quantity } = action.payload;
      console.log('Adding item:', action.payload);
      state.orders.items[id] = {
        name,
        price,
        quantity,
      };
      state.orders.total = Object.values(state.orders.items)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    removeOrderItem: (state, action) => {
      const { id } = action.payload;
      delete state.orders.items[id];
      state.orders.total = Object.values(state.orders.items)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    updateOrderItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (state.orders.items[id]) {
        state.orders.items[id].quantity = quantity;
        state.orders.total = Object.values(state.orders.items)
          .reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
    },
    clearOrders: (state) => {
      state.orders = {
        items: {},
        total: 0,
      };
    },
    setReservationStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    resetReservation: (state) => {
      state.selectedTable = null;
      state.selectedDate = '';
      state.selectedTime = '';
      state.guestsCount = 1;
      state.orders = {
        items: {},
        total: 0,
      };
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchTables
      .addCase(fetchTables.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tables = action.payload;
        state.error = null;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Обработка createReservation
      .addCase(createReservation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Можно добавить дополнительную логику при успешном создании
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchReservation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReservation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedTable = action.payload.tableId;
        state.selectedDate = action.payload.date;
        state.selectedTime = action.payload.time;
        state.guestsCount = action.payload.guestsCount;
      })
      .addCase(fetchReservation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateReservation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedTable = action.payload.tableId;
        state.selectedDate = action.payload.date;
        state.selectedTime = action.payload.time;
        state.guestsCount = action.payload.guestsCount;
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteReservation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteReservation.fulfilled, (state) => {
        state.status = 'succeeded';
        state.selectedTable = null;
        state.selectedDate = '';
        state.selectedTime = '';
        state.guestsCount = 1;
      })
      .addCase(deleteReservation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const {
  setSelectedTable,
  setSelectedDate,
  setSelectedTime,
  setGuestsCount,
  addOrderItem,
  removeOrderItem,
  updateOrderItemQuantity,
  clearOrders,
  setReservationStatus,
  setError,
  resetReservation
} = reservationSlice.actions;

export const selectReservation = (state) => state.reservation;
export const selectOrders = (state) => state.reservation.orders;
export const selectReservationStatus = (state) => state.reservation.status;

export default reservationSlice.reducer;