import { Grid, List } from "lucide-react";
import { useState } from "react";

type Props = {
  viewMode: string;
  setViewMode: (mode: string) => void;
  selectedSort: string;
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export default function ProductListPanel({
  viewMode,
  setViewMode,
  selectedSort,
  onSortChange,
}: Props) {
  return (
    <div className="flex justify-between items-start mb-6 space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
