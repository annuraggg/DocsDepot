import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Edit2, Filter, Trash2 } from "lucide-react";
import Loader from "../../../components/Loader";
import { User, Gender } from "@shared-types/User";
import useAxios from "@/config/axios";
import { House } from "@shared-types/House";
import { useNavigate } from "react-router";

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
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<ExtendedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<ExtendedUser[]>([]);
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

  const toast = useToast();
  const axios = useAxios();

  useEffect(() => {
    axios
      .get("/user/students")
      .then((res) => {
        setLoading(false);
        setStudents(res.data.data);
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message || "Error fetching students";
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

  // Extract unique years from students data
  const uniqueYears = Array.from(
    new Set(
      students.map((student) => student.academicDetails.admissionYear?.toString())
    )
  ).filter((year) => year); // Filter out undefined or null values

  useEffect(() => {
    const filtered = students.filter((student) => {
      const matchesSearch = [
        student.fname,
        student.lname,
        student.social.email,
      ].some((value) =>
        value.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesGender =
        filters.gender.length === 0 || filters.gender.includes(student.gender);
      const matchesYear =
        filters.years.length === 0 ||
        filters.years.includes(
          student.academicDetails.admissionYear?.toString() || ""
        );
      const matchesHouse =
        filters.houses.length === 0 ||
        filters.houses.includes(student.house?._id);

      return matchesSearch && matchesGender && matchesYear && matchesHouse;
    });

    setFilteredStudents(filtered);
  }, [searchQuery, students, filters]);

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
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
    onDeleteAlertClose();
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
    onEditClose();
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
          duration: 5000,
          isClosable: true,
        });
        setUpdate(!update);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Error updating student",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const uniqueHouses = Array.from(
    new Set(students.map((student) => student.house?._id))
  ).map((id) => students.find((student) => student.house?._id === id)?.house);

  if (loading) return <Loader />;

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading size="lg" mb={2}>
              Student Management
            </Heading>
            <Text color="gray.500">
              Manage and monitor all student information
            </Text>
          </Box>
          <HStack spacing={4}>
            <Button
              leftIcon={<Trash2 />}
              variant="outline"
              colorScheme={isBulkDelete ? "red" : "gray"}
              onClick={toggleBulkDelete}
            >
              {isBulkDelete ? "Cancel" : "Bulk Delete"}
            </Button>
            {isBulkDelete && selectedStudents.length > 0 && (
              <Button colorScheme="red" onClick={onDeleteAlertOpen}>
                Delete Selected ({selectedStudents.length})
              </Button>
            )}
            <Button
              leftIcon={<Filter />}
              variant="outline"
              onClick={onFilterOpen}
              size="md"
            >
              Filters
            </Button>
            <Button
              leftIcon={<UserPlus />}
              colorScheme="blue"
              onClick={() => navigate("/faculty/students/add")}
              size="md"
            >
              Add Student
            </Button>
          </HStack>
        </Flex>

        <InputGroup size="lg" mb={4}>
          <InputLeftElement pointerEvents="none">
            <Search />
          </InputLeftElement>
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <AnimatePresence>
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr bg="gray.50" borderBottom="1px" borderColor="gray.200">
                    {isBulkDelete && (
                      <Th
                        py={4}
                        px={6}
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.900"
                        textTransform="initial"
                        width="5%"
                      />
                    )}
                    <Th
                      py={4}
                      px={6}
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.900"
                      textTransform="initial"
                      width="15%"
                    >
                      MOODLE ID
                    </Th>
                    <Th
                      py={4}
                      px={6}
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.900"
                      textTransform="initial"
                      width="20%"
                    >
                      NAME
                    </Th>
                    <Th
                      py={4}
                      px={6}
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.900"
                      textTransform="initial"
                      width="15%"
                    >
                      YEAR
                    </Th>
                    <Th
                      py={4}
                      px={6}
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.900"
                      textTransform="initial"
                      width="25%"
                    >
                      EMAIL
                    </Th>
                    <Th
                      py={4}
                      px={6}
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.900"
                      textTransform="initial"
                      width="15%"
                    >
                      HOUSE
                    </Th>
                    <Th
                      py={4}
                      px={6}
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.900"
                      textTransform="initial"
                      width="10%"
                    >
                      ACTIONS
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredStudents.map((student) => (
                    <Tr
                      key={student.mid}
                      _hover={{ bg: "gray.50" }}
                      transition="background 0.15s"
                      borderBottom="1px"
                      borderColor="gray.200"
                      opacity={isBulkDelete ? 0.7 : 1}
                    >
                      {isBulkDelete && (
                        <Td py={4} px={6}>
                          <Checkbox
                            isChecked={selectedStudents.includes(student._id)}
                            onChange={() => handleStudentSelect(student._id)}
                          />
                        </Td>
                      )}
                      <Td py={4} px={6}>
                        <HStack spacing={2}>
                          <Badge
                            px={2.5}
                            py={0.5}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="medium"
                            colorScheme="blue"
                          >
                            {student.mid}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td py={4} px={6}>
                        <HStack spacing={2}>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.900"
                          >
                            {`${student.fname} ${student.lname}`}
                          </Text>
                        </HStack>
                      </Td>
                      <Td py={4} px={6}>
                        <Badge
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="medium"
                          colorScheme="green"
                        >
                          Year {student.academicDetails.admissionYear}
                        </Badge>
                      </Td>
                      <Td py={4} px={6}>
                        <Text fontSize="sm" color="gray.600">
                          {student.social.email}
                        </Text>
                      </Td>
                      <Td py={4} px={6}>
                        <Badge
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="medium"
                          colorScheme="gray"
                        >
                          {student.house?.name || "N/A"}
                        </Badge>
                      </Td>
                      <Td py={4} px={6}>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit student"
                            icon={<Edit2 size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => openEdit(student.mid)}
                            _hover={{
                              bg: "blue.50",
                              transform: "translateX(2px)",
                            }}
                            transition="all 0.2s"
                          />
                          {!isBulkDelete && (
                            <IconButton
                              aria-label="Delete student"
                              icon={<Trash2 size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleSingleDelete(student._id)}
                              _hover={{
                                bg: "red.50",
                                transform: "translateX(2px)",
                              }}
                              transition="all 0.2s"
                            />
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </AnimatePresence>
      </MotionBox>
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
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
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
                size="lg"
                placeholder="First Name"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
              <Input
                size="lg"
                placeholder="Last Name"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
              />
              <Input
                size="lg"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <RadioGroup
                value={gender}
                onChange={(val) => setGender(val as Gender)}
              >
                <Stack direction="row" spacing={8}>
                  <Radio value="M" size="lg">
                    Male
                  </Radio>
                  <Radio value="F" size="lg">
                    Female
                  </Radio>
                </Stack>
              </RadioGroup>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={updateStudent} size="lg">
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
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel fontWeight="medium">Gender</FormLabel>
                <CheckboxGroup
                  value={filters.gender}
                  onChange={(values) =>
                    setFilters({ ...filters, gender: values as string[] })
                  }
                >
                  <Stack direction="row" spacing={4}>
                    <Checkbox value="M">Male</Checkbox>
                    <Checkbox value="F">Female</Checkbox>
                  </Stack>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Academic Year</FormLabel>
                <CheckboxGroup
                  value={filters.years}
                  onChange={(values) =>
                    setFilters({ ...filters, years: values as string[] })
                  }
                >
                  <Stack direction="row" spacing={4}>
                    {uniqueYears.map((year) => (
                      <Checkbox key={year} value={year}>
                        Year {year}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Houses</FormLabel>
                <CheckboxGroup
                  value={filters.houses}
                  onChange={(values) =>
                    setFilters({ ...filters, houses: values as string[] })
                  }
                >
                  <Stack direction="row" spacing={4} wrap="wrap">
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
    </Container>
  );
};

export default Students;