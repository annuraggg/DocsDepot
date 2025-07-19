import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
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
  useColorModeValue,
  Card,
  CardBody,
  Icon,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  Tooltip,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  Filter,
  Plus,
  Search,
  Trash2,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  User,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router";
import useAxios from "@/config/axios";
import debounce from "lodash/debounce";
import FacultyTable from "./FacultyTable";
import EditModal from "./EditModal";
import PermissionsModal from "./PermissionsModal";
import { User as UserType, Gender } from "@shared-types/User";

// Enhanced interfaces
interface FilterState {
  gender: string[];
  department: string[];
  permissions: string[];
}

interface FacultyState {
  _id: string;
  delItem: string;
  mid: string;
  fname: string;
  lname: string;
  email: string;
  gender: string;
  facOID: string;
  perms: string[];
  houses: any[];
}

interface FacultyStats {
  total: number;
  coordinators: number;
  departments: number;
  recentlyAdded: number;
}

// Configuration constants
const CONFIG = {
  PAGINATION: {
    ITEMS_PER_PAGE: 10,
    MAX_PAGES_DISPLAY: 5,
  },
  DEBOUNCE: {
    SEARCH_DELAY: 300,
  },
  TOAST: {
    DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
    },
    POSITION: "top-right" as const,
  },
  PERMISSIONS: {
    UFC: { label: "Faculty", color: "blue" },
    H1: { label: "House 1 Coordinator", color: "purple" },
    H2: { label: "House 2 Coordinator", color: "green" },
    H3: { label: "House 3 Coordinator", color: "orange" },
    H4: { label: "House 4 Coordinator", color: "red" },
    MHI: { label: "Manage Events", color: "cyan" },
    SND: { label: "Send Notifications", color: "pink" },
    RSP: { label: "Reset Student Password", color: "yellow" },
    AES: { label: "Add/Edit Student", color: "teal" },
  },
} as const;

// Enhanced utility functions
const calculateFacultyStats = (faculty: UserType[]): FacultyStats => {
  const coordinators = faculty.filter((f) =>
    f.permissions.some((p) => p.startsWith("H"))
  ).length;

  const departments = new Set(
    faculty.map((f) => f.academicDetails.branch).filter(Boolean)
  ).size;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentlyAdded = faculty.filter(
    (f) => new Date(f.createdAt) >= weekAgo
  ).length;

  return {
    total: faculty.length,
    coordinators,
    departments,
    recentlyAdded,
  };
};

const validatePermissions = (permissions: string[]): boolean => {
  const houseCoordinatorPerms = permissions.filter((p) => p.startsWith("H"));
  return houseCoordinatorPerms.length <= 1;
};

// Enhanced components
const MotionBox = motion(Box);

