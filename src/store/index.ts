import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import marketplaceReducer from './slices/marketplaceSlice';
import serviceReducer from './slices/serviceSlice';
import deliveryReducer from './slices/deliverySlice';
import communicationReducer from './slices/communicationSlice';
import disputeReducer from './slices/disputeSlice';
import analyticsReducer from './slices/analyticsSlice';
import financeReducer from './slices/financeSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    marketplace: marketplaceReducer,
    services: serviceReducer,
    delivery: deliveryReducer,
    communication: communicationReducer,
    disputes: disputeReducer,
    analytics: analyticsReducer,
    finance: financeReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
