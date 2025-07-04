import type { Route } from "./+types/home";
import Header from "~/Layout/header";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { useEffect } from "react";
import { initializeAuth } from "~/store/features/auth/authSlice";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const dispatch = useAppDispatch();

  const { isAuthenticated, loading, error, token } = useAppSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // Check both isAuthenticated and token on component mount
    if (isAuthenticated && token) {
      navigate("/blog");
    }
  }, [isAuthenticated, token, navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white leading-tight mb-6">
              Welcome to{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                BlogSphere
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Discover insightful articles, tutorials, and stories from our
              community of writers. Join us to explore new ideas and
              perspectives.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-medium">
                Browse Articles
              </button>
              <button className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition font-medium">
                Join Our Community
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80"
              alt="Blog Hero"
              className="rounded-xl shadow-xl dark:shadow-gray-900/50"
            />
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="bg-white dark:bg-gray-800 py-16 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Explore Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Technology",
              "Lifestyle",
              "Business",
              "Health",
              "Travel",
              "Food",
              "Art",
              "Science",
            ].map((category) => (
              <div
                key={category}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl hover:shadow-md dark:hover:shadow-gray-900/50 transition cursor-pointer text-center"
              >
                <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {category}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Highlights */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Recent Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "The Future of AI in Everyday Life",
                excerpt:
                  "How artificial intelligence is transforming our daily routines and what to expect in the coming years.",
                category: "Technology",
                date: "May 15, 2023",
              },
              {
                title: "Minimalism: Living With Less",
                excerpt:
                  "Practical tips for embracing minimalism and finding freedom in owning fewer possessions.",
                category: "Lifestyle",
                date: "June 2, 2023",
              },
              {
                title: "Sustainable Business Practices",
                excerpt:
                  "How companies are adapting to eco-friendly operations while maintaining profitability.",
                category: "Business",
                date: "June 10, 2023",
              },
            ].map((post, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl hover:shadow-md dark:hover:shadow-gray-900/50 transition"
              >
                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
                  {post.category}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>5 min read</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition font-medium">
              View All Articles
            </button>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-indigo-600 dark:bg-indigo-800 py-16 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Stay Updated</h2>
          <p className="text-indigo-100 dark:text-indigo-200 mb-8">
            Subscribe to our newsletter to receive the latest articles and
            updates directly in your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="text-indigo-200 dark:text-indigo-300 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
