import { useTheme } from "components/ui/ThemeContext";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-12 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
          theme === "light" ? "translate-x-1" : "translate-x-6"
        }`}
      >
        {theme === "light" ? (
          <SunIcon className="h-4 w-4 text-yellow-500 mx-auto mt-0.5" />
        ) : (
          <MoonIcon className="h-4 w-4 text-indigo-300 mx-auto mt-0.5" />
        )}
      </span>
    </button>
  );
}
