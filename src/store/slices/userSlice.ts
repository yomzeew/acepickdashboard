import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../config/axios';

// Profile interface for nested profile data
export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  fcmToken: string | null;
  avatar: string;
  birthDate: string | null;
  verified: boolean;
  notified: boolean;
  totalJobs: number;
  totalExpense: number;
  rate: string;
  totalJobsDeclined: number;
  totalJobsPending: number;
  count: number;
  totalJobsOngoing: number;
  totalJobsCompleted: number;
  totalReview: number;
  totalJobsApproved: number;
  totalJobsCanceled: number;
  totalDisputes: number;
  bvn: string | null;
  bvnVerified: boolean | null;
  switch: boolean;
  store: boolean;
  position: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Base user interface
export interface BaseUser {
  id: string;
  email: string;
  fcmToken: string | null;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  role: 'client' | 'professional' | 'delivery' | 'corporate';
  agreed: boolean;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile;
}

// Specific user types
export interface Client extends BaseUser {
  role: 'client';
}

export interface Professional extends BaseUser {
  role: 'professional';
}

export interface Rider extends BaseUser {
  role: 'delivery';
}

export interface Corporate extends BaseUser {
  role: 'corporate';
}

// API Response interface
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T[];
}

// Union type for all user types
export type User = Client | Professional | Rider | Corporate;

interface UserState {
  clients: Client[];
  professionals: Professional[];
  riders: Rider[];
  corporates: Corporate[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
}

const initialState: UserState = {
  clients: [],
  professionals: [],
  riders: [],
  corporates: [],
  loading: false,
  error: null,
  selectedUser: null,
};

// Async thunks
export const fetchClients = createAsyncThunk(
  'users/fetchClients',
  async (params: { search?: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Client>>('/api/admin/client/all', { params });
      console.log(response.data)
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
    }
  }
);

export const fetchProfessionals = createAsyncThunk(
  'users/fetchProfessionals',
  async (params: { search?: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Professional>>('/api/admin/professional/all', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch professionals');
    }
  }
);

export const fetchRiders = createAsyncThunk(
  'users/fetchRiders',
  async (params: { search?: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Rider>>('/api/admin/delivery/all', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch riders');
    }
  }
);

export const fetchCorporates = createAsyncThunk(
  'users/fetchCorporates',
  async (params: { search?: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Corporate>>('/api/admin/corporate/all', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch corporates');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateUserStatus',
  async (
    { userId, status, userType }: { userId: string; status: string; userType: 'client' | 'professional' | 'delivery' | 'corporate' },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.patch(`/api/admin/${userType}/${userId}/status`, { status });
      return { userId, status, userType, user: response.data.user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

export const verifyUser = createAsyncThunk(
  'users/verifyUser',
  async (
    { userId, userType }: { userId: string; userType: 'client' | 'professional' | 'delivery' | 'corporate' },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.patch(`/api/admin/${userType}/${userId}/verify`);
      return { userId, userType, user: response.data.user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify user');
    }
  }
);

export const toggleSuspendUser = createAsyncThunk(
  'users/toggleSuspendUser',
  async (
    { userId, userType }: { userId: string; userType: 'client' | 'professional' | 'delivery' | 'corporate' },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(`/api/admin/user/togggle-suspend/${userId}`, {});
      return { userId, userType, user: response.data};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle user suspend status');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload.data;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Professionals
      .addCase(fetchProfessionals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfessionals.fulfilled, (state, action) => {
        state.loading = false;
        state.professionals = action.payload.data;
      })
      .addCase(fetchProfessionals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Riders
      .addCase(fetchRiders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRiders.fulfilled, (state, action) => {
        state.loading = false;
        state.riders = action.payload.data;
      })
      // Fetch Corporates
      .addCase(fetchCorporates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCorporates.fulfilled, (state, action) => {
        state.loading = false;
        state.corporates = action.payload.data;
      })
      .addCase(fetchCorporates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRiders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update User Status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { userId, status, userType } = action.payload;
        let userArray: User[];
        switch (userType) {
          case 'client':
            userArray = state.clients;
            break;
          case 'professional':
            userArray = state.professionals;
            break;
          case 'delivery':
            userArray = state.riders;
            break;
          case 'corporate':
            userArray = state.corporates;
            break;
          default:
            return;
        }
        const userIndex = userArray.findIndex((user) => user.id === userId);
        if (userIndex !== -1) {
          (userArray as any)[userIndex].status = status;
        }
      })
      // Verify User
      .addCase(verifyUser.fulfilled, (state, action) => {
        const { userId, userType } = action.payload;
        let userArray: User[];
        switch (userType) {
          case 'client':
            userArray = state.clients;
            break;
          case 'professional':
            userArray = state.professionals;
            break;
          case 'delivery':
            userArray = state.riders;
            break;
          case 'corporate':
            userArray = state.corporates;
            break;
          default:
            return;
        }
        const userIndex = userArray.findIndex((user) => user.id === userId);
        if (userIndex !== -1) {
          (userArray as any)[userIndex].profile.verified = true;
        }
      });
  },
});

export const { clearError, setSelectedUser } = userSlice.actions;
export default userSlice.reducer;
