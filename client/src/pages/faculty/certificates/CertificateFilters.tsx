import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Checkbox,
  CheckboxGroup,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

interface FilterState {
  types: string[];
  levels: string[];
  status: string[];
  issueYears: string[];
  expiryYears: string[];
}

interface CertificateFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export const CertificateFilters: React.FC<CertificateFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const handleFilterChange = (filterType: keyof FilterState, values: string[]) => {
    setFilters({ ...filters, [filterType]: values });
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <Text fontWeight="medium" mb={2}>Certificate Level</Text>
        <CheckboxGroup
          value={filters.levels}
          onChange={(values) => handleFilterChange('levels', values as string[])}
        >
          <VStack align="start" spacing={2}>
            <Checkbox value="beginner">Beginner</Checkbox>
            <Checkbox value="intermediate">Intermediate</Checkbox>
            <Checkbox value="advanced">Advanced</Checkbox>
          </VStack>
        </CheckboxGroup>
      </FormControl>

      <FormControl>
        <Text fontWeight="medium" mb={2}>Status</Text>
        <CheckboxGroup
          value={filters.status}
          onChange={(values) => handleFilterChange('status', values as string[])}
        >
          <VStack align="start" spacing={2}>
            <Checkbox value="pending">Pending</Checkbox>
            <Checkbox value="approved">Approved</Checkbox>
            <Checkbox value="rejected">Rejected</Checkbox>
          </VStack>
        </CheckboxGroup>
      </FormControl>

      <HStack spacing={4}>
        <FormControl>
          <FormLabel>Issue Year</FormLabel>
          <Select
            value={filters.issueYears[0] || ''}
            onChange={(e) => handleFilterChange('issueYears', [e.target.value])}
          >
            <option value="">All Years</option>
            {[...Array(4)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              );
            })}
          </Select>
        </FormControl>
      </HStack>
    </VStack>
  );
};