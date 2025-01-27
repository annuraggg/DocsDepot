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
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Edit2, Filter, Trash2 } from "lucide-react";
import Loader from "../../../components/Loader";
import { User, Gender } from "@shared-types/User";
import useAxios from "@/config/axios";
import { House } from "@shared-types/House";
import { useNavigate } from "react-router";
import getAcademicYear from "@/utils/getAcademicYear";

const ITEMS_PER_PAGE = 10;
const MotionBox = motion(Box);

interface ExtendedUser extends Omit<User, "house"> {
  house: House;
}

interface FilterState {
  gender: string[];
  status: string[];
  houses: string[];
  years: string[];
}

const Students = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [students, setStudents] = useState<ExtendedUser[]>([]);
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

  useEffect(() => {
    setLoading(true);
    axios
      .get("/user/students")
      .then((res) => {
        setStudents(res.data.data);
      })
      .catch((err: unknown) => {
        console.error("Error fetching students:", err);
        const errorMessage = (err instanceof Error && (err as any).response?.data?.message) || "Something went wrong";
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      })
      .finally(() => setLoading(false));
  }, [update]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = [
        student.fname,
        student.lname,
        student.social.email,
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

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (studentToDelete) {
        await axios.delete(`/user/${studentToDelete}`);
      } else {
        await axios.delete("/user/bulk", { data: { ids: selectedStudents } });
      }

      toast({
        title: "Success",
        description: "Student(s) deleted successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setUpdate(!update);
      setIsBulkDelete(false);
      setSelectedStudents([]);
      setStudentToDelete("");
      onDeleteAlertClose();
    } catch (err) {
      console.error("Error deleting student(s):", err);
      const errorMessage = (err instanceof Error && (err as any).response?.data?.message) || "Something went wrong";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
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

  const updateStudent = () => {
    setIsUpdating(true);
    axios
      .put(`/user/${studentId}`, {
        mid: moodleid,
        fname,
        lname,
        email,
        house,
        gender,
      })
      .then(() => {
        toast({
          title: "Success",
          description: "Student Updated Successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        setUpdate(!update);
        onEditClose();
      })
      .catch((err) => {
        console.error("Error updating student:", err);
        const errorMessage = err.response?.data?.message || "Something went wrong";
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      })
      .finally(() => setIsUpdating(false));
  };

  const uniqueHouses = Array.from(
    new Set(students.map((student) => student.house?._id))
  ).map((id) => students.find((student) => student.house?._id === id)?.house);

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

  if (loading) return <Loader />;

  return (
    <Container maxW="container.xl" p={{ base: 4, md: 8 }}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex
          justify="space-between"
          align="center"
          mb={8}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <Box textAlign={{ base: "center", md: "left" }}>
            <Heading size="lg" mb={2}>
              Student Management
            </Heading>
            <Text color="gray.500" fontSize={{ base: "sm", md: "md" }}>
              Manage and monitor all student information
            </Text>
          </Box>
          <HStack spacing={4} flexWrap="wrap" justify="center">
            <Button
              leftIcon={<Trash2 size={18} />}
              variant="outline"
              colorScheme={isBulkDelete ? "red" : "gray"}
              onClick={toggleBulkDelete}
              size="sm"
            >
              {isBulkDelete ? "Cancel" : "Bulk Delete"}
            </Button>
            {isBulkDelete && selectedStudents.length > 0 && (
              <Button
                colorScheme="red"
                onClick={onDeleteAlertOpen}
                size="sm"
                leftIcon={<Trash2 size={18} />}
              >
                Delete ({selectedStudents.length})
              </Button>
            )}
            <Button
              leftIcon={<Filter size={18} />}
              variant="outline"
              onClick={onFilterOpen}
              size="sm"
            >
              Filters
            </Button>
            <Button
              leftIcon={<UserPlus size={18} />}
              colorScheme="blue"
              onClick={() => navigate("/admin/students/add")}
              size="sm"
            >
              Add Student
            </Button>
          </HStack>
        </Flex>

        <InputGroup size="md" mb={6}>
          <InputLeftElement pointerEvents="none">
            <Search size={18} />
          </InputLeftElement>
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="full"
            bg="white"
            fontSize="sm"
          />
        </InputGroup>

        <Flex justify="center" align="center" my={4} gap={2}>
          <Button onClick={prevPage} isDisabled={currentPage === 1} size="sm">
            Previous
          </Button>
          <Text fontSize="sm" mx={2} color="gray.600">
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={nextPage}
            isDisabled={currentPage === totalPages}
            size="sm"
          >
            Next
          </Button>
        </Flex>

        <AnimatePresence>
          {isMobile ? (
            <SimpleGrid columns={1} spacing={4}>
              {paginatedStudents.map((student) => (
                <MotionBox
                  key={student.mid}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  bg="white"
                  borderRadius="lg"
                  p={4}
                  boxShadow="sm"
                  border="1px"
                  borderColor="gray.100"
                >
                  <Flex justify="space-between" align="start">
                    {isBulkDelete && (
                      <Checkbox
                        isChecked={selectedStudents.includes(student._id)}
                        onChange={() => handleStudentSelect(student._id)}
                        mt={1}
                        mr={2}
                      />
                    )}
                    <Box flex={1}>
                      <Flex align="center" mb={2}>
                        <Box>
                          <Text fontWeight="600" fontSize="sm">
                            {`${student.fname} ${student.lname}`}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {student.mid}
                          </Text>
                        </Box>
                      </Flex>
                      <Flex wrap="wrap" gap={2} mb={2}>
                        <Badge
                          colorScheme="green"
                          fontSize="xs"
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          Year:{" "}
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
                      </Flex>
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {student.social.email}
                      </Text>
                    </Box>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit"
                        icon={<Edit2 size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => openEdit(student.mid)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<Trash2 size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleSingleDelete(student._id)}
                      />
                    </HStack>
                  </Flex>
                </MotionBox>
              ))}
            </SimpleGrid>
          ) : (
            <Box
              bg="white"
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor="gray.200"
              overflowX="auto"
            >
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    {isBulkDelete && <Th width="5%"></Th>}
                    <Th width="15%">MOODLE ID</Th>
                    <Th width="20%">NAME</Th>
                    <Th width="15%">YEAR</Th>
                    <Th width="25%">EMAIL</Th>
                    <Th width="15%">HOUSE</Th>
                    <Th width="10%">ACTIONS</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedStudents.map((student) => (
                    <Tr key={student.mid}>
                      {isBulkDelete && (
                        <Td>
                          <Checkbox
                            isChecked={selectedStudents.includes(student._id)}
                            onChange={() => handleStudentSelect(student._id)}
                          />
                        </Td>
                      )}
                      <Td>
                        <Badge colorScheme="blue">{student.mid}</Badge>
                      </Td>
                      <Td fontWeight="medium">{`${student.fname} ${student.lname}`}</Td>
                      <Td>
                        <Badge colorScheme="green">
                          {getAcademicYear(
                            student.academicDetails.admissionYear,
                            student.academicDetails.isDSE,
                            student.academicDetails.yearBacklog
                          )}
                        </Badge>
                      </Td>
                      <Td color="gray.600">{student.social.email}</Td>
                      <Td>
                        <Badge colorScheme="purple">
                          {student.house?.name || "N/A"}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit student"
                            icon={<Edit2 size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => openEdit(student.mid)}
                          />
                          {!isBulkDelete && (
                            <IconButton
                              aria-label="Delete student"
                              icon={<Trash2 size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleSingleDelete(student._id)}
                            />
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </AnimatePresence>

        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteAlertClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Confirmation
              </AlertDialogHeader>
              <AlertDialogBody>
                {studentToDelete
                  ? "Are you sure you want to delete this student? This action cannot be undone."
                  : `Are you sure you want to delete ${selectedStudents.length} students? This action cannot be undone.`}
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={confirmDelete}
                  ml={3}
                  isLoading={isDeleting}
                  loadingText="Deleting"
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Student Information</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Input
                  placeholder="First Name"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                />
                <Input
                  placeholder="Last Name"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                />
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <RadioGroup
                  value={gender}
                  onChange={(val) => setGender(val as Gender)}
                >
                  <Stack direction="row">
                    <Radio value="M">Male</Radio>
                    <Radio value="F">Female</Radio>
                  </Stack>
                </RadioGroup>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                onClick={updateStudent}
                isLoading={isUpdating}
                loadingText="Updating"
              >
                Update Student
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isFilterOpen} onClose={onFilterClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Filter Students</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel>Gender</FormLabel>
                  <CheckboxGroup
                    value={filters.gender}
                    onChange={(values) =>
                      setFilters({ ...filters, gender: values as string[] })
                    }
                  >
                    <Stack direction="row">
                      <Checkbox value="M">Male</Checkbox>
                      <Checkbox value="F">Female</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Academic Year</FormLabel>
                  <CheckboxGroup
                    value={filters.years}
                    onChange={(values) =>
                      setFilters({
                        ...filters,
                        years: values as string[],
                      })
                    }
                  >
                    <Stack direction="row" wrap="wrap">
                      {uniqueYears.map((year) => (
                        <Checkbox key={year} value={year}>
                          {year}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Houses</FormLabel>
                  <CheckboxGroup
                    value={filters.houses}
                    onChange={(values) =>
                      setFilters({ ...filters, houses: values as string[] })
                    }
                  >
                    <Stack direction="row" wrap="wrap">
                      {uniqueHouses.map(
                        (house) =>
                          house && (
                            <Checkbox key={house._id} value={house._id}>
                              {house.name}
                            </Checkbox>
                          )
                      )}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={() =>
                  setFilters({
                    gender: [],
                    status: [],
                    houses: [],
                    years: [],
                  })
                }
              >
                Clear All
              </Button>
              <Button colorScheme="blue" onClick={onFilterClose}>
                Apply Filters
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </MotionBox>
    </Container>
  );
};

export default Students;
