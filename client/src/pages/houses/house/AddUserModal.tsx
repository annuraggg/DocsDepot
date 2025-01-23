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

export const MembersTable = ({ addUser }: { addUser: (id: string) => void }) => {
  const axios = useAxios();
  const toast = useToast();

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    axios
      .get("/user/not-alloted")
      .then((res) => {
        console.log(res.data);
        setAvailableUsers(res.data.data);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.response.data.message || "Error fetching users",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.log(err);
      });
  }, []);

  if (availableUsers.length === 0) {
    return <Box>No users available</Box>;
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
                {user?.fname} {user?.lname}
              </Td>
              <Td>{user?.mid}</Td>
              <Td>
                <HStack>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => addUser(user?._id)}
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
