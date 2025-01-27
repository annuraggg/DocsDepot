import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useDisclosure,
  useToast,
  VStack,
  FormControl,
  FormLabel,
  Stack,
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useBreakpointValue,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Filter, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import useAxios from "@/config/axios";
import Loader from "../../../components/Loader";
import FacultyTable from "./FacultyTable";
import EditModal from "./EditModal";
import PermissionsModal from "./PermissionsModal";
import { User, Gender } from "@shared-types/User";

const MotionBox = motion(Box);

interface FilterState {
  gender: string[];
  department: string[];
  permissions: string[];
}

const Faculty = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const axios = useAxios();
  const cancelRef = React.useRef(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<User[]>([]);
  const [houses, setHouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    department: [],
    permissions: [],
  });

  const [state, setState] = useState({
    _id: "",
    delItem: "",
    mid: "",
    fname: "",
    lname: "",
    email: "",
    gender: "",
    facOID: "",
    perms: ["UFC"],
    houses: [],
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [update, setUpdate] = useState(false);

  const paginatedFaculty = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFaculty.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFaculty, currentPage]);

  const totalPages = Math.ceil(filteredFaculty.length / ITEMS_PER_PAGE);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([]);

  const toggleBulkDelete = () => {
    setIsBulkDelete(!isBulkDelete);
    setSelectedFaculty([]);
  };

  const handleFacultySelect = (facultyId: string) => {
    setSelectedFaculty((prev) =>
      prev.includes(facultyId)
        ? prev.filter((id) => id !== facultyId)
        : [...prev, facultyId]
    );
  };

  const confirmBulkDelete = async () => {
    const previousFaculty = [...faculty];
    const previousFilteredFaculty = [...filteredFaculty];

    const remainingFaculty = faculty.filter(f => !selectedFaculty.includes(f._id));
    const remainingFilteredFaculty = filteredFaculty.filter(f => !selectedFaculty.includes(f._id));

    setFaculty(remainingFaculty);
    setFilteredFaculty(remainingFilteredFaculty);

    try {
      await axios.delete("/user/bulk", { data: { ids: selectedFaculty } });

      toast({
        title: "Success",
        description: "Faculty deleted successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setIsBulkDelete(false);
      setSelectedFaculty([]);
      onDeleteAlertClose();
    } catch (err: any) {
      setFaculty(previousFaculty);
      setFilteredFaculty(previousFilteredFaculty);

      const errorMessage = err.response?.data?.message || "Error deleting faculty";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteAlertOpen,
    onOpen: onDeleteAlertOpen,
    onClose: onDeleteAlertClose,
  } = useDisclosure();

  const {
    isOpen: isPermsOpen,
    onOpen: onPermsOpen,
    onClose: onPermsClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose,
  } = useDisclosure();

  useEffect(() => {
    setLoading(true);
    axios
      .get("/user/faculty")
      .then((res) => {
        setLoading(false);
        setFaculty(res.data.data.faculty);
        setHouses(res.data.data.houses);
        setFilteredFaculty(res.data.data.faculty);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        const errorMessage =
          err.response?.data?.message || "Error fetching faculty";
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  }, [update]);

  useEffect(() => {
    const filtered = faculty.filter((fac) => {
      const matchesSearch = [fac.fname, fac.lname, fac.social.email].some(
        (value) => value.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesGender =
        filters.gender.length === 0 || filters.gender.includes(fac.gender);
      const matchesDepartment =
        filters.department.length === 0 ||
        filters.department.includes(fac.academicDetails.branch);
      const matchesPermissions =
        filters.permissions.length === 0 ||
        filters.permissions.some((perm) => fac.permissions.includes(perm));

      return (
        matchesSearch &&
        matchesGender &&
        matchesDepartment &&
        matchesPermissions
      );
    });

    setFilteredFaculty(filtered);
  }, [searchQuery, faculty, filters]);

  const deleteCustomer = (id: string) => {
    setState((prev) => ({ ...prev, delItem: id }));
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    const previousFaculty = [...faculty];
    const previousFilteredFaculty = [...filteredFaculty];

    const remainingFaculty = faculty.filter(f => f._id !== state.delItem);
    const remainingFilteredFaculty = filteredFaculty.filter(f => f._id !== state.delItem);

    setFaculty(remainingFaculty);
    setFilteredFaculty(remainingFilteredFaculty);
    setLoading(false);
    onDeleteClose();
    onDeleteAlertClose();

    try {
      await axios.delete(`/user/${state.delItem}`);

      toast({
        title: "Success",
        description: "Faculty deleted successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setState(prev => ({ ...prev, searchQuery: "" }));
    } catch (err: any) {
      setFaculty(previousFaculty);
      setFilteredFaculty(previousFilteredFaculty);

      console.error(err);
      const errorMessage = err.response?.data?.message || "Error deleting faculty";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const openEdit = (id: string) => {
    onEditOpen();
    const faculty: User | undefined = filteredFaculty.find(
      (faculty: User) => faculty.mid === id
    );
    if (!faculty) return;

    setState((prev) => ({
      ...prev,
      _id: faculty._id,
      mid: faculty.mid,
      fname: faculty.fname,
      lname: faculty.lname,
      email: faculty.social.email,
      gender: faculty.gender,
      facOID: faculty._id,
      perms: faculty.permissions,
    }));
  };

  const updateFaculty = async () => {
    function checkElements(arr: string | string[]) {
      const elementsToCheck = ["H1", "H2", "H3", "H4"];
      let count = 0;

      for (const element of elementsToCheck) {
        if (arr.includes(element)) {
          count++;
          if (count > 1) {
            return false;
          }
        }
      }
      return true;
    }

    if (!checkElements(state.perms)) {
      toast({
        title: "Error",
        description: "Please select only one house coordinator",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const previousFaculty = [...faculty];
    const previousFilteredFaculty = [...filteredFaculty];

    const updatedFacultyMember: User = {
      _id: state.facOID,
      mid: state.mid,
      fname: state.fname,
      lname: state.lname,
      social: { email: state.email, github: "", linkedin: "" },
      gender: state.gender as Gender,
      permissions: state.perms,
      password: "",
      profilePicture: "",
      role: "F",
      house: "",
      academicDetails: { branch: "", admissionYear: 0 },
      settings: { colorMode: "light", certificateLayout: "classic" },
      onboarding: { firstTime: false, approved: false, defaultPW: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedFaculty = faculty.map(f =>
      f._id === state.facOID ? { ...f, ...updatedFacultyMember } : f
    );
    const updatedFilteredFaculty = filteredFaculty.map(f =>
      f._id === state.facOID ? { ...f, ...updatedFacultyMember } : f
    );

    setFaculty(updatedFaculty);
    setFilteredFaculty(updatedFilteredFaculty);
    onEditClose();

    try {
      await axios.put(`/user/${state.facOID}`, {
        mid: state.mid,
        fname: state.fname,
        lname: state.lname,
        email: state.email,
        gender: state.gender,
        permissions: state.perms,
      });

      toast({
        title: "Success",
        description: "Faculty updated successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setState(prev => ({ ...prev, searchQuery: "" }));
    } catch (err: any) {
      setFaculty(previousFaculty);
      setFilteredFaculty(previousFilteredFaculty);

      console.error(err);
      const errorMessage = err.response?.data?.message || "Error updating faculty";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };
  const setFacultyData = (data: any) => {
    setState((prev) => ({
      ...prev,
      ...data,
    }));
  };

  if (loading) return <Loader />;

  const uniqueDepartments = Array.from(
    new Set(faculty.map((fac) => fac.academicDetails.branch))
  );

  const permissionOptions = [
    { value: "UFC", label: "Faculty" },
    { value: "H1", label: "House 1 Coordinator" },
    { value: "H2", label: "House 2 Coordinator" },
    { value: "H3", label: "House 3 Coordinator" },
    { value: "H4", label: "House 4 Coordinator" },
  ];

  return (
    <Container maxW="container.xl" py={8}>
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
              Faculty Management
            </Heading>
            <Text color="gray.500">
              Manage and monitor all faculty information
            </Text>
          </Box>
          <HStack spacing={4} flexWrap="wrap" justify="center">
            <Button
              leftIcon={<Trash2 />}
              variant="outline"
              colorScheme={isBulkDelete ? "red" : "gray"}
              onClick={toggleBulkDelete}
            >
              {isBulkDelete ? "Cancel" : "Bulk Delete"}
            </Button>
            {isBulkDelete && selectedFaculty.length > 0 && (
              <Button colorScheme="red" onClick={onDeleteAlertOpen}>
                Delete Selected ({selectedFaculty.length})
              </Button>
            )}
            <Button
              leftIcon={<Filter />}
              variant="outline"
              onClick={onFilterOpen}
              size="sm"
            >
              Filters
            </Button>
            <Button
              leftIcon={<Plus />}
              colorScheme="blue"
              onClick={() => navigate("/admin/faculty/add")}
              size="sm"
            >
              Add Faculty
            </Button>
          </HStack>
        </Flex>
        <Flex justify="center" align="center" mt={4} mb={4}>
          <Button onClick={prevPage} isDisabled={currentPage === 1} mr={2}>
            Previous
          </Button>
          <Text mx={4}>
            Page {currentPage} of {totalPages}
          </Text>
          <Button onClick={nextPage} isDisabled={currentPage === totalPages}>
            Next
          </Button>
        </Flex>

        <InputGroup size="md" mb={6}>
          <InputLeftElement pointerEvents="none">
            <Search size={18} />
          </InputLeftElement>
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="full"
            bg="white"
            fontSize="sm"
          />
        </InputGroup>

        <FacultyTable
          filteredFaculty={paginatedFaculty}
          openEdit={openEdit}
          deleteCustomer={deleteCustomer}
          isMobile={isMobile}
          isBulkDelete={isBulkDelete}
          selectedFaculty={selectedFaculty}
          onFacultySelect={handleFacultySelect}
        />

        <Modal isOpen={isFilterOpen} onClose={onFilterClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Filter Faculty</ModalHeader>
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
                  <FormLabel fontWeight="medium">Department</FormLabel>
                  <CheckboxGroup
                    value={filters.department}
                    onChange={(values) =>
                      setFilters({ ...filters, department: values as string[] })
                    }
                  >
                    <Stack direction="row" spacing={4} wrap="wrap">
                      {uniqueDepartments.map((dept) => (
                        <Checkbox key={dept} value={dept}>
                          {dept}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Role</FormLabel>
                  <CheckboxGroup
                    value={filters.permissions}
                    onChange={(values) =>
                      setFilters({
                        ...filters,
                        permissions: values as string[],
                      })
                    }
                  >
                    <Stack direction="row" spacing={4} wrap="wrap">
                      {permissionOptions.map((option) => (
                        <Checkbox key={option.value} value={option.value}>
                          {option.label}
                        </Checkbox>
                      ))}
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
                    department: [],
                    permissions: [],
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

        <EditModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          onPermsOpen={onPermsOpen}
          facultyData={{
            fname: state.fname,
            lname: state.lname,
            email: state.email,
            gender: state.gender,
          }}
          setFacultyData={setFacultyData}
          updateFaculty={updateFaculty}
        />

        <PermissionsModal
          userid={state._id}
          isOpen={isPermsOpen}
          onClose={onPermsClose}
          onEditOpen={onEditOpen}
          houses={houses}
          perms={state.perms}
          setPerms={(newPerms) =>
            setState((prev) => ({ ...prev, perms: newPerms }))
          }
        />

        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
          isCentered
        >
          <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px)">
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Faculty Member
              </AlertDialogHeader>

              <AlertDialogBody>
                This action cannot be undone. Are you sure you want to proceed?
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
                {state.delItem
                  ? "Are you sure you want to delete this faculty? This action cannot be undone."
                  : `Are you sure you want to delete ${selectedFaculty.length} faculty members? This action cannot be undone.`}
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={state.delItem ? confirmDelete : confirmBulkDelete}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </MotionBox>
    </Container>
  );
};

export default Faculty;