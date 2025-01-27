import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Alert,
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
import { Upload, UserPlus, FileSpreadsheet, AlertTriangle } from "lucide-react";
import Papa from "papaparse";
import FacultyAdd from "./FacultyAdd";
import { House } from "@shared-types/House";

const MotionBox = motion(Box);
import useAxios from "@/config/axios";

const FacultyImport = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [adding, setAdding] = useState(false);
  const [addIndividual, setAddIndividual] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);

  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const axios = useAxios();

  const isValidRow = (row: string[]) => {
    // Check if row has any non-empty values
    return row.some((cell) => cell.trim() !== "");
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          // Filter out empty rows and trim whitespace from all cells
          const cleanedData = (result.data as string[][])
            .filter(isValidRow)
            .map((row) => row.map((cell) => cell.trim()));
          setTableData(cleanedData);
        },
      });
    }
  };

  const handleModal = (value: boolean) => {
    setAddIndividual(value);
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
          description: "Failed to fetch houses data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, []);

  const startImport = () => {
    setAdding(true);

    // Validate all rows before proceeding with import
    const invalidRows = tableData.filter((row) => {
      const hasInvalidLength = row.length !== 5;
      const hasInvalidMoodleId = row[0].length !== 3;
      const hasEmptyFields = row.some((cell) => cell.trim() === "");

      return hasInvalidLength || hasInvalidMoodleId || hasEmptyFields;
    });

    if (invalidRows.length > 0) {
      toast({
        title: "Validation Error",
        description:
          "Some rows contain invalid data. Please check the format and ensure no fields are empty.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setAdding(false);
      return;
    }

    axios
      .post("/user/faculty/bulk", { tableData })
      .then(() => {
        toast({
          title: "Faculty Imported",
          description: "Faculty members have been successfully imported",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setTableData([]);
        setTimeout(() => {
          window.location.href = "/admin/faculty";
        }, 3000);
      })
      .catch((err) => {
        if (err?.response?.status === 409) {
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
            description:
              err.response?.data?.message || "Error in importing faculty",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .finally(() => {
        setAdding(false);
      });
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
              Faculty Management
            </Heading>
            <Text color="gray.600">
              Import faculty members or add them individually to the system
            </Text>
          </Box>

          <HStack spacing={4} justify="flex-start">
            <Button
              leftIcon={<UserPlus size={18} />}
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
              leftIcon={<FileSpreadsheet size={18} />}
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
            <AlertTriangle className="mr-3 text-orange-500" />
            <AlertDescription>
              Please upload a CSV file with columns in order: Moodle ID (3
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
                      <Th>Moodle ID</Th>
                      <Th>First Name</Th>
                      <Th>Last Name</Th>
                      <Th>Gender</Th>
                      <Th>Email</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {tableData.map((row, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {row.map((cell, cellIndex) => (
                          <Td key={cellIndex}>{cell}</Td>
                        ))}
                      </motion.tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </MotionBox>
          )}

          {tableData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Box display="flex" justifyContent="flex-end">
                <Button
                  leftIcon={<Upload size={18} />}
                  colorScheme="green"
                  onClick={startImport}
                  isLoading={adding}
                  size="lg"
                  shadow="md"
                  _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                  transition="all 0.2s"
                >
                  Import Faculty
                </Button>
              </Box>
            </motion.div>
          )}
        </VStack>
      </MotionBox>

      {addIndividual && <FacultyAdd setModal={handleModal} h={{ houses }} />}
    </Container>
  );
};

export default FacultyImport;
