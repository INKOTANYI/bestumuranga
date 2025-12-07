import React, { useState } from "react";

export default function CreateListing() {
  const [type, setType] = useState("sale"); // sale or rent

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl p-6 md:p-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-300 mb-2">
              New Listing
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Create Property Listing
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              House for sale or rent in Kigali and beyond. Provide clear details so buyers and renters can quickly decide.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-200 px-3 py-1 border border-emerald-400/40">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live preview only – API connection coming next
            </span>
            <span className="text-slate-400">
              Frontend UI · React + Tailwind CSS
            </span>
          </div>
        </div>

        {/* TYPE SELECTOR BUTTONS */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            type="button"
            onClick={() => setType("sale")}
            className={`px-6 py-3 rounded-2xl text-sm font-semibold border transition shadow-sm flex items-center gap-2
            ${
              type === "sale"
                ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/40"
                : "bg-slate-900/60 text-slate-200 border-slate-600 hover:border-emerald-400/60 hover:text-white"
            }`}
          >
            <span className="text-lg">🏡</span>
            <span>House for Sale</span>
          </button>
          <button
            type="button"
            onClick={() => setType("rent")}
            className={`px-6 py-3 rounded-2xl text-sm font-semibold border transition shadow-sm flex items-center gap-2
            ${
              type === "rent"
                ? "bg-sky-500 text-white border-sky-500 shadow-sky-500/40"
                : "bg-slate-900/60 text-slate-200 border-slate-600 hover:border-sky-400/60 hover:text-white"
            }`}
          >
            <span className="text-lg">🕒</span>
            <span>House for Rent</span>
          </button>
        </div>

        {/* FORM */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-xs font-semibold tracking-wide text-slate-200 mb-1 uppercase">
              Title
            </label>
            <input
              type="text"
              placeholder="Beautiful modern house with garden"
              className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide text-slate-200 mb-1 uppercase">
              City / Location
            </label>
            <input
              type="text"
              placeholder="Kigali, Gasabo"
              className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide text-slate-200 mb-1 uppercase">
              Price ({type === "rent" ? "per month" : "total"})
            </label>
            <input
              type="number"
              placeholder="350000"
              className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide text-slate-200 mb-1 uppercase">
              Area (Sqm)
            </label>
            <input
              type="number"
              placeholder="250"
              className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide text-slate-200 mb-1 uppercase">
              Bedrooms
            </label>
            <input
              type="number"
              placeholder="3"
              className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide text-slate-200 mb-1 uppercase">
              Bathrooms
            </label>
            <input
              type="number"
              placeholder="2"
              className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent shadow-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold tracking-wide text-slate-200 mb-1 uppercase">
              Description
            </label>
            <textarea
              placeholder="Describe the property, neighborhood, amenities, parking, etc."
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent shadow-sm resize-y"
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold tracking-wide text-slate-200 mb-1 uppercase">
              Upload Images
            </label>
            <div className="mt-1 flex flex-col gap-2 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 px-4 py-5 text-slate-300">
              <input
                type="file"
                multiple
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/90 file:text-white hover:file:bg-emerald-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                You can upload multiple images. JPG, PNG up to 5MB each.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-4">
            <p className="text-[11px] text-slate-500">
              This is a frontend-only demo. The next step is to connect this form to your Laravel API.
            </p>
            <button
              type="submit"
              className="px-8 md:px-10 py-3 bg-emerald-500 text-white text-sm md:text-base font-semibold rounded-2xl shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition flex items-center gap-2"
            >
              <span>Submit Listing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
