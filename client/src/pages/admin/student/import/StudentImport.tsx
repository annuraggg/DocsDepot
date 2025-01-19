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
  AlertDescription,
  Thead,
  Tr,
  useToast,
  Container,
  Heading,
  VStack,
  useColorModeValue,
  Text,
  HStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Upload, UserPlus, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
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

  const handleModal = (value: boolean) => {
    setAddIndividual(value);
  };

  const startImport = () => {
    setAdding(true);
    tableData.forEach((row) => {
      if (row.length !== 5) {
        toast({
          title: "Error",
          description: "Invalid CSV File",
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
          description: "Invalid Student ID",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setAdding(false);
        return;
      }
    });

    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/admin/students/import`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tableData }),
    })
      .then((res) => {
        setAdding(false);
        if (res.status === 200) {
          toast({
            title: "Students Imported",
            description: "Students have been successfully imported",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
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
      .catch((err) => {
        console.error(err);
        setAdding(false);
        toast({
          title: "Error",
          description: "Error in importing students",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/admin/students`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        setHouses(data.houses);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Error fetching students",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>Student Management</Heading>
            <Text color="gray.600">Import or add individual students to the system</Text>
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
              Please upload a CSV file with columns in order: Student ID, First Name, Last Name,
              Gender, Email. First row should not contain column names. No blank rows allowed.
            </AlertDescription>
          </Alert>

          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />

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