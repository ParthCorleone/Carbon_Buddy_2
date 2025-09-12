"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiGlobe } from "react-icons/fi";

// --- Icon Components ---
const LogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 text-green-600"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
  </svg>
);

const TrackDailyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 mx-auto"
  >
    <path d="M12 20V10M18 20V4M6 20v-4" />
  </svg>
);

const ReduceImpactIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 mx-auto"
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM16 12l-4-4-4 4M12 16V8" />
  </svg>
);

const SavePlanetIcon = () => <FiGlobe className="w-6 h-6 mx-auto" />;

function isValidPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (isSignUp) {
      const password = data.password as string;
      if (!isValidPassword(password)) {
        setError(
          "Password must be at least 8 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special character."
        );
        setIsLoading(false);
        return;
      }
      if (data.password !== data.confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
    }

    const endpoint = isSignUp ? "/api/register" : "/api/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "An error occurred.");
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left Side */}
      <div
        className="hidden lg:flex flex-col justify-between relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1594751543129-670a64e25967?q=80&w=3387&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-green-900 bg-opacity-60"></div>
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          <div>
            <div className="flex items-center gap-3">
              <LogoIcon />
              <span className="text-2xl font-bold">CarbonBuddy</span>
            </div>
            <h1 className="mt-8 text-3xl lg:text-4xl font-bold leading-tight">
              Track, reduce, and offset your carbon footprint.
            </h1>
            <p className="mt-4 text-lg text-green-200">
              Join a difference for our planet.
            </p>
          </div>
          <p className="text-sm text-green-300">© 2025 CarbonBuddy Inc.</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex justify-center items-center px-4 sm:px-6 lg:px-8 py-8 min-h-[100vh]">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center gap-2">
              <LogoIcon />
              <h1 className="text-2xl font-bold text-gray-800">CarbonBuddy</h1>
            </div>
            <p className="mt-2 text-gray-600">
              Start your sustainable journey today
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center p-1 bg-gray-100 rounded-full">
            <button
              onClick={() => setIsSignUp(false)}
              className={`w-1/2 py-2.5 text-sm font-semibold rounded-full transition-colors ${!isSignUp
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-500 hover:bg-gray-200"
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`w-1/2 py-2.5 text-sm font-semibold rounded-full transition-colors ${isSignUp
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-500 hover:bg-gray-200"
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {isSignUp ? "Join the movement" : "Welcome back"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isSignUp
                  ? "Start reducing your carbon footprint today"
                  : "Continue tracking your environmental impact"}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 block mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 text-black"
                  />
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 text-black"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-black block mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 text-black"
                />
              </div>
              {isSignUp && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-black block mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 text-black"
                  />
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                >
                  {isLoading
                    ? "Processing..."
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                </button>
              </div>
            </form>
            {isSignUp && (
              <p className="mt-6 text-xs text-center text-gray-500">
                By signing up, you agree to help make our planet more
                sustainable.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8">
            <div className="flex justify-center items-center space-x-8 text-gray-500">
              <div className="text-center">
                <TrackDailyIcon />
                <p className="text-xs mt-1">Track Daily</p>
              </div>
              <div className="text-center">
                <ReduceImpactIcon />
                <p className="text-xs mt-1">Reduce Impact</p>
              </div>
              <div className="text-center">
                <SavePlanetIcon />
                <p className="text-xs mt-1">Save Planet</p>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-6">
              🌱 Over 50,000 tons of CO2 reduced by our community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
