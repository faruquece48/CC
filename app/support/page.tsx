"use client";

import { useState } from "react";
import { title } from "@/components/primitives";
import { handleSupport } from "./actions";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const result = await handleSupport(formData);

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        const errMsg =
          (result as any).error || "Payment initialization failed";

        setError(errMsg);

        console.error("Payment failed:", errMsg);
      }
    } catch (err) {
      console.error("Submit error:", err);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">

      {/* TITLE */}
      <div className="text-center">
      <h1 className={`${title()} text-blue-900 inline-block`}>
        Support Us
      </h1>
    </div>

      {/* DESCRIPTION */}
      <p className="mt-4 text-center text-gray-600">
        Support Construct Carnival 2.0 and help us organize more innovative
        engineering events.
      </p>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-300 text-red-700 rounded-xl px-5 py-4 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={onSubmit}
        className="mt-10 bg-white shadow-lg rounded-2xl p-8 flex flex-col gap-5"
      >

        {/* NAME */}
        <div className="flex flex-col gap-1">
          <label className="text-lg font-medium text-gray-700">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Your Full Name"
            required
            className="border rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* EMAIL */}
        <div className="flex flex-col gap-1">
          <label className="text-lg font-medium text-gray-700">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            className="border rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* PHONE */}
        <div className="flex flex-col gap-1">
          <label className="text-lg font-medium text-gray-700">
            Phone Number
          </label>

          <input
            type="text"
            name="phone"
            placeholder="01XXXXXXXXX"
            required
            className="border rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* COMPANY NAME */}
        <div className="flex flex-col gap-1">
          <label className="text-lg font-medium text-gray-700">
            Organization Name
          </label>

          <input
            type="text"
            name="company_name"
            placeholder="Your Company / Organization"
            required
            className="border rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* AMOUNT */}
        <div className="flex flex-col gap-1">
          <label className="text-lg font-medium text-gray-700">
            Support Amount (BDT)
          </label>

          <input
            type="number"
            name="amount"
            placeholder="Enter Amount"
            defaultValue="5000"
            required
            min="10"
            className="border rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">

              <svg
                className="animate-spin h-5 w-5 text-white"
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
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>

              Processing...

            </span>
          ) : (
            "Proceed to Payment"
          )}
        </button>

      </form>
    </div>
  );
}