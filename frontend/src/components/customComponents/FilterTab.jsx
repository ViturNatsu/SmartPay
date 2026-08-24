import React, { useState } from 'react';

export function FilterPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState({
    active: false,
    paused: false,
    cancelled: false,
  });
  const [periodFilters, setPeriodFilters] = useState({
    monthly: false,
    yearly: false,
  });

  const clearFilters = () => {
    setStatusFilters({ active: false, paused: false, cancelled: false });
    setPeriodFilters({ monthly: false, yearly: false });
  };

  return (
    <div className="relative inline-block text-left">
      {/* 1. Filter Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#0e7490] hover:bg-[#0c627a] text-white font-medium px-4 py-1.5 rounded-full text-sm transition-colors shadow-sm"
      >
        <FunnelIcon className="w-4 h-4" />
        <span>Filter</span>
      </button>

      {/* 2. Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4 text-sm text-gray-700">
          
          {/* Status Section */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-400 mb-2.5">Status</h4>
            <div className="space-y-2">
              {['Active', 'Paused', 'Cancelled'].map((status) => {
                const key = status.toLowerCase();
                return (
                  <label key={status} className="flex items-center gap-2.5 cursor-pointer text-gray-700 hover:text-black">
                    <input
                      type="checkbox"
                      checked={statusFilters[key]}
                      onChange={(e) => setStatusFilters({ ...statusFilters, [key]: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#0e7490] focus:ring-[#0e7490]"
                    />
                    <span>{status}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100 my-3" />

          {/* Recurring Period Section */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-400 mb-2.5">Recurring period</h4>
            <div className="space-y-2">
              {['Monthly', 'Yearly'].map((period) => {
                const key = period.toLowerCase();
                return (
                  <label key={period} className="flex items-center gap-2.5 cursor-pointer text-gray-700 hover:text-black">
                    <input
                      type="checkbox"
                      checked={periodFilters[key]}
                      onChange={(e) => setPeriodFilters({ ...periodFilters, [key]: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#0e7490] focus:ring-[#0e7490]"
                    />
                    <span>{period}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="w-full mt-2 py-2 px-4 border border-gray-200 rounded-lg font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

// Simple Inline Funnel SVG Icon
function FunnelIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}