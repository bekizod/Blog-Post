import { configureStore } from '@reduxjs/toolkit';
// Import your reducers here
import authReducer from './features/auth/authSlice';
import registerReducer from './features/auth/registerSlice';
import profileReducer from './features/profileSlice';
 import postReducer from './features/post/postSlice';

export const store = configureStore({
  reducer: {
     auth: authReducer,
     register: registerReducer,
     profile: profileReducer,
     post: postReducer,
    // posts: postsReducer,
    // Add more slices here
  },
});

// Types for use in hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
