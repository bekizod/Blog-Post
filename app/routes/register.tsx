import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "~/store/hooks";

import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { ThemeToggleButton } from "~/welcome/welcome";
import { toast } from "react-toastify";
import {
  clearRegisterErrors,
  registerUser,
} from "~/store/features/auth/registerSlice";
import { initializeAuth } from "~/store/features/auth/authSlice";

type RegisterFormData = {
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
};

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, validationErrors } = useAppSelector(
    (state) => state.register
  );

  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors: clearFormErrors,
  } = useForm<RegisterFormData>();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // Check both isAuthenticated and token on component mount
    if (isAuthenticated && token) {
      navigate("/blog");
    }
  }, [isAuthenticated, token, navigate]);
  useEffect(() => {
    dispatch(clearRegisterErrors());
  }, [dispatch]);

  useEffect(() => {
    if (validationErrors) {
      clearFormErrors();
      Object.entries(validationErrors).forEach(([field, message]) => {
        if (
          ["email", "firstName", "lastName", "userName", "password"].includes(
            field
          )
        ) {
          setFormError(field as keyof RegisterFormData, {
            type: "manual",
            message: message,
          });
        }
      });
    }
  }, [validationErrors, setFormError, clearFormErrors]);

  const onSubmit = (data: RegisterFormData) => {
    dispatch(registerUser(data))
      .unwrap()
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        // Error handling is done in the slice
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-lg bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Create new account
          </h2>
        </div>

        {error && !validationErrors && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters",
                  },
                })}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.firstName
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Bereket"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Last name must be at least 2 characters",
                  },
                })}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.lastName
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Bwbz"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <input
              id="userName"
              type="text"
              {...register("userName", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.userName
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="Beki"
            />
            {errors.userName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.userName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="bekizodcancer3@gmail.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.password
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="112233"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing up...
                </>
              ) : (
                "Sign up"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
