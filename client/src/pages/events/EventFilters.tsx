import { Search, Calendar, Tag, MapPin, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { Mode } from '@shared-types/Event';

interface EventFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  onModeFilterChange: (mode: Mode | '') => void;
  onPointsFilterChange: (range: [number, number]) => void;
  selectedFilters: string[];
  selectedMode: Mode | '';
  pointsRange: [number, number];
}

export const EventFilters = ({ 
  onSearch, 
  onFilterChange, 
  onModeFilterChange,
  onPointsFilterChange,
  selectedFilters,
  selectedMode,
  pointsRange
}: EventFiltersProps) => {
  const filterCategories = [
    { icon: Calendar, label: 'Status', options: ['active', 'upcoming', 'expired'] },
    { icon: MapPin, label: 'Mode', options: ['online', 'offline'] },
    { icon: Tag, label: 'Registration', options: ['internal', 'external'] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-6 bg-white rounded-xl shadow-sm p-6 mb-5"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search events..."
          onChange={(e) => onSearch(e.target.value)}
          className="block w-full pl-10 pr-4 py-3 border-none bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filterCategories.map(({ icon: Icon, label, options }) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-700">
              <Icon className="h-4 w-4" />
              <span className="font-medium">{label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    if (label === 'Mode') {
                      onModeFilterChange(option as Mode);
                    } else {
                      const newFilters = selectedFilters.includes(option)
                        ? selectedFilters.filter(f => f !== option)
                        : [...selectedFilters, option];
                      onFilterChange(newFilters);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${(label === 'Mode' ? selectedMode === option : selectedFilters.includes(option))
                      ? 'bg-blue-100 text-blue-800 shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-gray-700">
          <Radio className="h-4 w-4" />
          <span className="font-medium">Points Range</span>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            min="0"
            value={pointsRange[0]}
            onChange={(e) => onPointsFilterChange([parseInt(e.target.value), pointsRange[1]])}
            className="w-24 px-3 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 border-none"
            placeholder="Min"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            min="0"
            value={pointsRange[1]}
            onChange={(e) => onPointsFilterChange([pointsRange[0], parseInt(e.target.value)])}
            className="w-24 px-3 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 border-none"
            placeholder="Max"
          />
        </div>
      </div>
    </motion.div>
  );
};