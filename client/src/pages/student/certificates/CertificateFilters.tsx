import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Checkbox,
    CheckboxGroup,
    Select,
    Input,
    FormControl,
    FormLabel,
    useColorModeValue,
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
    onSearch: (searchTerm: string) => void;
}

export const CertificateFilters: React.FC<CertificateFiltersProps> = ({
    filters,
    setFilters,
    onSearch,
}) => {
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const handleFilterChange = (filterType: keyof FilterState, values: string[]) => {
        setFilters({ ...filters, [filterType]: values });
    };

    return (
        <Box
            bg={bgColor}
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="md"
        >
            <VStack spacing={4} align="stretch">
                <FormControl>
                    <FormLabel>Search</FormLabel>
                    <Input
                        placeholder="Search certificates..."
                        onChange={(e) => onSearch(e.target.value)}
                        size="md"
                    />
                </FormControl>

                <Box>
                    <Text fontWeight="medium" mb={2}>Certificate Type</Text>
                    <CheckboxGroup
                        value={filters.types}
                        onChange={(values) => handleFilterChange('types', values as string[])}
                    >
                        <HStack spacing={4}>
                            <Checkbox value="internal">Internal</Checkbox>
                            <Checkbox value="external">External</Checkbox>
                            <Checkbox value="events">Events</Checkbox>
                        </HStack>
                    </CheckboxGroup>
                </Box>

                <Box>
                    <Text fontWeight="medium" mb={2}>Certificate Level</Text>
                    <CheckboxGroup
                        value={filters.levels}
                        onChange={(values) => handleFilterChange('levels', values as string[])}
                    >
                        <HStack spacing={4}>
                            <Checkbox value="beginner">Beginner</Checkbox>
                            <Checkbox value="intermediate">Intermediate</Checkbox>
                            <Checkbox value="advanced">Advanced</Checkbox>
                        </HStack>
                    </CheckboxGroup>
                </Box>

                <Box>
                    <Text fontWeight="medium" mb={2}>Status</Text>
                    <CheckboxGroup
                        value={filters.status}
                        onChange={(values) => handleFilterChange('status', values as string[])}
                    >
                        <HStack spacing={4}>
                            <Checkbox value="pending">Pending</Checkbox>
                            <Checkbox value="approved">Approved</Checkbox>
                            <Checkbox value="rejected">Rejected</Checkbox>
                        </HStack>
                    </CheckboxGroup>
                </Box>

                <HStack spacing={4}>
                    <FormControl>
                        <FormLabel>Issue Year</FormLabel>
                        <Select
                            value={filters.issueYears[0] || ''}
                            onChange={(e) => handleFilterChange('issueYears', [e.target.value])}
                        >
                            <option value="">All Years</option>
                            {[...Array(4)].map((_, i) => {
                                const year = new Date().getFullYear() - (3 - i);
                                return (
                                    <option key={year} value={year.toString()}>
                                        {year}
                                    </option>
                                );
                            })}
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Expiry Year</FormLabel>
                        <Select
                            value={filters.expiryYears[0] || ''}
                            onChange={(e) => handleFilterChange('expiryYears', [e.target.value])}
                        >
                            <option value="">All Years</option>
                            {[...Array(4)].map((_, i) => {
                                const year = new Date().getFullYear() + i;
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
        </Box>
    );
};