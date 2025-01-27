import { useState, useEffect, useRef } from "react";
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
  AlertDescription,
  useBreakpointValue,
  Stack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Upload, UserPlus, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { useNavigate } from "react-router";
import useAxios from "@/config/axios";
import StudentAdd from "./StudentAdd";

const MotionBox = motion(Box);

const StudentImport = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [tableData, setTableData] = useState<string[][]>([]);
  const [adding, setAdding] = useState(false);
  const [addIndividual, setAddIndividual] = useState(false);
  const [houses, setHouses] = useState([]);

  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const navigate = useNavigate();
  const axios = useAxios();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isValidRow = (row: string[]) => {
    // Check if row has any non-empty values
    return row.some((cell) => cell.trim() !== "");
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

    // Additional validation before import
    const invalidRows = tableData.filter((row) => {
      return (
        row.length !== 5 ||
        row[0].length !== 8 ||
        row.some((cell) => cell.trim() === "")
      );
    });

    if (invalidRows.length > 0) {
      toast({
        title: "Validation Error",
        description:
          "Some rows contain invalid data. Please check the format and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setAdding(false);
      return;
    }

    axios
      .post("/user/student/bulk", { tableData })
      .then(() => {
        toast({
          title: "Students Imported",
          description: "Students imported successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => navigate("/admin/students"), 3000);
      })
      .catch((err) => {
        if (err.response.status === 409) {
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
            description: err.response.data.message || "Import failed",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .finally(() => {
        setTableData([]);
        setAdding(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  useEffect(() => {
    axios
      .get("/houses")
      .then((res) => setHouses(res.data.data))
      .catch((err) => {
        toast({
          title: "Error",
          description: err.response.data.message || "Failed to fetch houses",
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

          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={4}
            justify="flex-start"
          >
            <Button
              leftIcon={<UserPlus size={18} />}
              colorScheme="blue"
              onClick={() => setAddIndividual(true)}
              size="md"
              width={{ base: "full", md: "auto" }}
            >
              Add Individual
            </Button>
            <Button
              as="label"
              htmlFor="file-upload"
              leftIcon={<FileSpreadsheet size={18} />}
              colorScheme="purple"
              size="md"
              width={{ base: "full", md: "auto" }}
            >
              Upload CSV
            </Button>
          </Stack>

          <Alert
            status="warning"
            variant="left-accent"
            borderRadius="md"
            fontSize={{ base: "sm", md: "md" }}
          >
            <AlertIcon />
            <AlertDescription>
              {isMobile ? (
                "CSV format: ID (8 digits), First, Last, Gender, Email"
              ) : (
                <>
                  Please upload a CSV file with columns in order: Student ID,
                  First Name, Last Name, Gender, Email. First row should not
                  contain column names. Empty rows will be automatically
                  removed.
                </>
              )}
            </AlertDescription>
          </Alert>

          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />

          {tableData.length > 0 && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              bg={bgColor}
              borderRadius="lg"
              shadow="xl"
              overflowX="auto"
              border="1px"
              borderColor={borderColor}
            >
              <Box overflowX="auto">
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead bg={useColorModeValue("gray.50", "gray.900")}>
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
            <Box
              display="flex"
              justifyContent={{ base: "center", md: "flex-end" }}
              width="full"
            >
              <Button
                leftIcon={<Upload size={18} />}
                colorScheme="green"
                onClick={startImport}
                isLoading={adding}
                size="md"
                width={{ base: "full", md: "auto" }}
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
