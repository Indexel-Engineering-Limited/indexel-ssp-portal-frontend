import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "api/auth/reset-password",
        {
          token,
          newPassword: password,
          confirmPassword,
        }
      );

      setSuccess(
        response.data?.message ||
          "Password reset successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <div className="mb-7 text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <span className="material-symbols-outlined text-[#2d55a0]">
              lock_reset
            </span>
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create a new password for your account.
          </p>

        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            New Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm outline-none focus:border-[#2d55a0] focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword
                  ? "visibility_off"
                  : "visibility"}
              </span>
            </button>
          </div>

          <label className="mb-2 mt-5 block text-sm font-medium text-slate-700">
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Re-enter your password"
            autoComplete="new-password"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#2d55a0] focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 w-full rounded-xl bg-[#2d55a0] text-sm font-semibold text-white hover:bg-[#244785] disabled:opacity-60"
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

      </div>

    </div>
  );
}