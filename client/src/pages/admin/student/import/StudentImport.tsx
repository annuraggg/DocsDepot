import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
  Heading,
  VStack,
  useColorModeValue,
  Text,
  AlertDescription,
  AlertTitle,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Icon,
  Badge,
  Progress,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Tooltip,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
  Center,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  UserPlus,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  Download,
  Eye,
  Trash2,
  Database,
  FileText,
} from "lucide-react";
import Papa from "papaparse";
import { useNavigate } from "react-router";
import useAxios from "@/config/axios";
import StudentAdd from "./StudentAdd";
import Loader from "@/components/Loader";

// Enhanced interfaces
interface StudentMember {
  moodleId: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportStats {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
}

// Configuration constants
const CONFIG = {
  CSV: {
    REQUIRED_COLUMNS: 5,
    EXPECTED_HEADERS: [
      "Student ID",
      "First Name",
      "Last Name",
      "Gender",
      "Email",
    ],
    STUDENT_ID_LENGTH: 8,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  VALIDATION: {
    NAME_MIN_LENGTH: 2,
    GENDER_OPTIONS: ["M", "F", "O"],
  },
  TOAST: {
    DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
    },
    POSITION: "top-right" as const,
  },
  ANIMATION: {
    DURATION: 0.3,
    SPRING: { type: "spring", stiffness: 300, damping: 30 },
  },
} as const;

// Enhanced components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionTr = motion(Tr);

// Utility functions
const isValidRow = (row: string[]): boolean => {
  return row.some((cell) => cell.trim() !== "");
};

const validateRow = (row: string[], index: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (row.length !== CONFIG.CSV.REQUIRED_COLUMNS) {
    errors.push({
      row: index + 1,
      field: "structure",
      message: `Row must have exactly ${CONFIG.CSV.REQUIRED_COLUMNS} columns`,
    });
    return errors;
  }

  // Validate Student ID
  if (!row[0].trim()) {
    errors.push({
      row: index + 1,
      field: "studentId",
      message: "Student ID is required",
    });
  } else if (row[0].trim().length !== CONFIG.CSV.STUDENT_ID_LENGTH) {
    errors.push({
      row: index + 1,
      field: "studentId",
      message: `Student ID must be exactly ${CONFIG.CSV.STUDENT_ID_LENGTH} digits`,
    });
  } else if (!/^\d+$/.test(row[0].trim())) {
    errors.push({
      row: index + 1,
      field: "studentId",
      message: "Student ID must contain only numbers",
    });
  }

  // Validate First Name
  if (!row[1].trim()) {
    errors.push({
      row: index + 1,
      field: "firstName",
      message: "First name is required",
    });
  } else if (row[1].trim().length < CONFIG.VALIDATION.NAME_MIN_LENGTH) {
    errors.push({
      row: index + 1,
      field: "firstName",
      message: "First name must be at least 2 characters",
    });
  }

  // Validate Last Name
  if (!row[2].trim()) {
    errors.push({
      row: index + 1,
      field: "lastName",
      message: "Last name is required",
    });
  } else if (row[2].trim().length < CONFIG.VALIDATION.NAME_MIN_LENGTH) {
    errors.push({
      row: index + 1,
      field: "lastName",
      message: "Last name must be at least 2 characters",
    });
  }

  // Validate Gender
  if (!row[3].trim()) {
    errors.push({
      row: index + 1,
      field: "gender",
      message: "Gender is required",
    });
  } else if (
    !CONFIG.VALIDATION.GENDER_OPTIONS.includes(
      row[3].trim().toUpperCase() as "M" | "F" | "O"
    )
  ) {
    errors.push({
      row: index + 1,
      field: "gender",
      message: "Gender must be M, F, or O",
    });
  }

  // Validate Email
  if (!row[4].trim()) {
    errors.push({
      row: index + 1,
      field: "email",
      message: "Email is required",
    });
  } else if (!CONFIG.CSV.EMAIL_REGEX.test(row[4].trim())) {
    errors.push({
      row: index + 1,
      field: "email",
      message: "Invalid email format",
    });
  }

  return errors;
};

const convertTableDataToStudentMembers = (
  data: string[][]
): StudentMember[] => {
  return data.map((row) => ({
    moodleId: row[0].trim(),
    firstName: row[1].trim(),
    lastName: row[2].trim(),
    gender: row[3].trim().toUpperCase(),
    email: row[4].trim().toLowerCase(),
  }));
};

const detectDuplicates = (data: string[][]): number[] => {
  const seen = new Set<string>();
  const duplicates: number[] = [];

  data.forEach((row, index) => {
    const identifier = `${row[0].trim()}-${row[4].trim().toLowerCase()}`;
    if (seen.has(identifier)) {
      duplicates.push(index);
    } else {
      seen.add(identifier);
    }
  });

  return duplicates;
};

const StudentImport = () => {
  // State management
  const [tableData, setTableData] = useState<string[][]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [addIndividual, setAddIndividual] = useState<boolean>(false);
  const [houses, setHouses] = useState([]);
  const [isHousesLoading, setIsHousesLoading] = useState<boolean>(true);
  const [studentMembers, setStudentMembers] = useState<StudentMember[]>([]);
  const [duplicateRows, setDuplicateRows] = useState<number[]>([]);
  const [importProgress, setImportProgress] = useState<number>(0);

  // Hooks
  const toast = useToast();
  const navigate = useNavigate();
  const axios = useAxios();
  const {
    isOpen: isValidationOpen,
    onOpen: onValidationOpen,
    onClose: onValidationClose,
  } = useDisclosure();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Memoized calculations
  const importStats: ImportStats = useMemo(() => {
    const total = tableData.length;
    const invalid = validationErrors.length;
    const duplicates = duplicateRows.length;
    const valid =
      total -
      new Set([...validationErrors.map((e) => e.row - 1), ...duplicateRows])
        .size;

    return { total, valid, invalid, duplicates };
  }, [tableData, validationErrors, duplicateRows]);

  const canImport = useMemo(() => {
    return (
      tableData.length > 0 &&
      validationErrors.length === 0 &&
      duplicateRows.length === 0
    );
  }, [tableData, validationErrors, duplicateRows]);

  // Event handlers
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file",
          status: "error",
          duration: CONFIG.TOAST.DURATION.ERROR,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });
        return;
      }

      Papa.parse(file, {
        complete: (result) => {
          try {
            const cleanedData = (result.data as string[][])
              .filter(isValidRow)
              .map((row) => row.map((cell) => cell.trim()));

            if (cleanedData.length === 0) {
              toast({
                title: "Empty File",
                description:
                  "The CSV file appears to be empty or contains no valid data",
                status: "warning",
                duration: CONFIG.TOAST.DURATION.ERROR,
                isClosable: true,
                position: CONFIG.TOAST.POSITION,
              });
              return;
            }

            setTableData(cleanedData);

            // Validate all rows
            const allErrors: ValidationError[] = [];
            cleanedData.forEach((row, index) => {
              const rowErrors = validateRow(row, index);
              allErrors.push(...rowErrors);
            });
            setValidationErrors(allErrors);

            // Detect duplicates
            const duplicates = detectDuplicates(cleanedData);
            setDuplicateRows(duplicates);

            toast({
              title: "File Uploaded",
              description: `Processed ${cleanedData.length} rows with ${allErrors.length} validation errors`,
              status: allErrors.length === 0 ? "success" : "warning",
              duration: CONFIG.TOAST.DURATION.SUCCESS,
              isClosable: true,
              position: CONFIG.TOAST.POSITION,
            });

            if (allErrors.length > 0 || duplicates.length > 0) {
              onValidationOpen();
            }
          } catch (error) {
            console.error("CSV processing error:", error);
            toast({
              title: "Processing Error",
              description: "Failed to process the CSV file",
              status: "error",
              duration: CONFIG.TOAST.DURATION.ERROR,
              isClosable: true,
              position: CONFIG.TOAST.POSITION,
            });
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast({
            title: "CSV Parsing Error",
            description:
              "Failed to parse the CSV file. Please check the file format.",
            status: "error",
            duration: CONFIG.TOAST.DURATION.ERROR,
            isClosable: true,
            position: CONFIG.TOAST.POSITION,
          });
        },
      });

      // Reset input
      event.target.value = "";
    },
    [toast, onValidationOpen]
  );

  const startImport = useCallback(async () => {
    if (!canImport) {
      toast({
        title: "Cannot Import",
        description: "Please fix all validation errors before importing",
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    const newStudentMembers = convertTableDataToStudentMembers(tableData);
    const previousStudentMembers = [...studentMembers];

    // Optimistic update
    setStudentMembers((prev) => [...prev, ...newStudentMembers]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await axios.post("/user/student/bulk", { tableData });

      clearInterval(progressInterval);
      setImportProgress(100);

      toast({
        title: "Import Successful",
        description: `Successfully imported ${tableData.length} students`,
        status: "success",
        duration: CONFIG.TOAST.DURATION.SUCCESS,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });

      setTimeout(() => {
        setTableData([]);
        setValidationErrors([]);
        setDuplicateRows([]);
        navigate("/admin/students");
      }, 1000);
    } catch (err: any) {
      // Revert optimistic update
      setStudentMembers(previousStudentMembers);
      setImportProgress(0);

      console.error("Bulk import error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to import students";

      toast({
        title: "Import Failed",
        description: errorMessage,
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    } finally {
      setIsImporting(false);
    }
  }, [canImport, tableData, studentMembers, axios, toast, navigate]);

  const clearData = useCallback(() => {
    setTableData([]);
    setValidationErrors([]);
    setDuplicateRows([]);
    setImportProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const downloadTemplate = useCallback(() => {
    const templateData = [
      ["12345678", "John", "Doe", "M", "john.doe@example.com"],
      ["87654321", "Jane", "Smith", "F", "jane.smith@example.com"],
      ["11223344", "Alex", "Johnson", "O", "alex.johnson@example.com"],
    ];

    const csv = Papa.unparse(templateData, {
      header: false,
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to your device",
      status: "success",
      duration: CONFIG.TOAST.DURATION.SUCCESS,
      isClosable: true,
      position: CONFIG.TOAST.POSITION,
    });
  }, [toast]);

  // Effects
  useEffect(() => {
    const fetchHouses = async () => {
      setIsHousesLoading(true);
      try {
        const response = await axios.get("/houses");
        setHouses(response.data.data);
      } catch (err: any) {
        console.error("Houses fetch error:", err);
        toast({
          title: "Error Loading Houses",
          description:
            err.response?.data?.message || "Failed to fetch houses data",
          status: "error",
          duration: CONFIG.TOAST.DURATION.ERROR,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });
      } finally {
        setIsHousesLoading(false);
      }
    };

    fetchHouses();
  }, []);

  const handleModal = useCallback((value: boolean) => {
    setAddIndividual(value);
  }, []);

  // Loading state
  if (isHousesLoading) {
    return <Loader />;
  }

  return (
    <Box bg={bgColor} minH="100vh" p={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        maxW="7xl"
        mx="auto"
      >
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Card
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={4}
                >
                  <VStack align="start" spacing={2}>
                    <HStack spacing={3}>
                      <Icon as={Users} color="blue.500" boxSize={8} />
                      <Heading size="xl" fontWeight="800">
                        Student Import
                      </Heading>
                    </HStack>
                    <Text color="gray.600" fontSize="lg">
                      Import students in bulk or add them individually
                    </Text>
                  </VStack>

                  <Button
                    leftIcon={<ArrowLeft size={18} />}
                    variant="outline"
                    onClick={() => navigate("/admin/students")}
                    borderRadius="lg"
                  >
                    Back to Students
                  </Button>
                </Flex>

                <Divider />

                {/* Action Buttons */}
                <HStack spacing={4} wrap="wrap" justify="center">
                  <Button
                    leftIcon={<UserPlus size={18} />}
                    colorScheme="blue"
                    onClick={() => setAddIndividual(true)}
                    size="lg"
                    borderRadius="xl"
                    isDisabled={isHousesLoading}
                    _hover={{ transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                  >
                    Add Individual Student
                  </Button>

                  <Button
                    as="label"
                    htmlFor="file-upload"
                    leftIcon={<FileSpreadsheet size={18} />}
                    colorScheme="purple"
                    size="lg"
                    borderRadius="xl"
                    cursor="pointer"
                    isDisabled={isHousesLoading}
                    _hover={{ transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                  >
                    Upload CSV File
                  </Button>

                  <Button
                    leftIcon={<Download size={18} />}
                    variant="outline"
                    onClick={downloadTemplate}
                    size="lg"
                    borderRadius="xl"
                    _hover={{ transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                  >
                    Download Template
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Instructions */}
          <Alert
            status="info"
            variant="left-accent"
            borderRadius="xl"
            bg={useColorModeValue("blue.50", "blue.900/20")}
            border="1px"
            borderColor="blue.200"
          >
            <AlertIcon as={FileText} />
            <VStack align="start" spacing={2} flex={1}>
              <AlertTitle fontSize="sm" fontWeight="600">
                CSV Format Instructions
              </AlertTitle>
              <AlertDescription fontSize="sm" lineHeight="tall">
                Upload a CSV file with exactly 5 columns in this order:
                <strong>
                  {" "}
                  Student ID (8 digits), First Name, Last Name, Gender (M/F/O),
                  Email
                </strong>
                .
                <br />
                Do not include column headers. Empty rows will be automatically
                removed.
              </AlertDescription>
            </VStack>
          </Alert>

          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />

          {/* Import Progress */}
          {isImporting && (
            <MotionCard
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
            >
              <CardBody p={6}>
                <VStack spacing={4}>
                  <HStack spacing={3} w="full" justify="space-between">
                    <HStack spacing={2}>
                      <Spinner color="blue.500" />
                      <Text fontWeight="600">Importing Students...</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {importProgress}% Complete
                    </Text>
                  </HStack>
                  <Progress
                    value={importProgress}
                    colorScheme="blue"
                    size="lg"
                    borderRadius="full"
                    w="full"
                    hasStripe
                    isAnimated
                  />
                </VStack>
              </CardBody>
            </MotionCard>
          )}

          {/* Statistics */}
          {tableData.length > 0 && (
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Card
                bg={cardBg}
                borderRadius="xl"
                border="1px"
                borderColor={borderColor}
              >
                <CardBody p={4}>
                  <Stat>
                    <HStack justify="space-between" mb={2}>
                      <StatLabel fontSize="sm">Total Rows</StatLabel>
                      <Icon as={Database} color="blue.500" boxSize={4} />
                    </HStack>
                    <StatNumber fontSize="2xl" fontWeight="700">
                      {importStats.total}
                    </StatNumber>
                    <StatHelpText mb={0}>From CSV file</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card
                bg={cardBg}
                borderRadius="xl"
                border="1px"
                borderColor={borderColor}
              >
                <CardBody p={4}>
                  <Stat>
                    <HStack justify="space-between" mb={2}>
                      <StatLabel fontSize="sm">Valid</StatLabel>
                      <Icon as={CheckCircle} color="green.500" boxSize={4} />
                    </HStack>
                    <StatNumber
                      fontSize="2xl"
                      fontWeight="700"
                      color="green.500"
                    >
                      {importStats.valid}
                    </StatNumber>
                    <StatHelpText mb={0}>Ready to import</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card
                bg={cardBg}
                borderRadius="xl"
                border="1px"
                borderColor={borderColor}
              >
                <CardBody p={4}>
                  <Stat>
                    <HStack justify="space-between" mb={2}>
                      <StatLabel fontSize="sm">Errors</StatLabel>
                      <Icon as={AlertTriangle} color="red.500" boxSize={4} />
                    </HStack>
                    <StatNumber fontSize="2xl" fontWeight="700" color="red.500">
                      {importStats.invalid}
                    </StatNumber>
                    <StatHelpText mb={0}>Need fixing</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card
                bg={cardBg}
                borderRadius="xl"
                border="1px"
                borderColor={borderColor}
              >
                <CardBody p={4}>
                  <Stat>
                    <HStack justify="space-between" mb={2}>
                      <StatLabel fontSize="sm">Duplicates</StatLabel>
                      <Icon as={AlertTriangle} color="orange.500" boxSize={4} />
                    </HStack>
                    <StatNumber
                      fontSize="2xl"
                      fontWeight="700"
                      color="orange.500"
                    >
                      {importStats.duplicates}
                    </StatNumber>
                    <StatHelpText mb={0}>Need review</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Data Preview */}
          {tableData.length > 0 && (
            <Card
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
            >
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="600">
                      Data Preview
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Showing {Math.min(tableData.length, 10)} of{" "}
                      {tableData.length} rows
                    </Text>
                  </VStack>

                  <HStack spacing={2}>
                    {(validationErrors.length > 0 ||
                      duplicateRows.length > 0) && (
                      <Button
                        leftIcon={<Eye size={16} />}
                        variant="outline"
                        size="sm"
                        onClick={onValidationOpen}
                        borderRadius="lg"
                      >
                        View Issues (
                        {validationErrors.length + duplicateRows.length})
                      </Button>
                    )}
                    <Button
                      leftIcon={<Trash2 size={16} />}
                      variant="outline"
                      colorScheme="red"
                      size="sm"
                      onClick={clearData}
                      borderRadius="lg"
                    >
                      Clear Data
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>

              <CardBody pt={0}>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr bg={useColorModeValue("gray.50", "gray.700")}>
                        <Th borderColor={borderColor}>Row</Th>
                        <Th borderColor={borderColor}>Student ID</Th>
                        <Th borderColor={borderColor}>First Name</Th>
                        <Th borderColor={borderColor}>Last Name</Th>
                        <Th borderColor={borderColor}>Gender</Th>
                        <Th borderColor={borderColor}>Email</Th>
                        <Th borderColor={borderColor}>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <AnimatePresence>
                        {tableData.slice(0, 10).map((row, index) => {
                          const hasErrors = validationErrors.some(
                            (e) => e.row === index + 1
                          );
                          const isDuplicate = duplicateRows.includes(index);
                          const hasIssues = hasErrors || isDuplicate;

                          return (
                            <MotionTr
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              bg={
                                hasIssues
                                  ? useColorModeValue("red.50", "red.900/20")
                                  : "transparent"
                              }
                            >
                              <Td borderColor={borderColor}>
                                <Badge
                                  colorScheme={hasIssues ? "red" : "green"}
                                  variant="subtle"
                                  borderRadius="full"
                                >
                                  {index + 1}
                                </Badge>
                              </Td>
                              {row.map((cell, cellIndex) => (
                                <Td key={cellIndex} borderColor={borderColor}>
                                  {cell || (
                                    <Text color="gray.400" fontStyle="italic">
                                      empty
                                    </Text>
                                  )}
                                </Td>
                              ))}
                              <Td borderColor={borderColor}>
                                {hasIssues ? (
                                  <Tooltip
                                    label={
                                      hasErrors
                                        ? "Has validation errors"
                                        : "Duplicate entry"
                                    }
                                  >
                                    <Badge
                                      colorScheme="red"
                                      variant="solid"
                                      borderRadius="full"
                                    >
                                      {hasErrors ? "Error" : "Duplicate"}
                                    </Badge>
                                  </Tooltip>
                                ) : (
                                  <Badge
                                    colorScheme="green"
                                    variant="solid"
                                    borderRadius="full"
                                  >
                                    Valid
                                  </Badge>
                                )}
                              </Td>
                            </MotionTr>
                          );
                        })}
                      </AnimatePresence>
                    </Tbody>
                  </Table>
                </Box>

                {tableData.length > 10 && (
                  <Center mt={4}>
                    <Text fontSize="sm" color="gray.500">
                      ... and {tableData.length - 10} more rows
                    </Text>
                  </Center>
                )}
              </CardBody>
            </Card>
          )}

          {/* Import Action */}
          {tableData.length > 0 && (
            <Card
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
            >
              <CardBody p={6}>
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={4}
                >
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="600">
                      Ready to Import
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {canImport
                        ? `${importStats.valid} students will be added to the system`
                        : `Please fix ${
                            validationErrors.length + duplicateRows.length
                          } issues before importing`}
                    </Text>
                  </VStack>

                  <HStack spacing={3}>
                    <Button
                      leftIcon={<RefreshCw size={16} />}
                      variant="outline"
                      onClick={clearData}
                      isDisabled={isImporting}
                      borderRadius="lg"
                    >
                      Reset
                    </Button>
                    <Button
                      leftIcon={<Upload size={18} />}
                      colorScheme="green"
                      onClick={startImport}
                      isLoading={isImporting}
                      loadingText="Importing..."
                      isDisabled={!canImport}
                      size="lg"
                      borderRadius="xl"
                      _hover={{ transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      Import {importStats.valid} Students
                    </Button>
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          )}
        </VStack>

        {/* Validation Issues Modal */}
        <Modal
          isOpen={isValidationOpen}
          onClose={onValidationClose}
          size="4xl"
          scrollBehavior="inside"
        >
          <ModalOverlay backdropFilter="blur(8px)" />
          <ModalContent borderRadius="xl" mx={4}>
            <ModalHeader borderBottom="1px" borderColor={borderColor}>
              <HStack spacing={3}>
                <Icon as={AlertTriangle} color="red.500" boxSize={6} />
                <VStack align="start" spacing={1}>
                  <Text fontSize="lg" fontWeight="700">
                    Validation Issues
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="normal">
                    {validationErrors.length + duplicateRows.length} issues
                    found in your data
                  </Text>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody py={6}>
              <VStack spacing={6} align="stretch">
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Icon as={AlertTriangle} color="red.500" boxSize={5} />
                      <Text fontSize="md" fontWeight="600">
                        Validation Errors ({validationErrors.length})
                      </Text>
                    </HStack>

                    <Card
                      variant="outline"
                      borderRadius="xl"
                      borderColor="red.200"
                    >
                      <CardBody p={4}>
                        <VStack spacing={3} align="stretch">
                          {validationErrors.slice(0, 10).map((error, index) => (
                            <Alert
                              key={index}
                              status="error"
                              borderRadius="lg"
                              variant="left-accent"
                            >
                              <AlertIcon />
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontSize="sm" fontWeight="600">
                                  Row {error.row} - {error.field}
                                </Text>
                                <Text fontSize="sm">{error.message}</Text>
                              </VStack>
                            </Alert>
                          ))}
                          {validationErrors.length > 10 && (
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              textAlign="center"
                            >
                              ... and {validationErrors.length - 10} more
                              validation errors
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                )}

                {/* Duplicate Entries */}
                {duplicateRows.length > 0 && (
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Icon as={AlertTriangle} color="orange.500" boxSize={5} />
                      <Text fontSize="md" fontWeight="600">
                        Duplicate Entries ({duplicateRows.length})
                      </Text>
                    </HStack>

                    <Card
                      variant="outline"
                      borderRadius="xl"
                      borderColor="orange.200"
                    >
                      <CardBody p={4}>
                        <VStack spacing={3} align="stretch">
                          {duplicateRows.slice(0, 5).map((rowIndex, index) => (
                            <Alert
                              key={index}
                              status="warning"
                              borderRadius="lg"
                              variant="left-accent"
                            >
                              <AlertIcon />
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontSize="sm" fontWeight="600">
                                  Row {rowIndex + 1} - Duplicate Entry
                                </Text>
                                <Text fontSize="sm">
                                  Student ID: {tableData[rowIndex]?.[0]} |
                                  Email: {tableData[rowIndex]?.[4]}
                                </Text>
                              </VStack>
                            </Alert>
                          ))}
                          {duplicateRows.length > 5 && (
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              textAlign="center"
                            >
                              ... and {duplicateRows.length - 5} more duplicate
                              entries
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                )}

                {/* Instructions */}
                <Alert status="info" borderRadius="xl" variant="left-accent">
                  <AlertIcon />
                  <VStack align="start" spacing={1} flex={1}>
                    <AlertTitle fontSize="sm">How to Fix Issues</AlertTitle>
                    <AlertDescription fontSize="sm">
                      1. Download your original CSV file and fix the highlighted
                      issues
                      <br />
                      2. Remove or correct duplicate entries
                      <br />
                      3. Re-upload the corrected CSV file
                      <br />
                      4. Ensure all required fields are filled and properly
                      formatted
                    </AlertDescription>
                  </VStack>
                </Alert>
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px" borderColor={borderColor} gap={3}>
              <Button variant="outline" onClick={onValidationClose}>
                Close
              </Button>
              <Button colorScheme="blue" onClick={onValidationClose}>
                Fix Issues
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Add Individual Student Modal */}
        {addIndividual && <StudentAdd setModal={handleModal} houses={houses} />}
      </MotionBox>
    </Box>
  );
};

export default StudentImport;
