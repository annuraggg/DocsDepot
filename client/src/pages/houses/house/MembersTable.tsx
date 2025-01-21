import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Avatar,
  HStack,
  VStack,
  Text,
  Box
} from '@chakra-ui/react';
import { Edit, Trash2 } from 'lucide-react';
import { User } from '@shared-types/User';

interface MembersTableProps {
  members: User[];
  onMemberClick: (id: string) => void;
  onDeleteClick: (member: User) => void;
  onEditClick: (member: User) => void;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  onMemberClick,
  onDeleteClick,
  onEditClick,
}) => {
  return (
    <Box overflowX="auto" mt={4}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>NAME</Th>
            <Th>MOODLE ID</Th>
            <Th>POINTS</Th>
            <Th>ACTIONS</Th>
          </Tr>
        </Thead>
        <Tbody>
          {members.map((member, index) => (
            <Tr
              key={member.mid}
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              onClick={() => onMemberClick(member.mid)}
            >
              <Td>{index + 1}</Td>
              <Td>
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    name={`${member.fname} ${member.lname}`}
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.fname} ${member.lname}`}
                  />
                  <VStack spacing={0} align="start">
                    <Text fontWeight="medium">
                      {`${member.fname} ${member.lname}`}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {member.mid}
                    </Text>
                  </VStack>
                </HStack>
              </Td>
              <Td>{member.mid}</Td>
              {/* <Td>{member.totalPoints}</Td> */}
              <Td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                    leftIcon={<Edit size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(member);
                    }}
                  >
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    leftIcon={<Trash2 size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(member);
                    }}
                  >
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};