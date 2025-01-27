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
  Heading,
  VStack,
  useColorModeValue,
  Text,
  HStack,
  AlertDescription,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Upload, UserPlus, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { useNavigate } from "react-router";
import useAxios from "@/config/axios";
import StudentAdd from "./StudentAdd";

const MotionBox = motion(Box);

const StudentImport = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [adding, setAdding] = useState(false);
  const [addIndividual, setAddIndividual] = useState(false);
  const [houses, setHouses] = useState([]);

  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const navigate = useNavigate();
  const axios = useAxios();

  const isValidRow = (row: string[]) => {
    // Check if row has any non-empty values and correct number of columns
    return row.length === 5 && row.some((cell) => cell.trim() !== "");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const file = files[0];
    Papa.parse(file, {
      complete: (result) => {
        // Filter out empty rows and trim whitespace from all cells
        const cleanedData = (result.data as string[][])
          .filter(isValidRow)
          .map((row) => row.map((cell) => cell.trim()));
        setTableData(cleanedData);
      },
    });
  };

  const startImport = () => {
    setAdding(true);

    // Validate all rows before proceeding with import
    const invalidRows = tableData.filter((row) => {
      const hasInvalidStudentId = row[0].length !== 8;
      const hasEmptyFields = row.some((cell) => cell.trim() === "");
      return hasInvalidStudentId || hasEmptyFields;
    });

    if (invalidRows.length > 0) {
      toast({
        title: "Validation Error",
        description:
          "Some rows contain invalid data. Please check Student IDs and ensure no fields are empty.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setAdding(false);
      return;
    }

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
            description: "Student ID already exists",
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
      .catch((err) => {
        toast({
          title: "Error",
          description:
            err.response?.data?.message || "Error in importing students",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
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
          description: err.response?.data?.message || "Something went wrong",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, []);

  const handleModal = (value: boolean) => {
    setAddIndividual(value);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>
              Student Management
            </Heading>
            <Text color="gray.600">
              Import or add individual students to the system
            </Text>
          </Box>

          <HStack spacing={4} justify="flex-start">
            <Button
              leftIcon={<UserPlus />}
              colorScheme="blue"
              onClick={() => setAddIndividual(true)}
              size="md"
              shadow="md"
              _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
              transition="all 0.2s"
            >
              Add Individual
            </Button>
            <Button
              as="label"
              htmlFor="file-upload"
              leftIcon={<FileSpreadsheet />}
              colorScheme="purple"
              size="md"
              shadow="md"
              _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
              transition="all 0.2s"
              cursor="pointer"
            >
              Upload CSV
            </Button>
          </HStack>

          <Alert
            status="warning"
            variant="left-accent"
            borderRadius="md"
            shadow="sm"
          >
            <AlertIcon />
            <AlertDescription>
              Please upload a CSV file with columns in order: Student ID (8
              digits), First Name, Last Name, Gender, Email. First row should
              not contain column names. Empty rows will be automatically
              removed.
            </AlertDescription>
          </Alert>

          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />

          {tableData.length > 0 && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              bg={bgColor}
              borderRadius="lg"
              shadow="xl"
              overflow="hidden"
              border="1px"
              borderColor={borderColor}
            >
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr bg={useColorModeValue("gray.50", "gray.900")}>
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
                        {row.map((cell, cellIndex) => (
                          <Td key={cellIndex}>{cell}</Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </MotionBox>
          )}

          {tableData.length > 0 && (
            <Box display="flex" justifyContent="flex-end">
              <Button
                leftIcon={<Upload />}
                colorScheme="green"
                onClick={startImport}
                isLoading={adding}
                size="lg"
                shadow="md"
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s"
              >
                Import Students
              </Button>
            </Box>
          )}
        </VStack>
      </MotionBox>

      {addIndividual && <StudentAdd setModal={handleModal} houses={houses} />}
    </Container>
  );
};

export default StudentImport;
