import { Grid, List, Filter, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Props = {
  viewMode: string;
  setViewMode: (mode: string) => void;
  selectedSort: string;
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const filterOptions = {
  Newest: "newest",
  Name: "name",
  "Price: Low to High": "priceLowToHigh",
  "Price: High to Low": "priceHighToLow",
};

export default function ProductListPanel({
  viewMode,
  setViewMode,
  selectedSort,
  onSortChange,
}: Props) {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getSelectedLabel = () => {
    const entry = Object.entries(filterOptions).find(
      ([, value]) => value === selectedSort
    );
    return entry ? entry[0] : "Newest";
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowMobileFilter(false);
      }
    }

    if (showMobileFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileFilter]);

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
        <div className="hidden md:flex items-center space-x-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(filterOptions).map(([label, value]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:hidden relative" ref={dropdownRef}>
          <button
            className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center space-x-2"
            onClick={() => setShowMobileFilter(!showMobileFilter)}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">{getSelectedLabel()}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showMobileFilter ? "rotate-180" : ""
              }`}
            />
          </button>

          {showMobileFilter && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                {Object.entries(filterOptions).map(([label, value]) => (
                  <button
                    key={value}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                      selectedSort === value
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      const syntheticEvent = {
                        target: { value },
                      } as React.ChangeEvent<HTMLSelectElement>;

                      onSortChange(syntheticEvent);
                      setShowMobileFilter(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
