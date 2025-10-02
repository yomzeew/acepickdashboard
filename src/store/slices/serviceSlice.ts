import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  professionalId: string;
  professionalName: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  rating: number;
  totalBookings: number;
  images: string[];
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  clientId: string;
  professionalId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  scheduledDate: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  completedAt?: string;
  clientName: string;
  professionalName: string;
  serviceTitle: string;
  notes?: string;
}

interface ServiceState {
  services: Service[];
  serviceRequests: ServiceRequest[];
  loading: boolean;
  error: string | null;
  selectedService: Service | null;
  selectedRequest: ServiceRequest | null;
  pagination: {
    services: { page: number; total: number; limit: number };
    requests: { page: number; total: number; limit: number };
  };
}

const initialState: ServiceState = {
  services: [],
  serviceRequests: [],
  loading: false,
  error: null,
  selectedService: null,
  selectedRequest: null,
  pagination: {
    services: { page: 1, total: 0, limit: 10 },
    requests: { page: 1, total: 0, limit: 10 },
  },
};

// Async thunks
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (params: { page?: number; limit?: number; status?: string; search?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/services', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const fetchServiceRequests = createAsyncThunk(
  'services/fetchServiceRequests',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/services/requests', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service requests');
    }
  }
);

export const updateServiceStatus = createAsyncThunk(
  'services/updateServiceStatus',
  async ({ serviceId, status }: { serviceId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/services/${serviceId}/status`, { status });
      return response.data.service;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service status');
    }
  }
);

export const resolveServiceDispute = createAsyncThunk(
  'services/resolveServiceDispute',
  async (
    { requestId, resolution, refundAmount }: { requestId: string; resolution: string; refundAmount?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(`/api/services/requests/${requestId}/resolve`, {
        resolution,
        refundAmount,
      });
      return response.data.request;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve dispute');
    }
  }
);

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedService: (state, action: PayloadAction<Service | null>) => {
      state.selectedService = action.payload;
    },
    setSelectedRequest: (state, action: PayloadAction<ServiceRequest | null>) => {
      state.selectedRequest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.services;
        state.pagination.services = {
          page: action.payload.page,
          total: action.payload.total,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Service Requests
      .addCase(fetchServiceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceRequests = action.payload.requests;
        state.pagination.requests = {
          page: action.payload.page,
          total: action.payload.total,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchServiceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Service Status
      .addCase(updateServiceStatus.fulfilled, (state, action) => {
        const serviceIndex = state.services.findIndex(s => s.id === action.payload.id);
        if (serviceIndex !== -1) {
          state.services[serviceIndex] = action.payload;
        }
      })
      // Resolve Service Dispute
      .addCase(resolveServiceDispute.fulfilled, (state, action) => {
        const requestIndex = state.serviceRequests.findIndex(r => r.id === action.payload.id);
        if (requestIndex !== -1) {
          state.serviceRequests[requestIndex] = action.payload;
        }
      });
  },
});

export const { clearError, setSelectedService, setSelectedRequest } = serviceSlice.actions;
export default serviceSlice.reducer;
