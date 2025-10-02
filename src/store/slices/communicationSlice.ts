import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'admin' | 'client' | 'professional' | 'rider';
  message: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  attachments?: string[];
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    type: 'admin' | 'client' | 'professional' | 'rider';
    avatar?: string;
  }[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'closed';
  subject?: string;
  relatedOrderId?: string;
  relatedServiceId?: string;
}

export interface CallLog {
  id: string;
  callerId: string;
  callerName: string;
  callerType: 'admin' | 'client' | 'professional' | 'rider';
  receiverId: string;
  receiverName: string;
  receiverType: 'admin' | 'client' | 'professional' | 'rider';
  duration: number; // in seconds
  status: 'completed' | 'missed' | 'declined';
  timestamp: string;
  notes?: string;
  relatedOrderId?: string;
  relatedServiceId?: string;
}

interface CommunicationState {
  conversations: Conversation[];
  messages: ChatMessage[];
  callLogs: CallLog[];
  activeConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  unreadMessagesCount: number;
}

const initialState: CommunicationState = {
  conversations: [],
  messages: [],
  callLogs: [],
  activeConversation: null,
  loading: false,
  error: null,
  unreadMessagesCount: 0,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'communication/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/communication/conversations');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'communication/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/communication/conversations/${conversationId}/messages`);
      return response.data.messages;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'communication/sendMessage',
  async (
    { conversationId, message, attachments }: { conversationId: string; message: string; attachments?: File[] },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('message', message);
      if (attachments) {
        attachments.forEach((file) => formData.append('attachments', file));
      }
      
      const response = await axios.post(`/api/communication/conversations/${conversationId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const initiateCall = createAsyncThunk(
  'communication/initiateCall',
  async ({ userId, userType }: { userId: string; userType: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/communication/calls/initiate', { userId, userType });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate call');
    }
  }
);

export const fetchCallLogs = createAsyncThunk(
  'communication/fetchCallLogs',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/communication/calls/logs', { params });
      return response.data.callLogs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch call logs');
    }
  }
);

export const createConversation = createAsyncThunk(
  'communication/createConversation',
  async (
    { userId, userType, subject, relatedId }: { userId: string; userType: string; subject?: string; relatedId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/api/communication/conversations', {
        userId,
        userType,
        subject,
        relatedId,
      });
      return response.data.conversation;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation');
    }
  }
);

const communicationSlice = createSlice({
  name: 'communication',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload;
    },
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      state.messages = state.messages.map(message =>
        message.conversationId === conversationId ? { ...message, isRead: true } : message
      );
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
    addNewMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
      const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conversation) {
        conversation.lastMessage = action.payload.message;
        conversation.lastMessageTime = action.payload.timestamp;
        if (action.payload.senderType !== 'admin') {
          conversation.unreadCount += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations;
        state.unreadMessagesCount = action.payload.unreadCount;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Messages
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      // Fetch Call Logs
      .addCase(fetchCallLogs.fulfilled, (state, action) => {
        state.callLogs = action.payload;
      })
      // Create Conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
      });
  },
});

export const { clearError, setActiveConversation, markMessagesAsRead, addNewMessage } = communicationSlice.actions;
export default communicationSlice.reducer;
