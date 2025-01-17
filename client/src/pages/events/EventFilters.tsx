import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  selectedFilters: string[];
}

export const EventFilters = ({ onSearch, onFilterChange, selectedFilters }: EventFiltersProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mb-8 space-y-4"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search events..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex flex-wrap gap-3">
        {['active', 'upcoming', 'expired'].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              const newFilters = selectedFilters.includes(filter)
                ? selectedFilters.filter(f => f !== filter)
                : [...selectedFilters, filter];
              onFilterChange(newFilters);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedFilters.includes(filter)
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>
    </motion.div>
  );
};