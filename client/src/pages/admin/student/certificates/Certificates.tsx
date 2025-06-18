import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useDisclosure,
  useToast,
  Badge,
  Stack,
  Checkbox,
  CheckboxGroup,
  FormLabel,
  FormControl,
  useBreakpointValue,
  InputGroup,
  InputLeftElement,
  IconButton,
  VStack,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Center,
  Divider,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import {
  Award,
  Building2,
  Calendar,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  FileText,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";
import { Certificate } from "@shared-types/Certificate";
import Loader from "@/components/Loader";
import useAxios from "@/config/axios";

// Enhanced interfaces
interface FilterState {
  types: string[];
  levels: string[];
  status: string[];
  issueYears: string[];
}

interface CertificateStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  thisMonth: number;
}

// Configuration constants
const CONFIG = {
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
  STATUS_COLORS: {
    approved: { bg: "green.100", color: "green.800", icon: CheckCircle },
    rejected: { bg: "red.100", color: "red.800", icon: XCircle },
    pending: { bg: "yellow.100", color: "yellow.800", icon: Clock },
    active: { bg: "green.100", color: "green.800", icon: CheckCircle },
    expired: { bg: "red.100", color: "red.800", icon: XCircle },
  },
  TYPE_COLORS: {
    internal: { bg: "blue.100", color: "blue.800" },
    external: { bg: "purple.100", color: "purple.800" },
  },
  LEVEL_COLORS: {
    beginner: { bg: "emerald.100", color: "emerald.800" },
    intermediate: { bg: "orange.100", color: "orange.800" },
    advanced: { bg: "red.100", color: "red.800" },
  },
} as const;

// Month mapping for string to number conversion
const MONTH_MAP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

// Month names for display
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Enhanced components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionTr = motion(Tr);

