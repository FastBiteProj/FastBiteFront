import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiManager from '../../apiManager';

const baseUrl = import.meta.env.VITE_API_URL;

export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Auth/Login`,
        Method: 'POST',
        Headers: {
          'Content-Type': 'application/json'
        },
        Data: {
          email: userData.email,
          password: userData.password
        }
      };

      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendRecoveryCode = createAsyncThunk(
  "auth/sendRecoveryCode",
  async (email, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Account/SendVerificationCode`,
        Method: 'POST',
        Headers: {
          'Content-Type': 'application/json'
        },
        Data: { email }
      };

      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Account/ResetPasswordWithCode`,
        Method: 'POST',
        Headers: {
          'Content-Type': 'application/json'
        },
        Data: resetData
      };

      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/Auth/Register`,
        Method: 'POST',
        Headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        Data: {
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          captchaToken: userData.captchaToken
        }
      };

      const response = await ApiManager.apiRequest(apiData);
      
      if (!response) {
        throw new Error('Empty response from server');
      }

      if (typeof response === 'string') {
        try {
          return JSON.parse(response);
        } catch (error) {
          return error;
        }
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Starting logout process');

      const apiData = {
        Url: `${baseUrl}/api/v1/Auth/Logout`,
        Method: 'POST',
        Headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      };

      await ApiManager.apiRequest(apiData);
    
      localStorage.removeItem('ORDER_STORAGE_KEY');
      localStorage.removeItem('ORDER_TIMESTAMP_KEY');
      localStorage.removeItem('profileData');
      localStorage.removeItem('restaurantOrder');
      
      return 'Logged out successfully';
    } catch (error) {
      console.error('Logout error:', error);
      
      localStorage.clear();
      
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log('Get user data...');

      const response = await fetch(`${baseUrl}/api/v1/Account/UserInfo`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);

        if (response.status === 401 || response.status === 400) {
          await dispatch(logout());
          return rejectWithValue('Session expired. Please login again.');
        }
        return rejectWithValue('Failed to refresh token');
      }

      const data = await response.json();
      console.log('Refresh successful, received data:', data);
      
      if (!data) {
        return rejectWithValue('No data received from server');
      }

      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      return rejectWithValue(error.message || 'An error occurred during token refresh');
    }
  }
);


const loadUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('userData');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    return {
      user: userData ? JSON.parse(userData) : null,
      isAuthenticated: isAuthenticated,
      loading: false,
      error: null,
      showPassword: false,
      successMessage: "",
      errorMessage: ""
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return initialState;
  }
};

const initialState = loadUserFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    togglePasswordVisibility: (state) => {
      state.showPassword = !state.showPassword;
    },
    clearMessages: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = {
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
          roles: action.payload.role
        };
        state.isAuthenticated = true;
        state.loading = false;
        
        localStorage.setItem('isAuthenticated', 'true');
      })
      
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload || 'Login failed';
        state.loading = false;
        state.isAuthenticated = false;
        
        localStorage.setItem('isAuthenticated', 'false');
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = {
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
        };
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload || 'Registration failed';
        state.loading = false;
      })
      .addCase(sendRecoveryCode.pending, (state) => {
        state.loading = true;
        state.successMessage = "";
        state.errorMessage = "";
      })
      .addCase(sendRecoveryCode.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(sendRecoveryCode.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.successMessage = "";
        state.errorMessage = "";
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        
        localStorage.removeItem('userData');
        localStorage.removeItem('isAuthenticated');
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Logout failed';
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        
        window.location.reload();
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = {
            id: action.payload.id,
            name: action.payload.name,
            email: action.payload.email,
            roles: action.payload.roles
          };
          state.isAuthenticated = true;
          state.error = null;
          
          localStorage.setItem('userData', JSON.stringify(state.user));
          ('isAuthenticated', 'true');
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Token refresh failed';
        
        localStorage.clear();
        localStorage.setItem('isAuthenticated', 'false');
      })
  },
});

export const { togglePasswordVisibility, clearMessages, setAuthExpired } = authSlice.actions;

export default authSlice.reducer;
