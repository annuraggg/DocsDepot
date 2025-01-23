import React from 'react';
import { Input, Select, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { House } from '@shared-types/House';

interface StudentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedHouse: string;
  setSelectedHouse: (house: string) => void;
  houses: House[];
  deleteArr: string[];
  onBulkDelete: () => void;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedYear,
  setSelectedYear,
  selectedHouse,
  setSelectedHouse,
  houses,
  deleteArr,
  onBulkDelete
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Select Year</label>
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="mt-1"
        >
          <option value="all">All</option>
          <option value="1">First Year</option>
          <option value="2">Second Year</option>
          <option value="3">Third Year</option>
          <option value="4">Fourth Year</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Select House</label>
        <Select
          value={selectedHouse}
          onChange={(e) => setSelectedHouse(e.target.value)}
          className="mt-1"
        >
          <option value="all">All</option>
          {houses?.map((house) => (
            <option value={house._id} key={house._id}>
              {house.name}
            </option>
          ))}
        </Select>
      </div>

      {deleteArr.length > 0 && (
        <div className="col-span-full mt-4">
          <Button 
            colorScheme="red" 
            onClick={onBulkDelete}
            className="w-full"
          >
            Bulk Delete ({deleteArr.length} selected)
          </Button>
        </div>
      )}
    </motion.div>
  );
};