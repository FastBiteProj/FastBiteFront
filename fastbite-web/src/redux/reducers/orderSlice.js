import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ApiManager from "../../apiManager";
import { 
  ORDER_STORAGE_KEY, 
  ORDER_TIMESTAMP_KEY, 
  ORDER_TIMEOUT 
} from '../../constants/orderConstants';

const baseUrl = import.meta.env.VITE_API_URL;

const isOrderExpired = (timestamp) => {
  if (!timestamp) return true;
  return Date.now() - timestamp > ORDER_TIMEOUT;
};

const loadInitialState = () => {
  try {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated) {
      localStorage.removeItem(ORDER_STORAGE_KEY);
      localStorage.removeItem(ORDER_TIMESTAMP_KEY);
      return {
        order: [],
        totalPrice: 0,
        orderStatus: "idle",
        error: null,
      };
    }

    const savedOrder = localStorage.getItem(ORDER_STORAGE_KEY);
    const timestamp = localStorage.getItem(ORDER_TIMESTAMP_KEY);

    if (savedOrder && !isOrderExpired(Number(timestamp))) {
      const parsedOrder = JSON.parse(savedOrder);
      return {
        order: Array.isArray(parsedOrder.order) ? parsedOrder.order : [],
        totalPrice: parsedOrder.totalPrice || 0,
        orderStatus: "idle",
        error: null,
      };
    }
    
    localStorage.removeItem(ORDER_STORAGE_KEY);
    localStorage.removeItem(ORDER_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error loading order from localStorage:', error);
  }
  
  return {
    order: [],
    totalPrice: 0,
    orderStatus: "idle",
    error: null,
  };
};

export const createOrder = createAsyncThunk(
  "order/createOrder", 
  async (orderData, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Order/Create`,
        Method: 'POST',
        Headers: {
          'Content-Type': 'application/json'
        },
        Data: orderData
      };
      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrder = createAsyncThunk(
  "order/fetchOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Order/Get/${orderId}`,
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

export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ orderId, tableNumber }, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Order/Edit?orderId=${orderId}`,
        Method: 'PUT',
        Headers: {
          'Content-Type': 'application/json'
        },
        Data: tableNumber
      };

      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Order/Delete?orderId=${orderId}`,
        Method: 'DELETE',
        Headers: {
          'Content-Type': 'application/json'
        }
      };
      await ApiManager.apiRequest(apiData);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: loadInitialState(),
  reducers: {
    addToOrder: (state, action) => {
      console.log('Current order state:', state.order);
      console.log('Type of order:', typeof state.order);
      console.log('Is order an array?', Array.isArray(state.order));

      if (!Array.isArray(state.order)) {
        state.order = [];
      }

      state.order.push(action.payload);
      state.totalPrice += action.payload.price;
      
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify({
        order: state.order,
        totalPrice: state.totalPrice
      }));
      localStorage.setItem(ORDER_TIMESTAMP_KEY, Date.now().toString());
    },
    removeFromOrder: (state, action) => {
      const index = state.order.findIndex((item) => item.uniqueID === action.payload);
      if (index !== -1) {
        state.totalPrice -= state.order[index].price;
        state.order.splice(index, 1);
        
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify({
          order: state.order,
          totalPrice: state.totalPrice
        }));
      }
    },
    clearOrder: (state) => {
      state.order = [];
      state.totalPrice = 0;
      localStorage.removeItem(ORDER_STORAGE_KEY);
      localStorage.removeItem(ORDER_TIMESTAMP_KEY);
    },
    checkOrderExpiration: (state) => {
      const timestamp = localStorage.getItem(ORDER_TIMESTAMP_KEY);
      if (timestamp && isOrderExpired(Number(timestamp))) {
        state.order = [];
        state.totalPrice = 0;
        localStorage.removeItem(ORDER_STORAGE_KEY);
        localStorage.removeItem(ORDER_TIMESTAMP_KEY);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderStatus = "loading";
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.order = action.payload;
        state.orderStatus = "succeeded";
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchOrder.pending, (state) => {
        state.orderStatus = "loading";
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.order = action.payload;
        state.orderStatus = "succeeded";
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.orderStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updateOrder.pending, (state) => {
        state.orderStatus = "loading";
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.order = action.payload;
        state.orderStatus = "succeeded";
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.orderStatus = "failed";
        state.error = action.payload;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.orderStatus = "loading";
      })
      .addCase(deleteOrder.fulfilled, (state) => {
        state.order = [];
        state.totalPrice = 0;
        state.orderStatus = "succeeded";
        localStorage.removeItem(ORDER_STORAGE_KEY);
        localStorage.removeItem(ORDER_TIMESTAMP_KEY);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.orderStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { addToOrder, removeFromOrder, clearOrder, checkOrderExpiration } = orderSlice.actions;
export default orderSlice.reducer;