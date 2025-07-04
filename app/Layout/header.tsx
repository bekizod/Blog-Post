import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { Link } from "react-router";

import { fetchUserProfile, clearProfile } from "~/store/features/profileSlice";
import { initializeAuth, logout } from "~/store/features/auth/authSlice";
import { ThemeToggleButton } from "~/welcome/welcome";

const Header = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading: authLoading } = useAppSelector(
    (state) => state.auth
  );
  const { user, loading: profileLoading } = useAppSelector(
    (state) => state.profile
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize auth and fetch profile if authenticated
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && !user && !profileLoading) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, user, profileLoading, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearProfile());
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDropdownItemClick = () => {
    setIsDropdownOpen(false);
  };

  const getAvatarInitials = () => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    if (user.userName) {
      return user.userName.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  const loading = authLoading || profileLoading;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/blog"
              className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              BlogSphere
            </Link>
          </div>

          {/* Navigation */}

          {/* Profile dropdown */}
          <div className="ml-4 flex gap-6 items-center md:ml-6 relative">
            <nav className="flex items-center space-x-8">
              <ThemeToggleButton />
            </nav>
            {isAuthenticated ? (
              <>
                <button
                  ref={buttonRef}
                  type="button"
                  className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  id="user-menu"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={loading}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {loading ? "..." : getAvatarInitials()}
                  </div>
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="origin-bottom-right absolute top-7 right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    {user && (
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.userName || user.email}
                        </p>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">
                          {user.email}
                        </p>
                      </div>
                    )}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                      onClick={handleDropdownItemClick}
                    >
                      Your Posts
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
