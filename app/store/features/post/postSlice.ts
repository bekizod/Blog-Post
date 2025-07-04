// ~/store/features/post/postSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "~/store";

interface Author {
  id: number;
  username: string;
  email: string;
}

interface Comment {
  id: number;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentCount: number;
  isLiked?: boolean;
  comments?: Comment[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PostsResponse {
  data: Post[];
  pagination: Pagination;
}

interface CommentsResponse {
  data: Comment[];
  pagination: Pagination;
}

interface PostState {
  posts: Post[];
  currentPost: Post | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  postsPagination: Pagination;
  commentsPagination: Pagination;
  searchQuery: string;
}

const initialState: PostState = {
  posts: [],
  currentPost: null,
  comments: [],
  loading: false,
  error: null,
  postsPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  commentsPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  searchQuery: "",
};

const getAuthHeaders = (state: RootState) => {
  return {
    headers: {
      Authorization: `Bearer ${state.auth.token}`,
    },
  };
};

// Async thunks
export const fetchPosts = createAsyncThunk<
  PostsResponse,
  { page?: number; limit?: number; search?: string },
  { state: RootState }
>("post/fetchPosts", async ({ page = 1, limit = 10, search = "" }, { getState }) => {
  const response = await axios.get(
    `https://course-start.onrender.com/posts?page=${page}&limit=${limit}&search=${search}`,
    getAuthHeaders(getState())
  );
  return response.data;
});

export const fetchPostById = createAsyncThunk<Post, number, { state: RootState }>(
  "post/fetchPostById",
  async (postId, { getState }) => {
    const response = await axios.get(
      `https://course-start.onrender.com/posts/${postId}`,
      getAuthHeaders(getState())
    );
    return response.data;
  }
);

export const fetchPostComments = createAsyncThunk<
  { postId: number; data: CommentsResponse },
  { postId: number; page?: number; limit?: number },
  { state: RootState }
>("post/fetchPostComments", async ({ postId, page = 1, limit = 10 }, { getState }) => {
  const response = await axios.get(
    `https://course-start.onrender.com/posts/${postId}/comments?page=${page}&limit=${limit}`,
    getAuthHeaders(getState())
  );
  return { postId, data: response.data };
});

export const updatePost = createAsyncThunk<
  Post,
  { postId: number; title: string; content: string },
  { state: RootState }
>("post/updatePost", async ({ postId, title, content }, { getState }) => {
  const response = await axios.patch(
    `https://course-start.onrender.com/posts/${postId}`,
    { title, content },
    getAuthHeaders(getState())
  );
  return response.data;
});

export const createPost = createAsyncThunk<
  Post,
  { title: string; content: string },
  { state: RootState }
>("post/createPost", async ({ title, content }, { getState }) => {
  const response = await axios.post(
    "https://course-start.onrender.com/posts/createPost",
    { title, content },
    {
      headers: {
        Authorization: `Bearer ${getState().auth.token}`,
      },
    }
  );
  return response.data;
});

export const deletePost = createAsyncThunk<number, number, { state: RootState }>(
  "post/deletePost",
  async (postId, { getState }) => {
    await axios.delete(
      `https://course-start.onrender.com/posts/${postId}`,
      getAuthHeaders(getState())
    );
    return postId;
  }
);

export const addComment = createAsyncThunk<
  Comment,
  { postId: number; content: string },
  { state: RootState }
>("post/addComment", async ({ postId, content }, { getState }) => {
  const response = await axios.post(
    `https://course-start.onrender.com/posts/${postId}/comments`,
    { content },
    getAuthHeaders(getState())
  );
  return response.data;
});

export const toggleLike = createAsyncThunk<
  { postId: number; isLiked: boolean },
  number,
  { state: RootState }
>("post/toggleLike", async (postId, { getState }) => {
  await axios.post(
    `https://course-start.onrender.com/posts/${postId}/likes`,
    {},
    getAuthHeaders(getState())
  );
  
  const checkResponse = await axios.get(
    `https://course-start.onrender.com/posts/${postId}/likes/check`,
    getAuthHeaders(getState())
  );
  
  return { postId, isLiked: checkResponse.data.isLiked };
});

export const checkLikeStatus = createAsyncThunk<
  { postId: number; isLiked: boolean },
  number,
  { state: RootState }
>("post/checkLikeStatus", async (postId, { getState }) => {
  const response = await axios.get(
    `https://course-start.onrender.com/posts/${postId}/likes/check`,
    getAuthHeaders(getState())
  );
  return { postId, isLiked: response.data.isLiked };
});

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    resetCurrentPost(state) {
      state.currentPost = null;
    },
    setPostsPage(state, action: PayloadAction<number>) {
      state.postsPagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.data;
        state.postsPagination = action.payload.pagination;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch posts";
      })
      
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create post";
      })
      
      // Fetch Post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch post";
      })
      
      // Fetch Post Comments
      .addCase(fetchPostComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        state.loading = false;
        const { postId, data } = action.payload;
        state.comments = data.data;
        state.commentsPagination = data.pagination;
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch comments";
      })
      
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
        state.posts = state.posts.map(post => 
          post.id === action.payload.id ? action.payload : post
        );
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update post";
      })
      
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter(post => post.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete post";
      })
      
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = [action.payload, ...state.comments];
        if (state.currentPost) {
          state.currentPost.commentCount += 1;
          if (!state.currentPost.comments) {
            state.currentPost.comments = [];
          }
          state.currentPost.comments = [action.payload, ...state.currentPost.comments];
        }
        state.posts = state.posts.map(post => {
          if (post.id === action.meta.arg.postId) {
            return {
              ...post,
              commentCount: post.commentCount + 1,
              comments: post.comments ? [action.payload, ...post.comments] : [action.payload],
            };
          }
          return post;
        });
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add comment";
      })
      
      // Toggle Like
      .addCase(toggleLike.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.loading = false;
        const { postId, isLiked } = action.payload;
        
        if (state.currentPost?.id === postId) {
          state.currentPost.likesCount += isLiked ? 1 : -1;
          state.currentPost.isLiked = isLiked;
        }
        
        state.posts = state.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likesCount: post.likesCount + (isLiked ? 1 : -1),
              isLiked,
            };
          }
          return post;
        });
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to toggle like";
      })
      
      // Check Like Status
      .addCase(checkLikeStatus.fulfilled, (state, action) => {
        const { postId, isLiked } = action.payload;
        
        if (state.currentPost?.id === postId) {
          state.currentPost.isLiked = isLiked;
        }
        
        state.posts = state.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked,
            };
          }
          return post;
        });
      });
  },
});

export const { setSearchQuery, resetCurrentPost, setPostsPage } = postSlice.actions;
export default postSlice.reducer;

// Selectors
export const selectPosts = (state: RootState) => state.post.posts;
export const selectCurrentPost = (state: RootState) => state.post.currentPost;
export const selectComments = (state: RootState) => state.post.comments;
export const selectPostsLoading = (state: RootState) => state.post.loading;
export const selectPostsError = (state: RootState) => state.post.error;
export const selectPostsPagination = (state: RootState) => state.post.postsPagination;
export const selectCommentsPagination = (state: RootState) => state.post.commentsPagination;
export const selectSearchQuery = (state: RootState) => state.post.searchQuery;
export const selectPostById = (postId: number) => (state: RootState) =>
  state.post.posts.find(post => post.id === postId);