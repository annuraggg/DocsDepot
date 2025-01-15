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
import { Trash2 } from 'lucide-react';
import { Member } from '../../../types/house';

interface MembersTableProps {
  members: Member[];
  editPrivilege: boolean;
  onMemberClick: (id: string) => void;
  onDeleteClick: (member: Member) => void;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  editPrivilege,
  onMemberClick,
  onDeleteClick,
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
            {editPrivilege && <Th>ACTIONS</Th>}
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
              <Td>{member.totalPoints}</Td>
              {editPrivilege && (
                <Td>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    leftIcon={<Trash2 size={16} />}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDeleteClick(member);
                    }}
                  >
                    Remove
                  </Button>
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};