import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Filter, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router";
import useAxios from "@/config/axios";
import Loader from "../../../components/Loader";
import FacultyTable from "./FacultyTable";
import EditModal from "./EditModal";
import PermissionsModal from "./PermissionsModal";
import DeleteAlert from "./DeleteAlert";
import { Gender, User } from "@shared-types/User";

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

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
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
    axios
      .get("/user/faculty")
      .then((res) => {
        setLoading(false);
        setFaculty(res.data.data.faculty);
        setHouses(res.data.data.houses);
        setFilteredFaculty(res.data.data.faculty);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Error fetching faculty",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  }, []);

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

  const alertDelete = () => {
    let fac: User = {} as User;
    faculty.filter((faculty: User) => {
      if (faculty.mid === state.delItem) {
        fac = faculty;
      }
    });

    if (
      fac?.permissions?.includes("H1") ||
      fac?.permissions?.includes("H2") ||
      fac?.permissions?.includes("H3") ||
      fac?.permissions?.includes("H4")
    ) {
      onDeleteOpen();
    } else {
      confirmDelete();
    }
  };

  const confirmDelete = () => {
    axios.delete(`/user/${state.delItem}`).then((res) => {
      if (res.data.success) {
        onDeleteClose();
        setState((prev) => ({ ...prev, searchQuery: "" }));
        toast({
          title: "Success",
          description: "Faculty deleted successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        setFaculty(faculty.filter((faculty) => faculty._id !== state.delItem));
      } else {
        onDeleteClose();
        toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    });
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

  const updateFaculty = () => {
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

    axios
      .put(`/user/${state.facOID}`, {
        mid: state.mid,
        fname: state.fname,
        lname: state.lname,
        email: state.email,
        gender: state.gender,
        permissions: state.perms,
      })
      .then((res) => {
        if (res.data.success) {
          onEditClose();
          setState((prev) => ({ ...prev, searchQuery: "" }));
          toast({
            title: "Success",
            description: "Faculty updated successfully",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
          const index = faculty.findIndex(
            (faculty) => faculty._id === state.facOID
          );
          faculty[index].mid = state.mid;
          faculty[index].fname = state.fname;
          faculty[index].lname = state.lname;
          faculty[index].social.email = state.email;
          faculty[index].gender = state.gender as Gender;
          faculty[index].permissions = state.perms;

          setFaculty(faculty);
        } else {
          onEditClose();
          toast({
            title: "Error",
            description: "Something went wrong",
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        onEditClose();
        toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
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
        <Flex justify="space-between" align="center" mb={8} direction={{ base: "column", md: "row" }} gap={4}>
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
          filteredFaculty={filteredFaculty}
          openEdit={openEdit}
          deleteCustomer={deleteCustomer}
          isMobile={isMobile}
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

        <DeleteAlert
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onConfirm={alertDelete}
          cancelRef={cancelRef}
        />
      </MotionBox>
    </Container>
  );
};

export default Faculty;