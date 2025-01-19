import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Alert,
  AlertIcon,
  Thead,
  Tr,
  useToast,
  Container,
  VStack,
  Card,
  CardBody,
  Heading,
  useColorModeValue,
  HStack,
  Text,
  TableContainer,
} from "@chakra-ui/react";
import Papa from "papaparse";
import StudentAdd from "./StudentAdd";
import useAxios from "@/config/axios";
import { Database, Upload, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";

const StudentImport = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [adding, setAdding] = useState(false);
  const [addIndividual, setAddIndividual] = useState(false);
  const [houses, setHouses] = useState([]);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const toast = useToast();
  const navigate = useNavigate();
  const axios = useAxios();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const file = files[0];
    Papa.parse(file, {
      complete: (result) => {
        setTableData(result.data as string[][]);
      },
    });
  };

  const startImport = () => {
    setAdding(true);
    tableData.forEach((row) => {
      if (row.length !== 5) {
        toast({
          title: "Error",
          description:
            "Invalid CSV File with length " +
            " at row " +
            (tableData.indexOf(row) + 1),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setAdding(false);
        return;
      }

      if (row[0].length !== 8) {
        toast({
          title: "Error",
          description:
            "Invalid Student ID at row " + (tableData.indexOf(row) + 1),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setAdding(false);
        return;
      }
    });

    axios
      .post("/user/student/bulk", { tableData })
      .then((res) => {
        if (res.status === 200) {
          toast({
            title: "Students Imported",
            description: "Students have been successfully imported",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          navigate("/admin/student");
        } else if (res.status === 409) {
          toast({
            title: "Error",
            description: "Moodle ID already exists",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Error",
            description: "Error in importing students",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .finally(() => {
        setTableData([]);
        setAdding(false);
      });
  };

  useEffect(() => {
    axios
      .get("/houses")
      .then((res) => {
        setHouses(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: err.response.data.message || "Something went wrong",   
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, []);

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <Heading size="lg" color={useColorModeValue("gray.700", "white")}>
                Student Import Dashboard
              </Heading>

              <HStack spacing={4} width="full" justify="flex-start">
                <Button
                  leftIcon={<UserPlus />}
                  colorScheme="blue"
                  size="lg"
                  onClick={() => setAddIndividual(true)}
                  variant="solid"
                  px={8}
                >
                  Add Individual
                </Button>

                <Button
                  as="label"
                  htmlFor="file-upload"
                  leftIcon={<Upload />}
                  colorScheme="teal"
                  size="lg"
                  cursor="pointer"
                  px={8}
                >
                  Upload CSV
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Button>
              </HStack>

              <Alert
                status="warning"
                variant="left-accent"
                borderRadius="md"
                bg={useColorModeValue("orange.50", "orange.900")}
              >
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">CSV File Requirements:</Text>
                  <Text>
                    • Columns must be in order: Student ID, First Name, Last
                    Name, Gender, Email
                    <br />
                    • First row should NOT contain column headers
                    <br />• No blank rows allowed
                  </Text>
                </VStack>
              </Alert>

              {tableData.length > 0 && (
                <Box width="full">
                  <HStack justify="space-between" mb={4}>
                    <Text
                      fontSize="md"
                      p={2}
                      borderRadius="md"
                      display={"flex"}
                      gap={2}
                    >
                      <Database />
                      {tableData.length} Records Loaded
                    </Text>
                  </HStack>

                  <TableContainer
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    maxH="50vh"
                    overflowY="auto"
                    bg={bgColor}
                    boxShadow="sm"
                  >
                    <Table variant="simple">
                      <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
                        <Tr>
                          <Th>Student ID</Th>
                          <Th>First Name</Th>
                          <Th>Last Name</Th>
                          <Th>Gender</Th>
                          <Th>Email</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {tableData.map((row, index) => (
                          <Tr key={index}>
                            {row.map((cell, i) => (
                              <Td key={i}>{cell}</Td>
                            ))}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {tableData.length > 0 && (
                <HStack width="full" justify="flex-end" pt={4}>
                  <Button
                    leftIcon={<Database />}
                    colorScheme="green"
                    size="lg"
                    onClick={startImport}
                    isLoading={adding}
                    loadingText="Importing..."
                    px={8}
                  >
                    Import Students
                  </Button>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {addIndividual && (
        <StudentAdd setModal={setAddIndividual} houses={houses} />
      )}
    </Container>
  );
};

export default StudentImport;
