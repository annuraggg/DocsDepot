import React from 'react';
import { Input, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { House } from '@shared-types/House';
import { Filter, Trash2 } from 'lucide-react';

interface StudentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onFilterOpen: () => void;
  selectedCount: number;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  onFilterOpen,
  selectedCount
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Search</label>
        <Input
          placeholder="Search By Any Term"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-1"
        />
      </div>

      Copy
      <div className="md:col-span-2 flex items-end gap-4">
        <Button
          leftIcon={<Trash2 size={18} />}
          variant="outline"
          colorScheme="red"
          className="mt-1"
          isDisabled={selectedCount === 0}
        >
          Selected ({selectedCount})
        </Button>
        <Button
          leftIcon={<Filter size={18} />}
          variant="outline"
          onClick={onFilterOpen}
          className="mt-1"
        >
          Filters
        </Button>
      </div>
    </motion.div>
  );
};