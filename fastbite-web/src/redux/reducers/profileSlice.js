import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiManager from '../../apiManager';
import Cookies from 'js-cookie';

const baseUrl = import.meta.env.VITE_API_URL;

export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('accessToken');
      const apiData = {
        Url: `${baseUrl}/api/v1/Account/UserInfo`,
        Method: 'GET',
        Headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await ApiManager.apiRequest(apiData);
      console.log(response);
      
      if (!response) {
        throw new Error('No response from server');
      }
        return {
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          email: response.email || '',
          phoneNumber: response.phoneNumber || '',
        };
    } catch (error) {
      console.error('Profile fetch error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });

      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch user profile'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (updateUserDTO, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Account/UpdateUser`,
        Method: 'PUT',
        Headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        Data: updateUserDTO
      };

      const response = await ApiManager.apiRequest(apiData);
      
      if (response) {
        console.log('Update successful:', response);
        return response;
      }
      
      throw new Error('No response from server');
    } catch (error) {
      console.error('Update profile error:', error);
      return rejectWithValue(error.message || 'Failed to update user profile');
    }
  }
);

export const fetchReservations = createAsyncThunk(
  'profile/fetchReservations',
  async (_, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Reservation/Get`,
        Method: 'GET',
        Headers: {
          'Content-Type': 'application/json',
        }
      };

      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reservations');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'profile/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Order/GetAll`,
        Method: 'GET',
        Headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      };

      const response = await ApiManager.apiRequest(apiData);
      
      if (!response) {
        throw new Error('No response from server');
      }

      console.log('Orders fetched:', response);
      return response;
    } catch (error) {
      console.error('Fetch orders error:', error);
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'profile/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      
      const apiData = {
        Url: `${baseUrl}/api/v1/Account/GetUsers`,
        Method: 'GET',
        Headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const deleteUserByAdmin = createAsyncThunk(
  'profile/deleteUserByAdmin',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const token = Cookies.get('token');
      
      const apiData = {
        Url: `${baseUrl}/api/v1/Account/DeleteUser`,
        Method: 'DELETE',
        Headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        Params: { userId }
      };

      const response = await ApiManager.apiRequest(apiData);
      
      await dispatch(fetchUsers());
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

export const updateUserByAdmin = createAsyncThunk(
  'profile/updateUserByAdmin',
  async ({ userId, updateUserDto }, { rejectWithValue, dispatch }) => {
    try {
      const token = Cookies.get('token');
      
      const apiData = {
        Url: `${baseUrl}/api/v1/Account/UpdateUserByAdmin`,
        Method: 'PUT',
        Headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        Params: { userId },
        Data: updateUserDto
      };

      const response = await ApiManager.apiRequest(apiData);
      
      await dispatch(fetchUsers());
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update user');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
    updateStatus: 'idle',
    updateError: null,
    reservationStatus: 'idle',
    reservationError: null,
    reservations: null,
    orders: null,
    ordersStatus: 'idle',
    ordersError: null,
    users: [],
    usersStatus: 'idle',
    usersError: null,
    deleteUserStatus: 'idle',
    deleteUserError: null,
    updateUserByAdminStatus: 'idle',
    updateUserByAdminError: null
  },
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
      state.updateError = null;
      state.reservationError = null;
      state.ordersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        state.user = { ...state.user, ...action.meta.arg };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload;
      })
      .addCase(fetchReservations.pending, (state) => {
        state.reservationStatus = 'loading';
        state.reservationError = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.reservationStatus = 'succeeded';
        state.reservations = action.payload;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.reservationStatus = 'failed';
        state.reservationError = action.payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.ordersStatus = 'loading';
        state.ordersError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.ordersStatus = 'succeeded';
        state.orders = action.payload;
        state.ordersError = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.ordersStatus = 'failed';
        state.ordersError = action.payload;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.usersStatus = 'loading';
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersStatus = 'succeeded';
        state.users = action.payload;
        state.usersError = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersStatus = 'failed';
        state.usersError = action.payload;
      })
      .addCase(deleteUserByAdmin.pending, (state) => {
        state.deleteUserStatus = 'loading';
        state.deleteUserError = null;
      })
      .addCase(deleteUserByAdmin.fulfilled, (state) => {
        state.deleteUserStatus = 'succeeded';
      })
      .addCase(deleteUserByAdmin.rejected, (state, action) => {
        state.deleteUserStatus = 'failed';
        state.deleteUserError = action.payload;
      })
      
      .addCase(updateUserByAdmin.pending, (state) => {
        state.updateUserByAdminStatus = 'loading';
        state.updateUserByAdminError = null;
      })
      .addCase(updateUserByAdmin.fulfilled, (state) => {
        state.updateUserByAdminStatus = 'succeeded';
      })
      .addCase(updateUserByAdmin.rejected, (state, action) => {
        state.updateUserByAdminStatus = 'failed';
        state.updateUserByAdminError = action.payload;
      });
  },
});

export const { clearProfileError } = profileSlice.actions;

export default profileSlice.reducer;