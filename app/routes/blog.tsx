import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { initializeAuth } from "~/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";

type Comment = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
};

type BlogPost = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  tags: string[];
};

type CommentFormData = {
  content: string;
};

type PostFormData = {
  title: string;
  content: string;
};

export default function BlogPostComponent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, token } = useAppSelector(
    (state) => state.auth
  );
  // Sample blog post data
  const [blogPost, setBlogPost] = useState<BlogPost>({
    id: "1",
    title: "Getting Started with Modern Web Development",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio.",
    author: "Alex Johnson",
    date: "May 15, 2023",
    likes: 42,
    liked: false,
    tags: ["Web Development", "React", "Tailwind CSS"],
    comments: [
      {
        id: "1",
        author: "Sam Wilson",
        avatar: "SW",
        content: "Great post! Really helpful for beginners.",
        timestamp: "2 hours ago",
      },
      {
        id: "2",
        author: "Taylor Smith",
        avatar: "TS",
        content: "I disagree with some points, but overall good content.",
        timestamp: "1 day ago",
      },
    ],
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // Check both isAuthenticated and token on component mount
    if (!isAuthenticated && !token) {
      navigate("/login");
    }
  }, [isAuthenticated, token, navigate]);

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
  } = useForm<PostFormData>({
    defaultValues: {
      title: blogPost.title,
      content: blogPost.content,
    },
  });

  const onSubmitComment = (data: CommentFormData) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: "You",
      avatar: "YO",
      content: data.content,
      timestamp: "Just now",
    };

    setBlogPost((prev) => ({
      ...prev,
      comments: [newComment, ...prev.comments],
    }));
    resetComment();
  };

  const onSubmitPost = (data: PostFormData) => {
    setBlogPost((prev) => ({
      ...prev,
      title: data.title,
      content: data.content,
    }));
    setShowEditModal(false);
  };

  const toggleLike = () => {
    setBlogPost((prev) => ({
      ...prev,
      likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
      liked: !prev.liked,
    }));
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const generateAvatar = (name: string) => {
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    return initials.length >= 2
      ? initials.substring(0, 2)
      : initials + initials;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-36 py-12 bg-white dark:bg-gray-900 min-h-screen">
      {/* Blog Post */}
      <article className="mb-12 relative">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {blogPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {blogPost.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {blogPost.content.split(".")[0]}.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full ${
                isBookmarked
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              }`}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill={isBookmarked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Edit post"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center mb-8">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {generateAvatar(blogPost.author)}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {blogPost.author}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {blogPost.date} · 5 min read
            </p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-8">
          <p className="whitespace-pre-line text-lg leading-relaxed">
            {blogPost.content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLike}
              className={`flex items-center space-x-2 ${
                blogPost.liked
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill={blogPost.liked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={blogPost.liked ? 1 : 2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{blogPost.likes} Likes</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span>{blogPost.comments.length} Comments</span>
            </button>
          </div>
          <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
            Share
          </button>
        </div>
      </article>

      {/* Comment Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Discussion ({blogPost.comments.length})
        </h2>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit(onSubmitComment)} className="mb-10">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                YO
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="comment" className="sr-only">
                Add your comment
              </label>
              <textarea
                id="comment"
                rows={4}
                {...registerComment("content", {
                  required: "Comment cannot be empty",
                })}
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg p-4"
                placeholder="Share your thoughts..."
              />
              {commentErrors.content && (
                <p className="mt-2 text-sm text-red-500">
                  {commentErrors.content.message}
                </p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Post comment
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-8">
          {blogPost.comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {comment.avatar}
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {comment.author}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comment.timestamp}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 text-base text-gray-700 dark:text-gray-300">
                    <p>{comment.content}</p>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <button className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      <span>Like</span>
                    </button>
                    <button className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Post
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePostSubmit(onSubmitPost)}>
                <div className="mb-6">
                  <label
                    htmlFor="post-title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Title
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    {...registerPost("title", {
                      required: "Title is required",
                    })}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg p-3"
                  />
                  {postErrors.title && (
                    <p className="mt-2 text-sm text-red-500">
                      {postErrors.title.message}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="post-content"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Content
                  </label>
                  <textarea
                    id="post-content"
                    rows={10}
                    {...registerPost("content", {
                      required: "Content is required",
                    })}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg p-3"
                  />
                  {postErrors.content && (
                    <p className="mt-2 text-sm text-red-500">
                      {postErrors.content.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
