import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import {
  addComment,
  checkLikeStatus,
  createPost,
  deletePost,
  fetchPostComments,
  fetchPosts,
  toggleLike,
  updatePost,
  selectPosts,
  selectPostsLoading,
  selectPostsError,
  selectPostsPagination,
  setPostsPage,
} from "~/store/features/post/postSlice";
import { initializeAuth } from "~/store/features/auth/authSlice";
import { toast } from "react-hot-toast";
import {
  FiBookmark,
  FiEdit2,
  FiTrash2,
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiX,
  FiPlus,
} from "react-icons/fi";
import { useNavigate } from "react-router";

type CommentFormData = {
  content: string;
  postId: number;
};

type PostFormData = {
  title: string;
  content: string;
  id: number;
};

type CreatePostFormData = {
  title: string;
  content: string;
};

export default function Blog() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.profile);
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const posts = useAppSelector(selectPosts);
  const loading = useAppSelector(selectPostsLoading);
  const error = useAppSelector(selectPostsError);
  const pagination = useAppSelector(selectPostsPagination);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState<Record<number, boolean>>({});
  const [currentEditPost, setCurrentEditPost] = useState<PostFormData | null>(
    null
  );
  const [currentPostForModal, setCurrentPostForModal] = useState<any>(null);
  const [commentsModalPage, setCommentsModalPage] = useState(1);
  const [commentsModalTotalPages, setCommentsModalTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Forms
  const {
    register: registerComment,
    handleSubmit: handleCommentSubmit,
    reset: resetComment,
    formState: { errors: commentErrors },
  } = useForm<CommentFormData>();

  const {
    register: registerPost,
    handleSubmit: handlePostSubmit,
    reset: resetPost,
    formState: { errors: postErrors },
  } = useForm<PostFormData>();

  const {
    register: registerCreatePost,
    handleSubmit: handleCreatePostSubmit,
    reset: resetCreatePost,
    formState: { errors: createPostErrors },
  } = useForm<CreatePostFormData>();

  // Initialize auth and fetch posts
  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(fetchPosts({ page: 1, limit: 5, search: searchQuery }));
  }, [dispatch, searchQuery]);

  // Fetch initial comments for each post
  useEffect(() => {
    if (posts.length > 0) {
      const fetchPostData = async () => {
        for (const post of posts) {
          await dispatch(
            fetchPostComments({ postId: post.id, page: 1, limit: 2 })
          );
          await dispatch(checkLikeStatus(post.id));
        }
      };
      fetchPostData();
    }
  }, [dispatch, posts.length]);

  useEffect(() => {
    // Check both isAuthenticated and token on component mount
    if (!isAuthenticated && !token) {
      navigate("/");
    }
  }, [isAuthenticated, token, navigate]);

  const openCommentsModal = (post: any) => {
    setCurrentPostForModal(post);
    setCommentsModalPage(1);
    setShowCommentsModal(true);
    dispatch(fetchPostComments({ postId: post.id, page: 1, limit: 10 }))
      .unwrap()
      .then((response) => {
        setCommentsModalTotalPages(Math.ceil(post.commentCount / 10));
      });
  };

  const handleCommentsPageChange = (page: number) => {
    setCommentsModalPage(page);
    dispatch(
      fetchPostComments({
        postId: currentPostForModal.id,
        page,
        limit: 10,
      })
    );
  };

  const onSubmitComment = (data: CommentFormData) => {
    dispatch(addComment({ postId: data.postId, content: data.content }))
      .unwrap()
      .then(() => {
        resetComment();
        toast.success("Comment added successfully");
        if (showCommentsModal) {
          dispatch(
            fetchPostComments({
              postId: currentPostForModal.id,
              page: commentsModalPage,
              limit: 10,
            })
          );
          // Refresh the post to update comment count
          dispatch(
            fetchPosts({ page: pagination.page, limit: 5, search: searchQuery })
          );
        } else {
          dispatch(
            fetchPostComments({
              postId: data.postId,
              page: 1,
              limit: 2,
            })
          );
        }
      })
      .catch(() => toast.error("Failed to add comment"));
  };

  const onSubmitPost = (data: PostFormData) => {
    if (!currentEditPost) return;
    dispatch(updatePost({ postId: currentEditPost.id, ...data }))
      .unwrap()
      .then(() => {
        setShowEditModal(false);
        toast.success("Post updated successfully");
        dispatch(
          fetchPosts({ page: pagination.page, limit: 5, search: searchQuery })
        );
      })
      .catch(() => toast.error("Failed to update post"));
  };

  const onCreatePost = (data: CreatePostFormData) => {
    dispatch(createPost(data))
      .unwrap()
      .then(() => {
        setShowCreateModal(false);
        resetCreatePost();
        toast.success("Post created successfully");
        dispatch(fetchPosts({ page: 1, limit: 5, search: searchQuery }));
      })
      .catch(() => toast.error("Failed to create post"));
  };

  const handleToggleLike = (postId: number) => {
    dispatch(toggleLike(postId))
      .unwrap()
      .then(() => {
        dispatch(checkLikeStatus(postId));
        dispatch(
          fetchPosts({ page: pagination.page, limit: 5, search: searchQuery })
        );
        toast.success("Like status updated");
      })
      .catch(() => toast.error("Failed to update like status"));
  };

  const handleDeletePost = (postId: number) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <p className="mb-4">Are you sure you want to delete this post?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              dispatch(deletePost(postId))
                .unwrap()
                .then(() => {
                  toast.success("Post deleted successfully");
                  dispatch(
                    fetchPosts({ page: 1, limit: 5, search: searchQuery })
                  );
                })
                .catch(() => toast.error("Failed to delete post"));
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  const toggleBookmark = (postId: number) => {
    setIsBookmarked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
    toast.success(
      isBookmarked[postId] ? "Removed from bookmarks" : "Added to bookmarks"
    );
  };

  const handlePageChange = (page: number) => {
    dispatch(setPostsPage(page));
    dispatch(fetchPosts({ page, limit: 5, search: searchQuery }));
  };

  const generateAvatar = (name: string) => {
    if (!name) return "US";
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    return initials.length >= 2
      ? initials.substring(0, 2)
      : initials + initials;
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header and Search */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Blog Posts
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <FiPlus className="mr-2" />
            Create Post
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search posts..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-4xl mx-auto space-y-8">
        {posts.map((post) => {
          const isAuthor = user?.id === post.author.id;
          const postComments = post.comments || [];

          return (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                {/* Author Info */}
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                    {generateAvatar(post.author.username)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {post.author.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {post.title}
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-4">
                  <p className="whitespace-pre-line">{post.content}</p>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center space-x-1 ${
                        post.isLiked ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      <FiHeart
                        className={`h-5 w-5 ${
                          post.isLiked ? "fill-current" : ""
                        }`}
                      />
                      <span>{post.likesCount}</span>
                    </button>
                    <button
                      onClick={() => openCommentsModal(post)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600"
                    >
                      <FiMessageSquare className="h-5 w-5" />
                      <span>{post.commentCount}</span>
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleBookmark(post.id)}
                      className={`p-1 rounded-full ${
                        isBookmarked[post.id]
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      }`}
                    >
                      <FiBookmark
                        className={`h-5 w-5 ${
                          isBookmarked[post.id] ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <FiShare2 className="h-5 w-5" />
                    </button>
                    {isAuthor && (
                      <>
                        <button
                          onClick={() => {
                            setCurrentEditPost(post);
                            resetPost({
                              title: post.title,
                              content: post.content,
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1 text-red-400 hover:text-red-500 dark:hover:text-red-300"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Comments */}
              {postComments.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="space-y-3">
                    {postComments.slice(0, 2).map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            {generateAvatar(
                              comment.author.email?.split("@")[0]
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {post.commentCount > 2 && (
                    <button
                      onClick={() => openCommentsModal(post)}
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400"
                    >
                      See all {post.commentCount} comments
                    </button>
                  )}
                </div>
              )}

              {/* Add Comment Form */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                <form
                  onSubmit={handleCommentSubmit((data) =>
                    onSubmitComment({ ...data, postId: post.id })
                  )}
                  className="flex space-x-3"
                >
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {user ? generateAvatar(user.username) : "YO"}
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="hidden"
                      {...registerComment("postId")}
                      value={post.id}
                    />
                    <textarea
                      {...registerComment("content", {
                        required: "Comment cannot be empty",
                      })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 text-sm"
                      rows={2}
                      placeholder="Write a comment..."
                    />
                    {commentErrors.postId?.message && (
                      <p className="mt-1 text-xs text-red-500">
                        {commentErrors.postId.message}
                      </p>
                    )}
                    {commentErrors.content && (
                      <p className="mt-1 text-xs text-red-500">
                        {commentErrors.content.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="self-start mt-1 px-3 py-2 bg-indigo-600 text-white rounded-md"
                  >
                    Post
                  </button>
                </form>
              </div>
            </article>
          );
        })}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="h-5 w-5" />
              Previous
            </button>

            <div className="hidden md:flex space-x-2">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        pagination.page === pageNum
                          ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              {pagination.totalPages > 5 &&
                pagination.page < pagination.totalPages - 2 && (
                  <span className="px-4 py-2 text-sm text-gray-700">...</span>
                )}

              {pagination.totalPages > 5 &&
                pagination.page < pagination.totalPages - 2 && (
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                  >
                    {pagination.totalPages}
                  </button>
                )}
            </div>

            <button
              onClick={() =>
                handlePageChange(
                  Math.min(pagination.totalPages, pagination.page + 1)
                )
              }
              disabled={pagination.page === pagination.totalPages}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Post
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreatePostSubmit(onCreatePost)}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    {...registerCreatePost("title", {
                      required: "Title is required",
                    })}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm p-2.5"
                  />
                  {createPostErrors.title && (
                    <p className="mt-1 text-xs text-red-500">
                      {createPostErrors.title.message}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    {...registerCreatePost("content", {
                      required: "Content is required",
                    })}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm p-2.5"
                    rows={8}
                  />
                  {createPostErrors.content && (
                    <p className="mt-1 text-xs text-red-500">
                      {createPostErrors.content.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    Create Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && currentEditPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Post
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handlePostSubmit(onSubmitPost)}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    {...registerPost("title", {
                      required: "Title is required",
                    })}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm p-2.5"
                  />
                  {postErrors.title && (
                    <p className="mt-1 text-xs text-red-500">
                      {postErrors.title.message}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    {...registerPost("content", {
                      required: "Content is required",
                    })}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm p-2.5"
                    rows={8}
                  />
                  {postErrors.content && (
                    <p className="mt-1 text-xs text-red-500">
                      {postErrors.content.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => handleDeletePost(currentEditPost.id)}
                    className="px-4 py-2 border border-red-500 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete Post
                  </button>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && currentPostForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Comments ({currentPostForModal.commentCount})
              </h3>
              <button
                onClick={() => setShowCommentsModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {currentPostForModal.title}
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                {currentPostForModal.content}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {currentPostForModal.comments?.length > 0 ? (
                <div className="space-y-4">
                  {currentPostForModal.comments.map((comment: any) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                          {generateAvatar(comment.author.email?.split("@")[0])}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {comment.author.email?.split("@")[0]}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-700 dark:text-gray-300">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No comments yet
                </p>
              )}
            </div>

            {/* Comments Pagination */}
            {commentsModalTotalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      handleCommentsPageChange(commentsModalPage - 1)
                    }
                    disabled={commentsModalPage === 1}
                    className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {commentsModalPage} of {commentsModalTotalPages}
                  </span>
                  <button
                    onClick={() =>
                      handleCommentsPageChange(commentsModalPage + 1)
                    }
                    disabled={commentsModalPage === commentsModalTotalPages}
                    className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form
                onSubmit={handleCommentSubmit((data) =>
                  onSubmitComment({ ...data, postId: currentPostForModal.id })
                )}
                className="flex space-x-3"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                    {user ? generateAvatar(user.username) : "YO"}
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="hidden"
                    {...registerComment("postId")}
                    value={currentPostForModal.id}
                  />
                  <textarea
                    {...registerComment("content", {
                      required: "Comment cannot be empty",
                    })}
                    className="w-full rounded-lg border-gray-300 p-3 text-sm"
                    rows={2}
                    placeholder="Write a comment..."
                  />
                  {commentErrors.postId === currentPostForModal.id &&
                    commentErrors.content && (
                      <p className="mt-1 text-xs text-red-500">
                        {commentErrors.content.message}
                      </p>
                    )}
                </div>
                <button
                  type="submit"
                  className="self-end mb-1 px-3 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
