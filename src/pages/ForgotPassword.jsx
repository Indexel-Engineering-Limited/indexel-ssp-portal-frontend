import { useState } from "react";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/api/auth/forgot-password",
        {
          email_id: email.trim(),
        }
      );

      setMessage(
        response.data?.message ||
          "If an account exists, a reset link has been sent."
      );

    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to process your request."
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
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter your registered email and we'll
            send you a password reset link.
          </p>

        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#2d55a0] focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-11 w-full rounded-xl bg-[#2d55a0] text-sm font-semibold text-white transition hover:bg-[#244785] disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

      </div>

    </div>
  );
}