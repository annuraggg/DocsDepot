import {
  Search,
  Calendar,
  Tag,
  MapPin,
  Radio,
  Users,
  Filter,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Mode } from "@shared-types/Event";
import { useState } from "react";

interface EventFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  onModeFilterChange: (mode: Mode | "") => void;
  onPointsFilterChange: (range: [number, number]) => void;
  selectedFilters: string[];
  selectedMode: Mode | "";
  pointsRange: [number, number];
}

export const EventFilters = ({
  onSearch,
  onFilterChange,
  onModeFilterChange,
  onPointsFilterChange,
  selectedFilters,
  selectedMode,
  pointsRange,
}: EventFiltersProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filterCategories = [
    {
      icon: Calendar,
      label: "Status",
      options: ["active", "upcoming", "expired"],
      description: "Filter events by their current status",
    },
    {
      icon: MapPin,
      label: "Mode",
      options: ["online", "offline"],
      description: "Filter by event format",
    },
    {
      icon: Tag,
      label: "Registration",
      options: ["internal", "external"],
      description: "Filter by registration type",
    },
    {
      icon: Users,
      label: "Participation",
      options: ["open", "full", "closing-soon"],
      description: "Filter by registration availability",
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Filter className="w-dd h-6" />
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden lg:flex gap-6"
      >
        <div className="w-80 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 h-fit sticky top-6">
          <div className="space-y-6">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-400 mb-4">
                <Filter className="w-5 h-5" />
                Filters
              </h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  onChange={(e) => onSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-400 placeholder-gray-500 dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="space-y-6">
              {filterCategories.map(
                ({ icon: Icon, label, options, description }) => (
                  <div
                    key={label}
                    className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-500 last:border-0"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-400">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">{label}</span>
                        </div>
                        {selectedFilters.some((f) => options.includes(f)) && (
                          <button
                            onClick={() =>
                              onFilterChange(
                                selectedFilters.filter(
                                  (f) => !options.includes(f)
                                )
                              )
                            }
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Clear
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {options.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            if (label === "Mode") {
                              onModeFilterChange(option as Mode);
                            } else {
                              const newFilters = selectedFilters.includes(
                                option
                              )
                                ? selectedFilters.filter((f) => f !== option)
                                : [...selectedFilters, option];
                              onFilterChange(newFilters);
                            }
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${
                            (
                              label === "Mode"
                                ? selectedMode === option
                                : selectedFilters.includes(option)
                            )
                              ? "bg-blue-50 dark:bg-blue-950 dark:text-blue-200 text-blue-700"
                              : "dark:bg-gray-900 dark:text-gray-400 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>
                            {option
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </span>
                          {(label === "Mode"
                            ? selectedMode === option
                            : selectedFilters.includes(option)) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-blue-600"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-400">
                    <Radio className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Points Range</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      value={pointsRange[0]}
                      onChange={(e) =>
                        onPointsFilterChange([
                          parseInt(e.target.value),
                          pointsRange[1],
                        ])
                      }
                      className="w-full px-3 py-2 dark:bg-gray-900   dark:text-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-gray-700 "
                      placeholder="Min"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      min="0"
                      value={pointsRange[1]}
                      onChange={(e) =>
                        onPointsFilterChange([
                          pointsRange[0],
                          parseInt(e.target.value),
                        ])
                      }
                      className="w-full px-3 py-2 dark:bg-gray-900 dark:text-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-gray-700"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isDrawerOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg z-40 lg:hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-400">
              Filters
            </h3>
            <button onClick={() => setIsDrawerOpen(false)}>
              <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  onChange={(e) => onSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-400 placeholder-gray-500 dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="space-y-6">
              {filterCategories.map(
                ({ icon: Icon, label, options, description }) => (
                  <div
                    key={label}
                    className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-500 last:border-0"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-400">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">{label}</span>
                        </div>
                        {selectedFilters.some((f) => options.includes(f)) && (
                          <button
                            onClick={() =>
                              onFilterChange(
                                selectedFilters.filter(
                                  (f) => !options.includes(f)
                                )
                              )
                            }
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Clear
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {options.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            if (label === "Mode") {
                              onModeFilterChange(option as Mode);
                            } else {
                              const newFilters = selectedFilters.includes(
                                option
                              )
                                ? selectedFilters.filter((f) => f !== option)
                                : [...selectedFilters, option];
                              onFilterChange(newFilters);
                            }
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${
                            (
                              label === "Mode"
                                ? selectedMode === option
                                : selectedFilters.includes(option)
                            )
                              ? "bg-blue-50 text-blue-700"
                              : "dark:bg-gray-900 dark:text-gray-400 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>
                            {option
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </span>
                          {(label === "Mode"
                            ? selectedMode === option
                            : selectedFilters.includes(option)) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-blue-600"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-400">
                    <Radio className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Points Range</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      value={pointsRange[0]}
                      onChange={(e) =>
                        onPointsFilterChange([
                          parseInt(e.target.value),
                          pointsRange[1],
                        ])
                      }
                      className="w-full px-3 py-2 dark:bg-gray-900 dark:text-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-gray-700"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      min="0"
                      value={pointsRange[1]}
                      onChange={(e) =>
                        onPointsFilterChange([
                          pointsRange[0],
                          parseInt(e.target.value),
                        ])
                      }
                      className="w-full px-3 py-2 dark:bg-gray-900 dark:text-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-gray-700"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
