import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import { User } from "@shared-types/User";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  Text,
  Badge,
  IconButton,
  SimpleGrid,
  HStack,
} from '@chakra-ui/react';

interface FacultyTableProps {
  filteredFaculty: User[];
  openEdit: (id: string) => void;
  deleteCustomer: (id: string) => void;
  isMobile?: boolean;
  isBulkDelete?: boolean;
  selectedFaculty?: string[];
  onFacultySelect?: (id: string) => void;
}

const MotionBox = motion(Box);

const FacultyTable: React.FC<FacultyTableProps> = ({
  filteredFaculty,
  openEdit,
  deleteCustomer,
  isMobile,
}) => {
  return (
    <AnimatePresence>
      {isMobile ? (
        <SimpleGrid columns={1} spacing={4}>
          {filteredFaculty.map((faculty) => (
            <MotionBox
              key={faculty.mid}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              bg="white"
              borderRadius="lg"
              p={4}
              boxShadow="sm"
              border="1px"
              borderColor="gray.100"
            >
              <Flex justify="space-between" align="start">
                <Box flex={1}>
                  <Flex align="center" mb={2}>
                    <Box>
                      <Text fontWeight="600" fontSize="sm">
                        {`${faculty.fname} ${faculty.lname}`}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {faculty.mid}
                      </Text>
                    </Box>
                  </Flex>
                  <Flex wrap="wrap" gap={2} mb={2}>
                    <Badge
                      colorScheme="purple"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {faculty.academicDetails.branch}
                    </Badge>
                  </Flex>
                  <Text fontSize="sm" color="gray.600" noOfLines={1}>
                    {faculty.social.email}
                  </Text>
                </Box>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Edit"
                    icon={<Edit2 size={16} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => openEdit(faculty.mid)}
                  />
                  <IconButton
                    aria-label="Delete"
                    icon={<Trash2 size={16} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => deleteCustomer(faculty._id)}
                  />
                </HStack>
              </Flex>
            </MotionBox>
          ))}
        </SimpleGrid>
      ) : (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor="gray.200"
          overflowX="auto"
        >
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th width="15%">MOODLE ID</Th>
                <Th width="20%">NAME</Th>
                <Th width="25%">EMAIL</Th>
                <Th width="20%">DEPARTMENT</Th>
                <Th width="20%">ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFaculty.map((faculty) => (
                <Tr key={faculty.mid}>
                  <Td>
                    <Badge colorScheme="blue">{faculty.mid}</Badge>
                  </Td>
                  <Td fontWeight="medium">{`${faculty.fname} ${faculty.lname}`}</Td>
                  <Td color="gray.600">{faculty.social.email}</Td>
                  <Td>
                    <Badge colorScheme="purple">
                      {faculty.academicDetails.branch}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit faculty"
                        icon={<Edit2 size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => openEdit(faculty.mid)}
                      />
                      <IconButton
                        aria-label="Delete faculty"
                        icon={<Trash2 size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => deleteCustomer(faculty._id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

export default FacultyTable;
