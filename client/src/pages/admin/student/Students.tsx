import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Radio,
  RadioGroup,
  Stack,
  Flex,
  Heading,
  Text,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Badge,
  IconButton,
  FormControl,
  FormLabel,
  Checkbox,
  CheckboxGroup,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  SimpleGrid,
  useBreakpointValue,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Spinner,
  Center,
  Icon,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  Edit2,
  Filter,
  Trash2,
  Users,
  RefreshCw,
  CheckSquare,
  Square,
} from "lucide-react";
import Loader from "../../../components/Loader";
import { User, Gender } from "@shared-types/User";
import useAxios from "@/config/axios";
import { House } from "@shared-types/House";
import { useNavigate } from "react-router";
import getAcademicYear from "@/utils/getAcademicYear";

const ITEMS_PER_PAGE = 10;
const MotionBox = motion(Box);
const MotionCard = motion(Card);

interface ExtendedUser extends Omit<User, "house"> {
  house: House;
}

interface FilterState {
  gender: string[];
  status: string[];
  houses: string[];
  years: string[];
}

interface StudentStats {
  total: number;
  byYear: Record<string, number>;
  byGender: Record<string, number>;
  byHouse: Record<string, number>;
}

const Students = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<ExtendedUser[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    status: [],
    houses: [],
    years: [],
  });
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentToDelete, setStudentToDelete] = useState<string>("");

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteAlertOpen,
    onOpen: onDeleteAlertOpen,
    onClose: onDeleteAlertClose,
  } = useDisclosure();

  const cancelRef = React.useRef(null);
  const navigate = useNavigate();

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [moodleid, setMoodleid] = useState("");
  const [email, setEmail] = useState("");
  const [house, setHouse] = useState("");
  const [gender, setGender] = useState<Gender>("M");
  const [update, setUpdate] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const toast = useToast();
  const axios = useAxios();

  // Calculate student statistics
  const studentStats = useMemo((): StudentStats => {
    const stats: StudentStats = {
      total: students.length,
      byYear: {},
      byGender: {},
      byHouse: {},
    };

    students.forEach((student) => {
      // Year stats
      const year = getAcademicYear(
        student.academicDetails.admissionYear,
        student.academicDetails.isDSE,
        student.academicDetails.yearBacklog
      );
      stats.byYear[year] = (stats.byYear[year] || 0) + 1;

      // Gender stats
      stats.byGender[student.gender] =
        (stats.byGender[student.gender] || 0) + 1;

      // House stats
      const houseName = student.house?.name || "No House";
      stats.byHouse[houseName] = (stats.byHouse[houseName] || 0) + 1;
    });

    return stats;
  }, [students]);

  const fetchStudents = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true);
      else setLoading(true);

      const res = await axios.get("/user/students");
      setStudents(res.data.data);

      if (showRefreshToast) {
        toast({
          title: "Students Refreshed",
          description: `Loaded ${res.data.data?.length || 0} students`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
      const errorMessage =
        err.response?.data?.message || "Something went wrong";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [update]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = [
        student.fname,
        student.lname,
        student.social.email,
        student.mid,
      ].some((value) =>
        value.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesGender =
        filters.gender.length === 0 || filters.gender.includes(student.gender);

      const academicYear = getAcademicYear(
        student.academicDetails.admissionYear,
        student.academicDetails.isDSE,
        student.academicDetails.yearBacklog
      );

      const matchesYear =
        filters.years.length === 0 || filters.years.includes(academicYear);

      const matchesHouse =
        filters.houses.length === 0 ||
        filters.houses.includes(student.house?._id);

      return matchesSearch && matchesGender && matchesYear && matchesHouse;
    });
  }, [searchQuery, students, filters]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  const toggleBulkDelete = () => {
    setIsBulkDelete(!isBulkDelete);
    setSelectedStudents([]);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map((student) => student._id));
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSingleDelete = (studentId: string) => {
    setStudentToDelete(studentId);
    onDeleteAlertOpen();
  };

  const handleBulkDelete = () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one student to delete",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setStudentToDelete("");
    onDeleteAlertOpen();
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (studentToDelete) {
        await axios.delete(`/user/${studentToDelete}`);
        toast({
          title: "Success",
          description: "Student deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.delete("/user/bulk", { data: { ids: selectedStudents } });
        toast({
          title: "Success",
          description: `${selectedStudents.length} students deleted successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      setUpdate(!update);
      setIsBulkDelete(false);
      setSelectedStudents([]);
      setStudentToDelete("");
    } catch (err: any) {
      console.error("Error deleting students:", err);
      const errorMessage =
        err.response?.data?.message || "Something went wrong";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onDeleteAlertClose();
    }
  };

  const openEdit = (mid: string) => {
    const student = students.find((stu) => stu.mid === mid);
    if (student) {
      setStudentId(student._id);
      setFname(student.fname);
      setLname(student.lname);
      setMoodleid(student.mid);
      setEmail(student.social.email);
      setHouse(student.house?._id || "");
      setGender(student.gender);
      onEditOpen();
    }
  };

  const updateStudent = async () => {
    if (!fname.trim() || !lname.trim() || !email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUpdating(true);
    try {
      await axios.put(`/user/${studentId}`, {
        mid: moodleid,
        fname: fname.trim(),
        lname: lname.trim(),
        email: email.trim(),
        house,
        gender,
      });

      toast({
        title: "Success",
        description: "Student updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setUpdate(!update);
      onEditClose();
    } catch (err: any) {
      console.error("Error updating student:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      gender: [],
      status: [],
      houses: [],
      years: [],
    });
    setCurrentPage(1);
  };

  const uniqueHouses = Array.from(
    new Set(students.map((student) => student.house?._id))
  )
    .map((id) => students.find((student) => student.house?._id === id)?.house)
    .filter(Boolean);

  const uniqueYears = useMemo(() => {
    const years = students.map((student) =>
      getAcademicYear(
        student.academicDetails.admissionYear,
        student.academicDetails.isDSE,
        student.academicDetails.yearBacklog
      )
    );
    return Array.from(new Set(years)).sort();
  }, [students]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((filterArray) => filterArray.length > 0);
  }, [filters]);

  if (loading) return <Loader />;

  return (
    <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 8 }}>
      <Container maxW="container.xl">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Card
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            mb={6}
          >
            <CardHeader>
              <Flex
                justify="space-between"
                align="center"
                direction={{ base: "column", md: "row" }}
                gap={4}
              >
                <VStack align={{ base: "center", md: "start" }} spacing={2}>
                  <HStack spacing={3}>
                    <Icon as={Users} color="blue.500" boxSize={8} />
                    <Heading size="xl" fontWeight="800">
                      Student Management
                    </Heading>
                  </HStack>
                  <Text
                    color="gray.600"
                    fontSize="lg"
                    textAlign={{ base: "center", md: "left" }}
                  >
                    Manage and monitor all student information
                  </Text>
                </VStack>

                <HStack spacing={3} flexWrap="wrap">
                  <Tooltip label="Refresh students">
                    <IconButton
                      aria-label="Refresh"
                      icon={
                        isRefreshing ? (
                          <Spinner size="sm" />
                        ) : (
                          <RefreshCw size={18} />
                        )
                      }
                      variant="outline"
                      onClick={() => fetchStudents(true)}
                      isDisabled={isRefreshing}
                      borderRadius="lg"
                    />
                  </Tooltip>

                  <Button
                    leftIcon={<UserPlus size={18} />}
                    colorScheme="blue"
                    onClick={() => navigate("/admin/students/add")}
                    borderRadius="lg"
                  >
                    Add Student
                  </Button>
                </HStack>
              </Flex>
            </CardHeader>
          </Card>

          {/* Statistics */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
            <MotionCard
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <CardBody p={4}>
                <Stat>
                  <HStack justify="space-between" mb={2}>
                    <StatLabel fontSize="sm">Total Students</StatLabel>
                    <Icon as={Users} color="blue.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="700">
                    {studentStats.total}
                  </StatNumber>
                  <StatHelpText mb={0}>Registered</StatHelpText>
                </Stat>
              </CardBody>
            </MotionCard>

            <MotionCard
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <CardBody p={4}>
                <Stat>
                  <HStack justify="space-between" mb={2}>
                    <StatLabel fontSize="sm">Active Filters</StatLabel>
                    <Icon as={Filter} color="purple.500" boxSize={4} />
                  </HStack>
                  <StatNumber
                    fontSize="2xl"
                    fontWeight="700"
                    color="purple.500"
                  >
                    {Object.values(filters).flat().length}
                  </StatNumber>
                  <StatHelpText mb={0}>Applied</StatHelpText>
                </Stat>
              </CardBody>
            </MotionCard>

            <MotionCard
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <CardBody p={4}>
                <Stat>
                  <HStack justify="space-between" mb={2}>
                    <StatLabel fontSize="sm">Filtered Results</StatLabel>
                    <Icon as={Search} color="green.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="700" color="green.500">
                    {filteredStudents.length}
                  </StatNumber>
                  <StatHelpText mb={0}>Students</StatHelpText>
                </Stat>
              </CardBody>
            </MotionCard>

            <MotionCard
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <CardBody p={4}>
                <Stat>
                  <HStack justify="space-between" mb={2}>
                    <StatLabel fontSize="sm">Selected</StatLabel>
                    <Icon as={CheckSquare} color="red.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="700" color="red.500">
                    {selectedStudents.length}
                  </StatNumber>
                  <StatHelpText mb={0}>For deletion</StatHelpText>
                </Stat>
              </CardBody>
            </MotionCard>
          </SimpleGrid>

          {/* Controls */}
          <Card
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            mb={6}
          >
            <CardBody p={4}>
              <VStack spacing={4}>
                <Flex
                  w="full"
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={4}
                >
                  <InputGroup maxW="400px" flex={1}>
                    <InputLeftElement pointerEvents="none">
                      <Search size={18} />
                    </InputLeftElement>
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      borderRadius="lg"
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px blue.500",
                      }}
                    />
                  </InputGroup>

                  <HStack spacing={3} flexWrap="wrap">
                    <Button
                      leftIcon={<Trash2 size={16} />}
                      variant="outline"
                      colorScheme={isBulkDelete ? "red" : "gray"}
                      onClick={toggleBulkDelete}
                      borderRadius="lg"
                    >
                      {isBulkDelete ? "Cancel Bulk" : "Bulk Delete"}
                    </Button>

                    {isBulkDelete && (
                      <Button
                        leftIcon={
                          selectedStudents.length ===
                          paginatedStudents.length ? (
                            <Square size={16} />
                          ) : (
                            <CheckSquare size={16} />
                          )
                        }
                        variant="outline"
                        onClick={toggleSelectAll}
                        borderRadius="lg"
                        size="sm"
                      >
                        {selectedStudents.length === paginatedStudents.length
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    )}

                    {isBulkDelete && selectedStudents.length > 0 && (
                      <Button
                        colorScheme="red"
                        onClick={handleBulkDelete}
                        leftIcon={<Trash2 size={16} />}
                        borderRadius="lg"
                      >
                        Delete ({selectedStudents.length})
                      </Button>
                    )}

                    <Button
                      leftIcon={<Filter size={16} />}
                      variant="outline"
                      onClick={onFilterOpen}
                      borderRadius="lg"
                      rightIcon={
                        hasActiveFilters ? (
                          <Badge colorScheme="blue" borderRadius="full" ml={1}>
                            {Object.values(filters).flat().length}
                          </Badge>
                        ) : undefined
                      }
                    >
                      Filters
                    </Button>

                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        borderRadius="lg"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </HStack>
                </Flex>

                {/* Pagination */}
                <Flex justify="center" align="center" w="full" gap={4}>
                  <Button
                    onClick={prevPage}
                    isDisabled={currentPage === 1}
                    size="sm"
                    borderRadius="lg"
                  >
                    Previous
                  </Button>
                  <Text fontSize="sm" color="gray.600" minW="fit-content">
                    Page {currentPage} of {totalPages || 1} •{" "}
                    {filteredStudents.length} total
                  </Text>
                  <Button
                    onClick={nextPage}
                    isDisabled={currentPage === totalPages || totalPages === 0}
                    size="sm"
                    borderRadius="lg"
                  >
                    Next
                  </Button>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Students List */}
          {filteredStudents.length === 0 ? (
            <Center minH="300px">
              <VStack spacing={4}>
                <Icon as={Users} boxSize={16} color="gray.400" />
                <VStack spacing={2}>
                  <Heading size="md" color="gray.500">
                    {students.length === 0
                      ? "No Students Found"
                      : "No Matching Students"}
                  </Heading>
                  <Text color="gray.500" textAlign="center">
                    {students.length === 0
                      ? "Start by adding your first student to the system."
                      : "Try adjusting your search terms or filters."}
                  </Text>
                </VStack>
                {students.length === 0 ? (
                  <Button
                    leftIcon={<UserPlus size={16} />}
                    colorScheme="blue"
                    onClick={() => navigate("/admin/students/add")}
                  >
                    Add First Student
                  </Button>
                ) : (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </VStack>
            </Center>
          ) : (
            <AnimatePresence>
              {isMobile ? (
                <SimpleGrid columns={1} spacing={4}>
                  {paginatedStudents.map((student, index) => (
                    <MotionBox
                      key={student.mid}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      bg={cardBg}
                      borderRadius="xl"
                      p={4}
                      boxShadow="sm"
                      border="1px"
                      borderColor={borderColor}
                    >
                      <Flex justify="space-between" align="start">
                        {isBulkDelete && (
                          <Checkbox
                            isChecked={selectedStudents.includes(student._id)}
                            onChange={() => handleStudentSelect(student._id)}
                            mt={1}
                            mr={3}
                            colorScheme="blue"
                          />
                        )}
                        <Box flex={1}>
                          <Flex align="center" mb={3}>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="700" fontSize="lg">
                                {`${student.fname} ${student.lname}`}
                              </Text>
                              <Badge colorScheme="blue" borderRadius="md">
                                {student.mid}
                              </Badge>
                            </VStack>
                          </Flex>
                          <Flex wrap="wrap" gap={2} mb={3}>
                            <Badge
                              colorScheme="green"
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              Year{" "}
                              {getAcademicYear(
                                student.academicDetails.admissionYear,
                                student.academicDetails.isDSE,
                                student.academicDetails.yearBacklog
                              )}
                            </Badge>
                            <Badge
                              colorScheme="purple"
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {student.house?.name || "No House"}
                            </Badge>
                            <Badge
                              colorScheme="orange"
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {student.gender === "M" ? "Male" : "Female"}
                            </Badge>
                          </Flex>
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {student.social.email}
                          </Text>
                        </Box>
                        <HStack spacing={2}>
                          <Tooltip label="Edit student">
                            <IconButton
                              aria-label="Edit"
                              icon={<Edit2 size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => openEdit(student.mid)}
                              borderRadius="lg"
                            />
                          </Tooltip>
                          <Tooltip label="Delete student">
                            <IconButton
                              aria-label="Delete"
                              icon={<Trash2 size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleSingleDelete(student._id)}
                              borderRadius="lg"
                            />
                          </Tooltip>
                        </HStack>
                      </Flex>
                    </MotionBox>
                  ))}
                </SimpleGrid>
              ) : (
                <Card
                  bg={cardBg}
                  borderRadius="xl"
                  border="1px"
                  borderColor={borderColor}
                  overflow="hidden"
                >
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead bg={useColorModeValue("gray.50", "gray.700")}>
                        <Tr>
                          {isBulkDelete && (
                            <Th borderColor={borderColor} width="5%">
                              <Checkbox
                                isChecked={
                                  selectedStudents.length ===
                                    paginatedStudents.length &&
                                  paginatedStudents.length > 0
                                }
                                isIndeterminate={
                                  selectedStudents.length > 0 &&
                                  selectedStudents.length <
                                    paginatedStudents.length
                                }
                                onChange={toggleSelectAll}
                                colorScheme="blue"
                              />
                            </Th>
                          )}
                          <Th
                            borderColor={borderColor}
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            Moodle ID
                          </Th>
                          <Th
                            borderColor={borderColor}
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            Name
                          </Th>
                          <Th
                            borderColor={borderColor}
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            Year
                          </Th>
                          <Th
                            borderColor={borderColor}
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            Email
                          </Th>
                          <Th
                            borderColor={borderColor}
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            House
                          </Th>
                          <Th
                            borderColor={borderColor}
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            Gender
                          </Th>
                          <Th
                            borderColor={borderColor}
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                            textAlign="center"
                          >
                            Actions
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <AnimatePresence>
                          {paginatedStudents.map((student, index) => (
                            <motion.tr
                              key={student.mid}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.02,
                              }}
                            >
                              {isBulkDelete && (
                                <Td borderColor={borderColor}>
                                  <Checkbox
                                    isChecked={selectedStudents.includes(
                                      student._id
                                    )}
                                    onChange={() =>
                                      handleStudentSelect(student._id)
                                    }
                                    colorScheme="blue"
                                  />
                                </Td>
                              )}
                              <Td borderColor={borderColor}>
                                <Badge colorScheme="blue" borderRadius="md">
                                  {student.mid}
                                </Badge>
                              </Td>
                              <Td borderColor={borderColor} fontWeight="600">
                                {`${student.fname} ${student.lname}`}
                              </Td>
                              <Td borderColor={borderColor}>
                                <Badge colorScheme="green" borderRadius="md">
                                  Year{" "}
                                  {getAcademicYear(
                                    student.academicDetails.admissionYear,
                                    student.academicDetails.isDSE,
                                    student.academicDetails.yearBacklog
                                  )}
                                </Badge>
                              </Td>
                              <Td borderColor={borderColor} color="gray.600">
                                {student.social.email}
                              </Td>
                              <Td borderColor={borderColor}>
                                <Badge colorScheme="purple" borderRadius="md">
                                  {student.house?.name || "No House"}
                                </Badge>
                              </Td>
                              <Td borderColor={borderColor}>
                                <Badge
                                  colorScheme={
                                    student.gender === "M" ? "blue" : "pink"
                                  }
                                  borderRadius="md"
                                >
                                  {student.gender === "M" ? "Male" : "Female"}
                                </Badge>
                              </Td>
                              <Td borderColor={borderColor} textAlign="center">
                                <HStack spacing={2} justify="center">
                                  <Tooltip label="Edit student">
                                    <IconButton
                                      aria-label="Edit student"
                                      icon={<Edit2 size={16} />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="blue"
                                      onClick={() => openEdit(student.mid)}
                                      borderRadius="lg"
                                    />
                                  </Tooltip>
                                  {!isBulkDelete && (
                                    <Tooltip label="Delete student">
                                      <IconButton
                                        aria-label="Delete student"
                                        icon={<Trash2 size={16} />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={() =>
                                          handleSingleDelete(student._id)
                                        }
                                        borderRadius="lg"
                                      />
                                    </Tooltip>
                                  )}
                                </HStack>
                              </Td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </Tbody>
                    </Table>
                  </Box>
                </Card>
              )}
            </AnimatePresence>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            isOpen={isDeleteAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={onDeleteAlertClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent borderRadius="xl">
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Confirmation
                </AlertDialogHeader>
                <AlertDialogBody>
                  {studentToDelete
                    ? "Are you sure you want to delete this student? This action cannot be undone."
                    : `Are you sure you want to delete ${selectedStudents.length} students? This action cannot be undone.`}
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button
                    ref={cancelRef}
                    onClick={onDeleteAlertClose}
                    isDisabled={isDeleting}
                    borderRadius="lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={confirmDelete}
                    ml={3}
                    isLoading={isDeleting}
                    loadingText="Deleting"
                    borderRadius="lg"
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          {/* Edit Student Modal */}
          <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
            <ModalOverlay />
            <ModalContent borderRadius="xl">
              <ModalHeader borderBottom="1px" borderColor={borderColor}>
                Update Student Information
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody py={6}>
                <VStack spacing={4}>
                  <HStack spacing={4} w="full">
                    <FormControl isRequired>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        placeholder="First Name"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                        borderRadius="lg"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        placeholder="Last Name"
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                        borderRadius="lg"
                      />
                    </FormControl>
                  </HStack>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      placeholder="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      borderRadius="lg"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup
                      value={gender}
                      onChange={(val) => setGender(val as Gender)}
                    >
                      <Stack direction="row" spacing={6}>
                        <Radio value="M" colorScheme="blue">
                          Male
                        </Radio>
                        <Radio value="F" colorScheme="pink">
                          Female
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter borderTop="1px" borderColor={borderColor}>
                <Button
                  variant="outline"
                  mr={3}
                  onClick={onEditClose}
                  borderRadius="lg"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={updateStudent}
                  isLoading={isUpdating}
                  loadingText="Updating"
                  borderRadius="lg"
                >
                  Update Student
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Filter Modal */}
          <Modal isOpen={isFilterOpen} onClose={onFilterClose} size="xl">
            <ModalOverlay />
            <ModalContent borderRadius="xl">
              <ModalHeader borderBottom="1px" borderColor={borderColor}>
                Filter Students
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody py={6}>
                <VStack spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="600" mb={3}>
                      Gender
                    </FormLabel>
                    <CheckboxGroup
                      value={filters.gender}
                      onChange={(values) =>
                        setFilters({ ...filters, gender: values as string[] })
                      }
                    >
                      <Stack direction="row" spacing={6}>
                        <Checkbox value="M" colorScheme="blue">
                          Male
                        </Checkbox>
                        <Checkbox value="F" colorScheme="pink">
                          Female
                        </Checkbox>
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" mb={3}>
                      Academic Year
                    </FormLabel>
                    <CheckboxGroup
                      value={filters.years}
                      onChange={(values) =>
                        setFilters({
                          ...filters,
                          years: values as string[],
                        })
                      }
                    >
                      <Stack direction="row" wrap="wrap" spacing={4}>
                        {uniqueYears.map((year) => (
                          <Checkbox key={year} value={year} colorScheme="blue">
                            Year {year}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" mb={3}>
                      Houses
                    </FormLabel>
                    <CheckboxGroup
                      value={filters.houses}
                      onChange={(values) =>
                        setFilters({ ...filters, houses: values as string[] })
                      }
                    >
                      <Stack direction="row" wrap="wrap" spacing={4}>
                        {uniqueHouses.map(
                          (house) =>
                            house && (
                              <Checkbox
                                key={house._id}
                                value={house._id}
                                colorScheme="blue"
                              >
                                {house.name}
                              </Checkbox>
                            )
                        )}
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter borderTop="1px" borderColor={borderColor}>
                <Button
                  variant="outline"
                  mr={3}
                  onClick={clearFilters}
                  borderRadius="lg"
                >
                  Clear All
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={onFilterClose}
                  borderRadius="lg"
                >
                  Apply Filters
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Students;