// Loading skeleton component
const FacultyLoadingSkeleton: React.FC = () => {
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <VStack spacing={6} align="stretch">
      {/* Header Skeleton */}
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={2}>
          <Skeleton height="32px" width="250px" />
          <Skeleton height="20px" width="300px" />
        </VStack>
        <HStack spacing={2}>
          <Skeleton height="40px" width="120px" />
          <Skeleton height="40px" width="100px" />
          <Skeleton height="40px" width="120px" />
        </HStack>
      </Flex>

      {/* Stats Skeleton */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} bg={cardBg} borderRadius="xl">
            <CardBody p={4}>
              <VStack spacing={2}>
                <Skeleton height="20px" width="80px" />
                <Skeleton height="24px" width="60px" />
                <Skeleton height="16px" width="100px" />
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Search Skeleton */}
      <Skeleton height="48px" borderRadius="xl" />

      {/* Table Skeleton */}
      <Card bg={cardBg} borderRadius="xl">
        <CardBody p={6}>
          <VStack spacing={4}>
            {Array.from({ length: 5 }).map((_, i) => (
              <HStack key={i} spacing={4} w="full">
                <Skeleton height="20px" width="100px" />
                <Skeleton height="20px" width="150px" flex={1} />
                <Skeleton height="20px" width="200px" />
                <Skeleton height="20px" width="100px" />
                <Skeleton height="32px" width="80px" />
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

// Main Faculty Component
const Faculty: React.FC = () => {
  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [faculty, setFaculty] = useState<UserType[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<UserType[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    department: [],
    permissions: [],
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isBulkDelete, setIsBulkDelete] = useState<boolean>(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [defaultPassword, setDefaultPassword] = useState<string>("");

  const [state, setState] = useState<FacultyState>({
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

  // Hooks
  const toast = useToast();
  const navigate = useNavigate();
  const axios = useAxios();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Disclosure hooks
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

  // Memoized calculations
  const facultyStats = useMemo(() => calculateFacultyStats(faculty), [faculty]);

  const paginatedFaculty = useMemo(() => {
    const startIndex = (currentPage - 1) * CONFIG.PAGINATION.ITEMS_PER_PAGE;
    return filteredFaculty.slice(
      startIndex,
      startIndex + CONFIG.PAGINATION.ITEMS_PER_PAGE
    );
  }, [filteredFaculty, currentPage]);

  const totalPages = Math.ceil(
    filteredFaculty.length / CONFIG.PAGINATION.ITEMS_PER_PAGE
  );

  const uniqueDepartments = useMemo(
    () =>
      Array.from(
        new Set(
          faculty.map((fac) => fac.academicDetails.branch).filter(Boolean)
        )
      ),
    [faculty]
  );

  const permissionOptions = Object.entries(CONFIG.PERMISSIONS).map(
    ([value, config]) => ({
      value,
      label: config.label,
      color: config.color,
    })
  );

  // API functions
  const fetchFaculty = useCallback(
    async (showRefreshToast = false) => {
      try {
        if (showRefreshToast) setIsRefreshing(true);
        else setLoading(true);

        const response = await axios.get("/user/faculty/withPassword");
        const {
          faculty: facultyData,
          houses: housesData,
          defaultPassword: defPass,
        } = response.data.data;

        setFaculty(facultyData);
        setHouses(housesData);
        setFilteredFaculty(facultyData);
        setDefaultPassword(defPass);

        if (showRefreshToast) {
          toast({
            title: "Faculty Data Refreshed",
            description: `Loaded ${facultyData.length} faculty members`,
            status: "success",
            duration: CONFIG.TOAST.DURATION.SUCCESS,
            isClosable: true,
            position: CONFIG.TOAST.POSITION,
          });
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Error fetching faculty";

        toast({
          title: "Error Loading Faculty",
          description: errorMessage,
          status: "error",
          duration: CONFIG.TOAST.DURATION.ERROR,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [axios, toast]
  );

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
      }, CONFIG.DEBOUNCE.SEARCH_DELAY),
    []
  );

  // Filter effect
  useEffect(() => {
    const filtered = faculty.filter((fac) => {
      const matchesSearch = [fac.fname, fac.lname, fac.social.email].some(
        (value) => value?.toLowerCase().includes(searchQuery.toLowerCase())
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
    setCurrentPage(1);
  }, [searchQuery, faculty, filters]);

  // Event handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const deleteCustomer = (id: string) => {
    setState((prev) => ({ ...prev, delItem: id }));
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    const previousFaculty = [...faculty];
    const previousFilteredFaculty = [...filteredFaculty];

    // Optimistic update
    const remainingFaculty = faculty.filter((f) => f._id !== state.delItem);
    const remainingFilteredFaculty = filteredFaculty.filter(
      (f) => f._id !== state.delItem
    );

    setFaculty(remainingFaculty);
    setFilteredFaculty(remainingFilteredFaculty);
    onDeleteClose();

    try {
      await axios.delete(`/user/${state.delItem}`);

      toast({
        title: "Faculty Deleted",
        description: "Faculty member has been successfully removed",
        status: "success",
        duration: CONFIG.TOAST.DURATION.SUCCESS,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    } catch (err: any) {
      // Revert on error
      setFaculty(previousFaculty);
      setFilteredFaculty(previousFilteredFaculty);

      const errorMessage =
        err.response?.data?.message || "Error deleting faculty";
      toast({
        title: "Delete Failed",
        description: errorMessage,
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    }
  };

  const confirmBulkDelete = async () => {
    const previousFaculty = [...faculty];
    const previousFilteredFaculty = [...filteredFaculty];

    // Optimistic update
    const remainingFaculty = faculty.filter(
      (f) => !selectedFaculty.includes(f._id)
    );
    const remainingFilteredFaculty = filteredFaculty.filter(
      (f) => !selectedFaculty.includes(f._id)
    );

    setFaculty(remainingFaculty);
    setFilteredFaculty(remainingFilteredFaculty);
    setIsBulkDelete(false);
    setSelectedFaculty([]);
    onDeleteAlertClose();

    try {
      await axios.delete("/user/bulk", { data: { ids: selectedFaculty } });

      toast({
        title: "Faculty Deleted",
        description: `${selectedFaculty.length} faculty members have been successfully removed`,
        status: "success",
        duration: CONFIG.TOAST.DURATION.SUCCESS,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    } catch (err: any) {
      // Revert on error
      setFaculty(previousFaculty);
      setFilteredFaculty(previousFilteredFaculty);

      const errorMessage =
        err.response?.data?.message || "Error deleting faculty";
      toast({
        title: "Bulk Delete Failed",
        description: errorMessage,
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    }
  };

  const openEdit = (id: string) => {
    const facultyMember = filteredFaculty.find((faculty) => faculty.mid === id);
    if (!facultyMember) return;

    setState((prev) => ({
      ...prev,
      _id: facultyMember._id,
      mid: facultyMember.mid,
      fname: facultyMember.fname,
      lname: facultyMember.lname,
      email: facultyMember.social.email,
      gender: facultyMember.gender,
      facOID: facultyMember._id,
      perms: facultyMember.permissions,
    }));
    onEditOpen();
  };

  const updateFaculty = async () => {
    if (!validatePermissions(state.perms)) {
      toast({
        title: "Invalid Permissions",
        description: "Please select only one house coordinator role",
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
      return;
    }

    const previousFaculty = [...faculty];
    const previousFilteredFaculty = [...filteredFaculty];

    // Optimistic update
    const updatedFacultyMember: UserType = {
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

    const updatedFaculty = faculty.map((f) =>
      f._id === state.facOID ? { ...f, ...updatedFacultyMember } : f
    );
    const updatedFilteredFaculty = filteredFaculty.map((f) =>
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
        title: "Faculty Updated",
        description: "Faculty member has been successfully updated",
        status: "success",
        duration: CONFIG.TOAST.DURATION.SUCCESS,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    } catch (err: any) {
      // Revert on error
      setFaculty(previousFaculty);
      setFilteredFaculty(previousFilteredFaculty);

      const errorMessage =
        err.response?.data?.message || "Error updating faculty";
      toast({
        title: "Update Failed",
        description: errorMessage,
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    }
  };

  const setFacultyData = (data: any) => {
    setState((prev) => ({ ...prev, ...data }));
  };

  const clearFilters = () => {
    setFilters({
      gender: [],
      department: [],
      permissions: [],
    });
  };

  // Effects
  useEffect(() => {
    fetchFaculty();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" p={8}>
        <FacultyLoadingSkeleton />
      </Box>
    );
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
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: "column", lg: "row" }}
            gap={4}
          >
            <VStack align={{ base: "center", lg: "start" }} spacing={2}>
              <HStack spacing={3}>
                <Icon as={Users} color="blue.500" boxSize={8} />
                <Heading size="xl" fontWeight="800">
                  Faculty Management
                </Heading>
              </HStack>
              <Text
                color="gray.600"
                fontSize="lg"
                textAlign={{ base: "center", lg: "left" }}
              >
                Manage and monitor all faculty information
              </Text>
            </VStack>

            <HStack spacing={3} wrap="wrap" justify="center">
              <Tooltip label="Refresh faculty data">
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
                  onClick={() => fetchFaculty(true)}
                  isDisabled={isRefreshing}
                  borderRadius="lg"
                />
              </Tooltip>

              <Button
                leftIcon={<Trash2 size={18} />}
                variant="outline"
                colorScheme={isBulkDelete ? "red" : "gray"}
                onClick={toggleBulkDelete}
                borderRadius="lg"
              >
                {isBulkDelete ? "Cancel" : "Bulk Delete"}
              </Button>

              {isBulkDelete && selectedFaculty.length > 0 && (
                <Button
                  colorScheme="red"
                  onClick={onDeleteAlertOpen}
                  borderRadius="lg"
                  leftIcon={<Trash2 size={16} />}
                >
                  Delete Selected ({selectedFaculty.length})
                </Button>
              )}

              <Button
                leftIcon={<Filter size={18} />}
                variant="outline"
                onClick={onFilterOpen}
                borderRadius="lg"
              >
                Filters
              </Button>

              <Button
                leftIcon={<Plus size={18} />}
                colorScheme="blue"
                onClick={() => navigate("/admin/faculty/add")}
                borderRadius="lg"
              >
                Add Faculty
              </Button>
            </HStack>
          </Flex>

          <Alert status="info" className="mb-5">
            <AlertIcon />
            <p>
              The Default Faculty Password is:{" "}
              <strong>{defaultPassword}</strong>.
            </p>
          </Alert>

          {/* Statistics */}
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
                    <StatLabel fontSize="sm">Total Faculty</StatLabel>
                    <Icon as={Users} color="blue.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="700">
                    {facultyStats.total}
                  </StatNumber>
                  <StatHelpText mb={0}>Active members</StatHelpText>
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
                    <StatLabel fontSize="sm">Coordinators</StatLabel>
                    <Icon as={UserCheck} color="green.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="700">
                    {facultyStats.coordinators}
                  </StatNumber>
                  <StatHelpText mb={0}>House coordinators</StatHelpText>
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
                    <StatLabel fontSize="sm">Departments</StatLabel>
                    <Icon as={Building2} color="purple.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="700">
                    {facultyStats.departments}
                  </StatNumber>
                  <StatHelpText mb={0}>Academic branches</StatHelpText>
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
                    <StatLabel fontSize="sm">Recent</StatLabel>
                    <Icon as={User} color="orange.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="700">
                    {facultyStats.recentlyAdded}
                  </StatNumber>
                  <StatHelpText mb={0}>Added this week</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Search */}
          <Card
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <CardBody p={4}>
              <InputGroup size="lg">
                <InputLeftElement>
                  <Search size={20} color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name, email, or department..."
                  onChange={handleSearch}
                  borderRadius="xl"
                  fontSize="md"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px blue.500",
                  }}
                />
              </InputGroup>
            </CardBody>
          </Card>

          {/* Results Summary */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Text color="gray.600" fontSize="sm">
              Showing {paginatedFaculty.length} of {filteredFaculty.length}{" "}
              faculty members
              {filteredFaculty.length !== faculty.length && (
                <Text as="span" color="blue.600" ml={1}>
                  (filtered from {faculty.length} total)
                </Text>
              )}
            </Text>

            {totalPages > 1 && (
              <HStack spacing={2}>
                <IconButton
                  aria-label="Previous page"
                  icon={<ChevronLeft size={16} />}
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  isDisabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  borderRadius="lg"
                />

                <Text fontSize="sm" px={3} py={1}>
                  Page {currentPage} of {totalPages}
                </Text>

                <IconButton
                  aria-label="Next page"
                  icon={<ChevronRight size={16} />}
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  isDisabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  borderRadius="lg"
                />
              </HStack>
            )}
          </Flex>

          {/* Faculty Table */}
          {filteredFaculty.length === 0 ? (
            <Center minH="400px">
              <VStack spacing={6}>
                <Icon as={Users} boxSize={16} color="gray.400" />
                <VStack spacing={2}>
                  <Heading size="lg" color="gray.500">
                    {faculty.length === 0
                      ? "No Faculty Members"
                      : "No Matching Faculty"}
                  </Heading>
                  <Text color="gray.500" textAlign="center" maxW="md">
                    {faculty.length === 0
                      ? "Start by adding faculty members to the system."
                      : "Try adjusting your search terms or filters."}
                  </Text>
                </VStack>
                {faculty.length === 0 ? (
                  <Button
                    leftIcon={<Plus size={16} />}
                    colorScheme="blue"
                    onClick={() => navigate("/admin/faculty/add")}
                  >
                    Add First Faculty Member
                  </Button>
                ) : (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </VStack>
            </Center>
          ) : (
            <FacultyTable
              filteredFaculty={paginatedFaculty}
              openEdit={openEdit}
              deleteCustomer={deleteCustomer}
              isMobile={isMobile}
              isBulkDelete={isBulkDelete}
              selectedFaculty={selectedFaculty}
              onFacultySelect={handleFacultySelect}
            />
          )}
        </VStack>

        {/* Modals */}
        <Modal
          isOpen={isFilterOpen}
          onClose={onFilterClose}
          size="xl"
          motionPreset="slideInBottom"
        >
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent borderRadius="xl" mx={4}>
            <ModalHeader borderBottom="1px" borderColor={borderColor}>
              <HStack spacing={3}>
                <Icon as={Filter} color="blue.500" boxSize={5} />
                <Text>Filter Faculty</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <VStack spacing={6} align="stretch">
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
                    <HStack spacing={6}>
                      <Checkbox value="M">Male</Checkbox>
                      <Checkbox value="F">Female</Checkbox>
                      <Checkbox value="O">Others</Checkbox>
                    </HStack>
                  </CheckboxGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600" mb={3}>
                    Department
                  </FormLabel>
                  <CheckboxGroup
                    value={filters.department}
                    onChange={(values) =>
                      setFilters({ ...filters, department: values as string[] })
                    }
                  >
                    <SimpleGrid columns={2} spacing={3}>
                      {uniqueDepartments.map((dept) => (
                        <Checkbox key={dept} value={dept}>
                          {dept}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600" mb={3}>
                    Permissions
                  </FormLabel>
                  <CheckboxGroup
                    value={filters.permissions}
                    onChange={(values) =>
                      setFilters({
                        ...filters,
                        permissions: values as string[],
                      })
                    }
                  >
                    <SimpleGrid columns={1} spacing={3}>
                      {permissionOptions.map((option) => (
                        <Checkbox key={option.value} value={option.value}>
                          <HStack spacing={2}>
                            <Text>{option.label}</Text>
                            <Badge
                              colorScheme={option.color}
                              variant="subtle"
                              size="sm"
                            >
                              {option.value}
                            </Badge>
                          </HStack>
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter borderTop="1px" borderColor={borderColor} gap={3}>
              <Button variant="outline" onClick={clearFilters}>
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

        {/* Delete Confirmations */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
          motionPreset="slideInBottom"
        >
          <AlertDialogOverlay backdropFilter="blur(4px)">
            <AlertDialogContent borderRadius="xl" mx={4}>
              <AlertDialogHeader borderBottom="1px" borderColor={borderColor}>
                <HStack spacing={3}>
                  <Icon as={AlertTriangle} color="red.500" boxSize={6} />
                  <Text>Delete Faculty Member</Text>
                </HStack>
              </AlertDialogHeader>
              <AlertDialogBody py={6}>
                <Alert status="warning" borderRadius="xl">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <AlertTitle fontSize="sm">Warning!</AlertTitle>
                    <AlertDescription fontSize="sm">
                      This action cannot be undone. The faculty member will be
                      permanently removed from the system.
                    </AlertDescription>
                  </VStack>
                </Alert>
              </AlertDialogBody>
              <AlertDialogFooter
                borderTop="1px"
                borderColor={borderColor}
                gap={3}
              >
                <Button
                  ref={cancelRef}
                  onClick={onDeleteClose}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={confirmDelete}
                  leftIcon={<Trash2 size={16} />}
                >
                  Delete Faculty
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteAlertClose}
          motionPreset="slideInBottom"
        >
          <AlertDialogOverlay backdropFilter="blur(4px)">
            <AlertDialogContent borderRadius="xl" mx={4}>
              <AlertDialogHeader borderBottom="1px" borderColor={borderColor}>
                <HStack spacing={3}>
                  <Icon as={AlertTriangle} color="red.500" boxSize={6} />
                  <Text>Bulk Delete Confirmation</Text>
                </HStack>
              </AlertDialogHeader>
              <AlertDialogBody py={6}>
                <VStack spacing={4} align="start">
                  <Text>
                    Are you sure you want to delete {selectedFaculty.length}{" "}
                    faculty members? This action cannot be undone.
                  </Text>
                  <Alert status="error" borderRadius="xl">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <AlertTitle fontSize="sm">Critical Action!</AlertTitle>
                      <AlertDescription fontSize="sm">
                        All selected faculty members and their associated data
                        will be permanently removed.
                      </AlertDescription>
                    </VStack>
                  </Alert>
                </VStack>
              </AlertDialogBody>
              <AlertDialogFooter
                borderTop="1px"
                borderColor={borderColor}
                gap={3}
              >
                <Button
                  ref={cancelRef}
                  onClick={onDeleteAlertClose}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={confirmBulkDelete}
                  leftIcon={<Trash2 size={16} />}
                >
                  Delete {selectedFaculty.length} Faculty
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </MotionBox>
    </Box>
  );
};

export default Faculty;