// Utility functions
const calculateCertificateStats = (
  certificates: Certificate[]
): CertificateStats => {
  const total = certificates.length;
  const pending = certificates.filter(
    (c) => (c.status || "pending") === "pending"
  ).length;
  const approved = certificates.filter(
    (c) => c.status === "approved" || c.status === "active"
  ).length;
  const rejected = certificates.filter(
    (c) => c.status === "rejected" || c.status === "expired"
  ).length;

  // Current date: June 2025
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const thisMonth = certificates.filter((cert) => {
    try {
      if (!cert.issueDate || typeof cert.issueDate !== "object") return false;

      if (cert.issueDate.month && cert.issueDate.year) {
        const monthString = cert.issueDate.month.toLowerCase();
        const monthNumber = MONTH_MAP[monthString];

        if (monthNumber && cert.issueDate.year) {
          return (
            monthNumber === currentMonth && cert.issueDate.year === currentYear
          );
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }).length;

  return { total, pending, approved, rejected, thisMonth };
};

const getStatusProps = (status?: string) => {
  const statusKey = (
    status || "pending"
  ).toLowerCase() as keyof typeof CONFIG.STATUS_COLORS;
  return CONFIG.STATUS_COLORS[statusKey] || CONFIG.STATUS_COLORS.pending;
};

const getTypeProps = (type: string) => {
  const typeKey = type?.toLowerCase() as keyof typeof CONFIG.TYPE_COLORS;
  return CONFIG.TYPE_COLORS[typeKey] || CONFIG.TYPE_COLORS.external;
};

const getLevelProps = (level: string) => {
  const levelKey = level?.toLowerCase() as keyof typeof CONFIG.LEVEL_COLORS;
  return CONFIG.LEVEL_COLORS[levelKey] || { bg: "gray.100", color: "gray.800" };
};

const formatDate = (issueDate: any): string => {
  try {
    if (!issueDate) return "N/A";

    if (typeof issueDate === "object" && issueDate.month && issueDate.year) {
      const monthString = issueDate.month.toLowerCase();
      const monthNumber = MONTH_MAP[monthString];

      if (monthNumber && monthNumber >= 1 && monthNumber <= 12) {
        const monthName = MONTH_NAMES[monthNumber - 1];
        return `${monthName} ${issueDate.year}`;
      }
    }

    const parsedDate = new Date(issueDate);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString();
    }

    return "Invalid Date";
  } catch (error) {
    return "Invalid Date";
  }
};

// Enhanced Certificate Card Component
interface CertificateCardProps {
  cert: Certificate;
  index: number;
  onView: (id: string) => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  cert,
  index,
  onView,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const statusProps = getStatusProps(cert.status);
  const typeProps = getTypeProps(cert.type);
  const levelProps = getLevelProps(cert.level);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      bg={cardBg}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      overflow="hidden"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "lg",
        borderColor: "blue.300",
      }}
    >
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="start">
            <VStack align="start" spacing={2} flex={1}>
              <HStack spacing={3}>
                <Icon as={Award} color="blue.500" boxSize={6} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="700" fontSize="lg" lineHeight="shorter">
                    {cert.name}
                  </Text>
                  <HStack spacing={2}>
                    <Icon as={Building2} color="gray.500" boxSize={4} />
                    <Text fontSize="sm" color="gray.600">
                      {cert.issuingOrganization}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </VStack>

            <Menu>
              <MenuButton
                as={IconButton}
                icon={<MoreVertical size={16} />}
                variant="ghost"
                size="sm"
                borderRadius="lg"
              />
              <MenuList borderRadius="xl">
                <MenuItem
                  icon={<Eye size={16} />}
                  onClick={() => onView(cert?._id!)}
                >
                  View Details
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>

          <Divider />

          <HStack justify="space-between" wrap="wrap" gap={2}>
            <Wrap spacing={2}>
              <WrapItem>
                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="600"
                  {...typeProps}
                >
                  {cert.type?.charAt(0).toUpperCase() + cert.type?.slice(1)}
                </Badge>
              </WrapItem>
              <WrapItem>
                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="600"
                  {...levelProps}
                >
                  {cert.level?.charAt(0).toUpperCase() + cert.level?.slice(1)}
                </Badge>
              </WrapItem>
            </Wrap>

            <Badge
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="600"
              {...statusProps}
            >
              <HStack spacing={1}>
                <Icon as={statusProps.icon} boxSize={3} />
                <Text>
                  {(cert.status ?? "Pending")?.charAt(0).toUpperCase() +
                    (cert.status ?? "pending")?.slice(1)}
                </Text>
              </HStack>
            </Badge>
          </HStack>

          <HStack spacing={2} fontSize="sm" color="gray.600">
            <Icon as={Calendar} boxSize={4} />
            <Text>Issued: {formatDate(cert.issueDate)}</Text>
          </HStack>

          <Button
            leftIcon={<Eye size={16} />}
            variant="outline"
            size="sm"
            onClick={() => onView(cert?._id!)}
            borderRadius="lg"
            width="full"
          >
            View Details
          </Button>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Enhanced Table Component
interface CertificateTableProps {
  data: Certificate[];
  onView: (id: string) => void;
}

const CertificateTable: React.FC<CertificateTableProps> = ({
  data,
  onView,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Card
      bg={cardBg}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      overflow="hidden"
    >
      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead bg={useColorModeValue("gray.50", "gray.700")}>
            <Tr>
              <Th
                borderColor={borderColor}
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
              >
                #
              </Th>
              <Th
                borderColor={borderColor}
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
              >
                Certificate
              </Th>
              <Th
                borderColor={borderColor}
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
              >
                Organization
              </Th>
              <Th
                borderColor={borderColor}
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
              >
                Details
              </Th>
              <Th
                borderColor={borderColor}
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
              >
                Status
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
              {data.map((cert, index) => {
                const statusProps = getStatusProps(cert.status);
                const typeProps = getTypeProps(cert.type);
                const levelProps = getLevelProps(cert.level);

                return (
                  <MotionTr
                    key={cert._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    _hover={{ bg: hoverBg }}
                  >
                    <Td borderColor={borderColor} py={4}>
                      <Text fontWeight="600" fontSize="sm">
                        {index + 1}
                      </Text>
                    </Td>

                    <Td borderColor={borderColor} py={4}>
                      <HStack spacing={3}>
                        <Icon as={Award} color="blue.500" boxSize={5} />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="600" fontSize="sm">
                            {cert.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Issued: {formatDate(cert.issueDate)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>

                    <Td borderColor={borderColor} py={4}>
                      <HStack spacing={2}>
                        <Icon as={Building2} color="gray.500" boxSize={4} />
                        <Text fontSize="sm" color="gray.600">
                          {cert.issuingOrganization}
                        </Text>
                      </HStack>
                    </Td>

                    <Td borderColor={borderColor} py={4}>
                      <VStack align="start" spacing={2}>
                        <HStack spacing={2}>
                          <Badge
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            {...typeProps}
                          >
                            {cert.type?.charAt(0).toUpperCase() +
                              cert.type?.slice(1)}
                          </Badge>
                          <Badge
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            {...levelProps}
                          >
                            {cert.level?.charAt(0).toUpperCase() +
                              cert.level?.slice(1)}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Td>

                    <Td borderColor={borderColor} py={4}>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="600"
                        {...statusProps}
                      >
                        <HStack spacing={1}>
                          <Icon as={statusProps.icon} boxSize={3} />
                          <Text>
                            {(cert.status ?? "Pending")
                              ?.charAt(0)
                              .toUpperCase() +
                              (cert.status ?? "pending")?.slice(1)}
                          </Text>
                        </HStack>
                      </Badge>
                    </Td>

                    <Td borderColor={borderColor} py={4} textAlign="center">
                      <Tooltip label="View certificate details">
                        <IconButton
                          aria-label="View certificate"
                          icon={<Eye size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          borderRadius="lg"
                          onClick={() => onView(cert?._id!)}
                        />
                      </Tooltip>
                    </Td>
                  </MotionTr>
                );
              })}
            </AnimatePresence>
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
};

// Main Component
const StudentCertificates = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<
    Certificate[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    levels: [],
    status: [],
    issueYears: [],
  });

  const navigate = useNavigate();
  const toast = useToast();
  const axios = useAxios();

  // Disclosure hooks
  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose,
  } = useDisclosure();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Memoized calculations
  const certificateStats = useMemo(() => {
    return calculateCertificateStats(certificates);
  }, [certificates]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    certificates.forEach((cert) => {
      try {
        if (
          cert.issueDate &&
          typeof cert.issueDate === "object" &&
          cert.issueDate.year
        ) {
          const year = cert.issueDate.year;
          if (!isNaN(year) && year > 1900 && year < 3000) {
            years.add(year.toString());
          }
        }
      } catch (error) {
        console.warn("Error extracting year from certificate:", cert, error);
      }
    });
    return Array.from(years).sort().reverse();
  }, [certificates]);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
      }, CONFIG.DEBOUNCE.SEARCH_DELAY),
    []
  );

  // Filter effect
  useEffect(() => {
    let result = [...certificates];

    if (searchQuery) {
      result = result.filter(
        (cert) =>
          cert.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cert.issuingOrganization
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (filters.types.length > 0) {
      result = result.filter((cert) =>
        filters.types.includes(cert.type?.toLowerCase())
      );
    }

    if (filters.levels.length > 0) {
      result = result.filter((cert) =>
        filters.levels.includes(cert.level?.toLowerCase())
      );
    }

    if (filters.status.length > 0) {
      result = result.filter((cert) =>
        filters.status.includes((cert.status || "pending").toLowerCase())
      );
    }

    if (filters.issueYears.length > 0) {
      result = result.filter((cert) => {
        try {
          if (
            cert.issueDate &&
            typeof cert.issueDate === "object" &&
            cert.issueDate.year
          ) {
            return filters.issueYears.includes(cert.issueDate.year.toString());
          }
          return false;
        } catch {
          return false;
        }
      });
    }

    setFilteredCertificates(result);
  }, [certificates, searchQuery, filters]);

  // API functions
  const fetchCertificates = useCallback(
    async (showRefreshToast = false) => {
      try {
        if (showRefreshToast) setIsRefreshing(true);
        else setLoading(true);

        const response = await axios.get("/certificates/student");
        setCertificates(response.data.data || []);
        setFilteredCertificates(response.data.data || []);

        if (showRefreshToast) {
          toast({
            title: "Certificates Refreshed",
            description: `Loaded ${
              response.data.data?.length || 0
            } certificates`,
            status: "success",
            duration: CONFIG.TOAST.DURATION.SUCCESS,
            isClosable: true,
            position: CONFIG.TOAST.POSITION,
          });
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        toast({
          title: "Error Loading Certificates",
          description:
            err.response?.data?.message || "Failed to fetch certificates",
          status: "error",
          duration: CONFIG.TOAST.DURATION.ERROR,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });

        setCertificates([]);
        setFilteredCertificates([]);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [axios, toast]
  );

  // Event handlers
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      types: [],
      levels: [],
      status: [],
      issueYears: [],
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((filterArray) => filterArray.length > 0);
  }, [filters]);

  // Effects
  useEffect(() => {
    fetchCertificates();
  }, []);

  if (loading) return <Loader />;

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
            <CardHeader>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <VStack align="start" spacing={2}>
                  <HStack spacing={3}>
                    <Icon as={Award} color="blue.500" boxSize={8} />
                    <Heading size="xl" fontWeight="800">
                      My Certificates
                    </Heading>
                  </HStack>
                  <Text color="gray.600" fontSize="lg">
                    View and manage your certification portfolio
                  </Text>
                </VStack>

                <HStack spacing={3}>
                  <Tooltip label="Refresh certificates">
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
                      onClick={() => fetchCertificates(true)}
                      isDisabled={isRefreshing}
                      borderRadius="lg"
                    />
                  </Tooltip>
                </HStack>
              </Flex>
            </CardHeader>
          </Card>

          {/* Statistics */}
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
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
                    <StatLabel fontSize="sm">Total</StatLabel>
                    <Icon as={FileText} color="blue.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="700">
                    {certificateStats.total || 0}
                  </StatNumber>
                  <StatHelpText mb={0}>Certificates</StatHelpText>
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
                    <StatLabel fontSize="sm">Pending</StatLabel>
                    <Icon as={Clock} color="yellow.500" boxSize={4} />
                  </HStack>
                  <StatNumber
                    fontSize="2xl"
                    fontWeight="700"
                    color="yellow.500"
                  >
                    {certificateStats.pending || 0}
                  </StatNumber>
                  <StatHelpText mb={0}>Under review</StatHelpText>
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
                    <StatLabel fontSize="sm">Approved</StatLabel>
                    <Icon as={CheckCircle} color="green.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="700" color="green.500">
                    {certificateStats.approved || 0}
                  </StatNumber>
                  <StatHelpText mb={0}>Verified</StatHelpText>
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
                    <StatLabel fontSize="sm">Rejected</StatLabel>
                    <Icon as={XCircle} color="red.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="700" color="red.500">
                    {certificateStats.rejected || 0}
                  </StatNumber>
                  <StatHelpText mb={0}>Needs attention</StatHelpText>
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
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <CardBody p={4}>
                <Stat>
                  <HStack justify="space-between" mb={2}>
                    <StatLabel fontSize="sm">This Month</StatLabel>
                    <Icon as={TrendingUp} color="purple.500" boxSize={4} />
                  </HStack>
                  <StatNumber
                    fontSize="2xl"
                    fontWeight="700"
                    color="purple.500"
                  >
                    {certificateStats.thisMonth || 0}
                  </StatNumber>
                  <StatHelpText mb={0}>June 2025</StatHelpText>
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
          >
            <CardBody p={4}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <InputGroup maxW="400px">
                  <InputLeftElement>
                    <Search size={18} color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search certificates..."
                    onChange={handleSearch}
                    borderRadius="lg"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px blue.500",
                    }}
                  />
                </InputGroup>

                <HStack spacing={3}>
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
                      Clear
                    </Button>
                  )}
                </HStack>
              </Flex>

              {/* Active Filters */}
              {hasActiveFilters && (
                <Box mt={4}>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Active Filters:
                  </Text>
                  <Wrap spacing={2}>
                    {Object.entries(filters).map(([key, values]) =>
                      values.map((value: any) => (
                        <WrapItem key={`${key}-${value}`}>
                          <Tag size="sm" colorScheme="blue" borderRadius="full">
                            <TagLabel>{value}</TagLabel>
                            <TagCloseButton
                              onClick={() => {
                                const newFilters = { ...filters };
                                newFilters[key as keyof FilterState] =
                                  values.filter((v: any) => v !== value);
                                setFilters(newFilters);
                              }}
                            />
                          </Tag>
                        </WrapItem>
                      ))
                    )}
                  </Wrap>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Certificates List */}
          {filteredCertificates.length === 0 ? (
            <Center minH="400px">
              <VStack spacing={4}>
                <Icon as={Award} boxSize={16} color="gray.400" />
                <VStack spacing={2}>
                  <Heading size="md" color="gray.500">
                    {certificates.length === 0
                      ? "No Certificates Found"
                      : "No Matching Certificates"}
                  </Heading>
                  <Text color="gray.500" textAlign="center">
                    {certificates.length === 0
                      ? "Start by asking students to enhance their certification portfolio by adding their first certificate."
                      : "Try adjusting your search terms or filters to find what you're looking for."}
                  </Text>
                </VStack>
                {certificates.length === 0 ? null : (
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
                  {filteredCertificates.map((cert, index) => (
                    <CertificateCard
                      key={cert._id}
                      cert={cert}
                      index={index}
                      onView={(id) => navigate(`/certificates/${id}`)}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <CertificateTable
                  data={filteredCertificates}
                  onView={(id) => navigate(`/certificates/${id}`)}
                />
              )}
            </AnimatePresence>
          )}

          {/* Filter Modal */}
          <Modal
            isOpen={isFilterOpen}
            onClose={onFilterClose}
            size={isMobile ? "full" : "lg"}
            motionPreset="slideInBottom"
          >
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl" mx={isMobile ? 0 : 4}>
              <ModalHeader borderBottom="1px" borderColor={borderColor}>
                <HStack spacing={3}>
                  <Icon as={Filter} color="blue.500" boxSize={6} />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="700">
                      Filter Certificates
                    </Text>
                    <Text fontSize="sm" color="gray.600" fontWeight="normal">
                      Refine your search results
                    </Text>
                  </VStack>
                </HStack>
              </ModalHeader>
              <ModalCloseButton />

              <ModalBody py={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="600" mb={3}>
                      Certificate Type
                    </FormLabel>
                    <CheckboxGroup
                      value={filters.types}
                      onChange={(values) =>
                        setFilters({ ...filters, types: values as string[] })
                      }
                    >
                      <Stack spacing={3}>
                        <Checkbox value="internal" colorScheme="blue">
                          Internal Certificates
                        </Checkbox>
                        <Checkbox value="external" colorScheme="blue">
                          External Certificates
                        </Checkbox>
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" mb={3}>
                      Skill Level
                    </FormLabel>
                    <CheckboxGroup
                      value={filters.levels}
                      onChange={(values) =>
                        setFilters({ ...filters, levels: values as string[] })
                      }
                    >
                      <Stack spacing={3}>
                        <Checkbox value="beginner" colorScheme="blue">
                          Beginner Level
                        </Checkbox>
                        <Checkbox value="intermediate" colorScheme="blue">
                          Intermediate Level
                        </Checkbox>
                        <Checkbox value="advanced" colorScheme="blue">
                          Advanced Level
                        </Checkbox>
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" mb={3}>
                      Status
                    </FormLabel>
                    <CheckboxGroup
                      value={filters.status}
                      onChange={(values) =>
                        setFilters({ ...filters, status: values as string[] })
                      }
                    >
                      <Stack spacing={3}>
                        <Checkbox value="approved" colorScheme="blue">
                          Approved
                        </Checkbox>
                        <Checkbox value="active" colorScheme="blue">
                          Active
                        </Checkbox>
                        <Checkbox value="pending" colorScheme="blue">
                          Pending
                        </Checkbox>
                        <Checkbox value="rejected" colorScheme="blue">
                          Rejected
                        </Checkbox>
                        <Checkbox value="expired" colorScheme="blue">
                          Expired
                        </Checkbox>
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" mb={3}>
                      Issue Year
                    </FormLabel>
                    <CheckboxGroup
                      value={filters.issueYears}
                      onChange={(values) =>
                        setFilters({
                          ...filters,
                          issueYears: values as string[],
                        })
                      }
                    >
                      <Stack spacing={3} maxH="150px" overflowY="auto">
                        {availableYears.map((year) => (
                          <Checkbox key={year} value={year} colorScheme="blue">
                            {year}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>
                </SimpleGrid>
              </ModalBody>

              <ModalFooter borderTop="1px" borderColor={borderColor} gap={3}>
                <Button
                  variant="outline"
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
        </VStack>
      </MotionBox>
    </Box>
  );
};

export default StudentCertificates;
