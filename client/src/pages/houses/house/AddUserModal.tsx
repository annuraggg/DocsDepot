import { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Box,
  useToast,
  Td,
  HStack,
  Button,
} from "@chakra-ui/react";
import { User } from "@shared-types/User";
import useAxios from "@/config/axios";
import Loader from "@/components/Loader";

export const MembersTable = ({ addUser }: { addUser: (id: string) => void }) => {
  const axios = useAxios();
  const toast = useToast();

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setIsLoading(true);
    axios
      .get("/user/not-alloted")
      .then((res) => {
        setAvailableUsers(res.data.data);
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Error fetching users",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleAddUser = async (userId: string) => {
    setAddingUserId(userId);
    try {
      await addUser(userId);
      setAvailableUsers(prevUsers => 
        prevUsers.filter(user => user._id !== userId)
      );
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setAddingUserId(null);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (availableUsers.length === 0) {
    return (
      <Box p={4} textAlign="center" color="gray.600">
        No users available
      </Box>
    );
  }

  return (
    <Box overflowX="auto" mt={4}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>NAME</Th>
            <Th>MOODLE ID</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {availableUsers.map((user, index) => (
            <Tr key={user._id}>
              <Td>{index + 1}</Td>
              <Td>
                {user.fname} {user.lname}
              </Td>
              <Td>{user.mid}</Td>
              <Td>
                <HStack>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleAddUser(user._id)}
                    isLoading={addingUserId === user._id}
                    loadingText="Adding"
                  >
                    Add
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

export default MembersTable;