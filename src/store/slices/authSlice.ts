import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../config/axios';

export interface User {
  id: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    verified: boolean;
  };
  wallet?: {
    currentBalance: string;
    currency: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    state: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Helper to safely get token from localStorage
const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('acepick_admin_token');
};

const initialState: AuthState = {
  user: null,
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Login failed');
      }

      const { user, token } = response.data.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Store token in localStorage
      localStorage.setItem('acepick_admin_token', token);
      
      // Format user data to match our User interface
      const formattedUser: User = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        status: user.status,
        role: user.role,
        profile: {
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          avatar: user.profile?.avatar,
          verified: user.profile?.verified || false
        },
        wallet: user.wallet ? {
          currentBalance: user.wallet.currentBalance,
          currency: user.wallet.currency
        } : undefined,
        location: user.location ? {
          latitude: user.location.latitude,
          longitude: user.location.longitude,
          state: user.location.state || '',
          address: user.location.address || ''
        } : undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return { user: formattedUser, token };
    } catch (error: any) {
      localStorage.removeItem('acepick_admin_token');
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      const { user, token } = response.data;
      localStorage.setItem('acepick_admin_token', token);
      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('acepick_admin_token');
  return null;
});

export const checkAuth = createAsyncThunk('auth/check', async (_, { getState }) => {
  const { auth } = getState() as { auth: AuthState };
  return { isAuthenticated: !!auth.token };
});


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers(builder) {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('acepick_admin_token');
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
