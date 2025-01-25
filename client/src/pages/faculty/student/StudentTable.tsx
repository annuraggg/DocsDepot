import React from 'react';
import { 
  Box, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Checkbox, 
  Text, 
  HStack, 
  Button 
} from '@chakra-ui/react';
import { User } from '@shared-types/User';
import { Edit, Trash2, UserCircle } from 'lucide-react';

interface StudentTableProps {
  students: User[];
  selectAll: boolean;
  deleteArr: string[];
  onToggleSelectAll: () => void;
  onCheckboxChange: (mid: string) => void;
  onEdit: (mid: string) => void;
  onDelete: (mid: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectAll,
  deleteArr,
  onToggleSelectAll,
  onCheckboxChange,
  onEdit,
  onDelete
}) => {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor="gray.200"
      overflow="hidden"
    >
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr bg="gray.50" borderBottom="1px" borderColor="gray.200">
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
                width="50px"
              >
                <Checkbox
                  isChecked={selectAll}
                  onChange={onToggleSelectAll}
                />
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Moodle ID
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Name
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Admission Year
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Academic Year
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Email
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                House
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {students.map((student, index) => (
              <Tr
                key={student.mid}
                _hover={{ bg: "gray.50" }}
                transition="background 0.15s"
                borderBottom="1px"
                borderColor="gray.200"
              >
                <Td py={4} px={6} fontSize="sm" color="gray.900">
                  <Checkbox
                    isChecked={selectAll || deleteArr.includes(student.mid)}
                    onChange={() => onCheckboxChange(student.mid)}
                  />
                </Td>
                <Td py={4} px={6} fontSize="sm" color="gray.900">
                  {student.mid}
                </Td>
                <Td py={4} px={6}>
                  <HStack spacing={2}>
                    <UserCircle color="gray.500" size={20} />
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">
                      {student.fname} {student.lname}
                    </Text>
                  </HStack>
                </Td>
                <Td py={4} px={6} fontSize="sm" color="gray.600">
                  {student.academicDetails.admissionYear}
                </Td>
                <Td py={4} px={6} fontSize="sm" color="gray.600">
                  {student.academicDetails.academicYear}
                </Td>
                <Td py={4} px={6} fontSize="sm" color="gray.600">
                  {student.social.email}
                </Td>
                <Td py={4} px={6} fontSize="sm" color="gray.600">
                  {student.house}
                </Td>
                <Td py={4} px={6}>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      leftIcon={<Edit size={16} />}
                      onClick={() => onEdit(student.mid)}
                      _hover={{
                        bg: "blue.50",
                        transform: "translateX(4px)", 
                      }}
                      transition="all 0.2s"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      leftIcon={<Trash2 size={16} />}
                      onClick={() => onDelete(student.mid)}
                      _hover={{
                        bg: "red.50",
                        transform: "translateX(4px)", 
                      }}
                      transition="all 0.2s"
                    >
                      Delete
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default StudentTable;