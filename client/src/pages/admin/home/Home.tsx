import { useEffect, useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Button,
  SimpleGrid,
  Text,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  HStack,
  Icon,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Heading,
} from "@chakra-ui/react";
import {
  Award,
  Building2,
  Calendar,
  BarChart3,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { House, Point } from "@shared-types/House";
import { Certificate } from "@shared-types/Certificate";
import useAxios from "@/config/axios";

// Enhanced interfaces with better typing
interface DashboardData {
  houses: House[];
  certificates: Certificate[];
  user: any;
  stats?: {
    totalStudents: number;
    totalFaculty: number;
    totalEvents: number;
    activeCertifications: number;
    monthlyGrowth: number;
    pointsThisMonth: number;
  };
}

interface ChartDataPoint {
  month: string;
  points: number;
  trend?: "up" | "down" | "stable";
}

interface HousePointsData {
  name: string;
  points: number;
  color: string;
  percentage: number;
  members: number;
  avgPoints: number;
}

// Enhanced enums and constants
enum CertificateStatus {
  APPROVED = "approved",
  REJECTED = "rejected",
  PENDING = "pending",
}

enum CertificateType {
  EXTERNAL = "external",
  INTERNAL = "internal",
}

enum CertificateLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

// Configuration constants
const CONFIG = {
  CHART: {
    COLORS: {
      primary: "#3B82F6",
      secondary: "#10B981",
      accent: "#F59E0B",
      danger: "#EF4444",
      purple: "#8B5CF6",
      pink: "#EC4899",
    },
    HOUSE_COLORS: [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
      "#84CC16",
    ],
    MONTHS_TO_SHOW: 6,
    TABLE_PAGE_SIZE: 10,
  },
  TOAST: {
    DURATION: {
      SUCCESS: 2000,
      ERROR: 5000,
    },
    POSITION: "top-right" as const,
  },
  THRESHOLDS: {
    PENDING_ALERT: 5,
    MIN_DATA_POINTS: 2,
  },
} as const;

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
] as const;

// Enhanced utility functions
const generateMonthlyPoints = (points: Point[]): ChartDataPoint[] => {
  if (!points || points.length === 0) return [];

  const monthlyPointsMap = points.reduce((acc, point) => {
    const date = new Date(point.createdAt);
    const monthKey = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    if (!acc[monthKey]) acc[monthKey] = 0;
    acc[monthKey] += point.points;
    return acc;
  }, {} as Record<string, number>);

  const sortedData = Object.entries(monthlyPointsMap)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([month, points], index, array) => {
      const prevPoints = index > 0 ? array[index - 1][1] : points;
      const trend: "up" | "down" | "stable" =
        points > prevPoints ? "up" : points < prevPoints ? "down" : "stable";
      return { month, points, trend };
    })
    .slice(-CONFIG.CHART.MONTHS_TO_SHOW);

  return sortedData;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Enhanced custom tooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  type?: "bar" | "line" | "pie";
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  if (!active || !payload || !payload.length) return null;

  return (
    <Box
      bg={bg}
      p={3}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow="xl"
      backdropFilter="blur(10px)"
      minW="200px"
    >
      <Text fontWeight="600" fontSize="sm" mb={2}>
        {label}
      </Text>
      {payload.map((entry, index) => (
        <HStack key={index} spacing={2}>
          <Box w={3} h={3} borderRadius="full" bg={entry.color} />
          <Text fontSize="sm" color="gray.600">
            {entry.name}:{" "}
            <Text as="span" fontWeight="600" color={entry.color}>
              {formatNumber(entry.value)}
            </Text>
          </Text>
        </HStack>
      ))}
    </Box>
  );
};

// Loading skeleton components
const ChartSkeleton: React.FC = () => (
  <VStack spacing={4} w="full" h="300px" justify="center">
    <Skeleton height="200px" width="full" borderRadius="lg" />
    <SkeletonText noOfLines={2} spacing="2" width="60%" />
  </VStack>
);

const StatsSkeleton: React.FC = () => (
  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
    {Array.from({ length: 4 }).map((_, i) => (
      <Box key={i} p={6} bg="white" borderRadius="xl" boxShadow="sm">
        <Skeleton height="20px" width="50%" mb={3} />
        <Skeleton height="30px" width="70%" mb={2} />
        <Skeleton height="15px" width="40%" />
      </Box>
    ))}
  </SimpleGrid>
);

// Enhanced badge variant function
const getBadgeVariant = (
  type: string
): { colorScheme: string; variant: string } => {
  const variants: Record<string, { colorScheme: string; variant: string }> = {
    [CertificateStatus.APPROVED]: { colorScheme: "green", variant: "subtle" },
    [CertificateStatus.REJECTED]: { colorScheme: "red", variant: "subtle" },
    [CertificateStatus.PENDING]: { colorScheme: "yellow", variant: "subtle" },
    [CertificateType.EXTERNAL]: { colorScheme: "purple", variant: "subtle" },
    [CertificateType.INTERNAL]: { colorScheme: "blue", variant: "subtle" },
    [CertificateLevel.BEGINNER]: { colorScheme: "teal", variant: "subtle" },
    [CertificateLevel.INTERMEDIATE]: {
      colorScheme: "orange",
      variant: "subtle",
    },
    [CertificateLevel.ADVANCED]: { colorScheme: "red", variant: "subtle" },
  };
  return (
    variants[type.toLowerCase()] || { colorScheme: "gray", variant: "subtle" }
  );
};

// Get status icon based on certificate status
const getStatusIcon = (status: string) => {
  switch (status) {
    case CertificateStatus.APPROVED:
      return CheckCircle;
    case CertificateStatus.REJECTED:
      return XCircle;
    case CertificateStatus.PENDING:
    default:
      return AlertCircle;
  }
};

// Main Dashboard Component
export default function Dashboard(): JSX.Element {
  // State management with proper typing
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [selectedHouse, setSelectedHouse] = useState<string>("");
  const [houseMonthlyData, setHouseMonthlyData] = useState<ChartDataPoint[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Hooks
  const axios = useAxios();
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Memoized calculations
  const housePointsData: HousePointsData[] = useMemo(() => {
    if (!dashboardData?.houses) return [];

    const totalPoints = dashboardData.houses.reduce(
      (sum, house) =>
        sum +
        (house.points?.reduce((houseSum, p) => houseSum + p.points, 0) || 0),
      0
    );

    return dashboardData.houses
      .map((house, index) => {
        const points = house.points?.reduce((sum, p) => sum + p.points, 0) || 0;
        const members = house.members?.length || 0;
        return {
          name: house.name,
          points,
          color:
            house.color ||
            CONFIG.CHART.HOUSE_COLORS[index % CONFIG.CHART.HOUSE_COLORS.length],
          percentage: totalPoints > 0 ? (points / totalPoints) * 100 : 0,
          members,
          avgPoints: members > 0 ? points / members : 0,
        };
      })
      .sort((a, b) => b.points - a.points);
  }, [dashboardData?.houses]);

  const certificateStats = useMemo(() => {
    if (!dashboardData?.certificates)
      return { approved: 0, pending: 0, rejected: 0, total: 0 };

    return dashboardData.certificates.reduce(
      (acc, cert) => {
        acc[cert.status as keyof Omit<typeof acc, "total">]++;
        acc.total++;
        return acc;
      },
      { approved: 0, pending: 0, rejected: 0, total: 0 }
    );
  }, [dashboardData?.certificates]);

  // API functions
  const fetchDashboardData = useCallback(
    async (showRefreshToast = false) => {
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);

      try {
        const response = await axios.get("/dashboard/admin");
        const data = response.data.data;

        setDashboardData(data);

        if (data.houses?.length && !selectedHouse) {
          const firstHouseId = data.houses[0]._id;
          setSelectedHouse(firstHouseId);

          const firstHouse = data.houses.find(
            (h: House) => h._id === firstHouseId
          );
          if (firstHouse?.points) {
            setHouseMonthlyData(
              generateMonthlyPoints(firstHouse.points as Point[])
            );
          }
        }

        setError("");

        if (showRefreshToast) {
          toast({
            title: "Dashboard Updated",
            description: "Data has been refreshed successfully",
            status: "success",
            duration: CONFIG.TOAST.DURATION.SUCCESS,
            isClosable: true,
            position: CONFIG.TOAST.POSITION,
          });
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to load dashboard data";
        setError(errorMessage);

        toast({
          title: "Error Loading Dashboard",
          description: errorMessage,
          status: "error",
          duration: CONFIG.TOAST.DURATION.ERROR,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [axios, toast, selectedHouse]
  );

  // Effects
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedHouse && dashboardData?.houses) {
      const house = dashboardData.houses.find((h) => h._id === selectedHouse);
      if (house?.points) {
        setHouseMonthlyData(generateMonthlyPoints(house.points));
      }
    }
  }, [selectedHouse, dashboardData?.houses]);

  // Event handlers
  const handleHouseChange = useCallback((houseId: string) => {
    setSelectedHouse(houseId);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Helper function to determine arrow direction
  const getStatArrowType = (current: number, threshold: number) => {
    return current > threshold ? "increase" : "decrease";
  };

  // Loading state
  if (loading) {
    return (
      <Box p={8}>
        <VStack spacing={6} align="stretch">
          <Box>
            <Skeleton height="40px" width="300px" mb={4} />
            <Skeleton height="20px" width="500px" />
          </Box>
          <StatsSkeleton />
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <ChartSkeleton />
            <ChartSkeleton />
          </SimpleGrid>
          <ChartSkeleton />
        </VStack>
      </Box>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <Box p={8}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="400px"
          borderRadius="xl"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Failed to load dashboard!
          </AlertTitle>
          <AlertDescription maxWidth="sm" mb={4}>
            {error}
          </AlertDescription>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={() => fetchDashboardData()}
            leftIcon={<RefreshCw size={16} />}
          >
            Try Again
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <Box p={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <Box>
              <Heading size="lg" mb={2}>
                Admin Dashboard
              </Heading>
              <Text color="gray.600" fontSize="md">
                Welcome back! Here's what's happening with your platform.
              </Text>
            </Box>

            <Button
              leftIcon={<RefreshCw size={16} />}
              colorScheme="blue"
              size="md"
              borderRadius="lg"
              isLoading={refreshing}
              loadingText="Refreshing..."
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Flex>

          {/* Stats Overview */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
            <Card
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              <CardBody>
                <Stat>
                  <Flex justify="space-between" align="center" mb={2}>
                    <StatLabel fontSize="sm" color="gray.600">
                      Total Houses
                    </StatLabel>
                    <Icon as={Building2} color="blue.500" boxSize={5} />
                  </Flex>
                  <StatNumber fontSize="2xl" fontWeight="700">
                    {dashboardData?.houses?.length || 0}
                  </StatNumber>
                  <StatHelpText mb={0}>
                    <StatArrow type="increase" />
                    Active competitions
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              <CardBody>
                <Stat>
                  <Flex justify="space-between" align="center" mb={2}>
                    <StatLabel fontSize="sm" color="gray.600">
                      Total Certificates
                    </StatLabel>
                    <Icon as={Award} color="green.500" boxSize={5} />
                  </Flex>
                  <StatNumber fontSize="2xl" fontWeight="700">
                    {certificateStats.total}
                  </StatNumber>
                  <StatHelpText mb={0}>
                    <StatArrow type="increase" />
                    {certificateStats.approved} approved
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              <CardBody>
                <Stat>
                  <Flex justify="space-between" align="center" mb={2}>
                    <StatLabel fontSize="sm" color="gray.600">
                      Pending Reviews
                    </StatLabel>
                    <Icon as={Clock} color="orange.500" boxSize={5} />
                  </Flex>
                  <StatNumber fontSize="2xl" fontWeight="700">
                    {certificateStats.pending}
                  </StatNumber>
                  <StatHelpText mb={0}>
                    <StatArrow
                      type={getStatArrowType(
                        certificateStats.pending,
                        CONFIG.THRESHOLDS.PENDING_ALERT
                      )}
                    />
                    Needs attention
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              <CardBody>
                <Stat>
                  <Flex justify="space-between" align="center" mb={2}>
                    <StatLabel fontSize="sm" color="gray.600">
                      Total Points
                    </StatLabel>
                    <Icon as={Zap} color="purple.500" boxSize={5} />
                  </Flex>
                  <StatNumber fontSize="2xl" fontWeight="700">
                    {formatNumber(
                      housePointsData.reduce(
                        (sum, house) => sum + house.points,
                        0
                      )
                    )}
                  </StatNumber>
                  <StatHelpText mb={0}>
                    <StatArrow type="increase" />
                    Across all houses
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Charts Section */}
          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
            {/* House Points Distribution */}
            <Card
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
            >
              <CardHeader>
                <VStack align="start" spacing={1}>
                  <Heading size="md">House Performance</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Points distribution across houses
                  </Text>
                </VStack>
              </CardHeader>
              <CardBody pt={0}>
                {housePointsData.length > 0 ? (
                  <Box h="350px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={housePointsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip type="bar" />} />
                        <Bar
                          dataKey="points"
                          fill={CONFIG.CHART.COLORS.primary}
                          radius={[8, 8, 0, 0]}
                          name="Points"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <VStack spacing={4} py={16}>
                    <Icon as={BarChart3} boxSize={12} color="gray.400" />
                    <Text color="gray.500" textAlign="center">
                      No house data available
                    </Text>
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* House Progress Over Time */}
            <Card
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
            >
              <CardHeader>
                <Flex justify="space-between" align="center" mb={4}>
                  <VStack align="start" spacing={1}>
                    <Heading size="md">House Progress</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Monthly performance trends
                    </Text>
                  </VStack>
                  <Select
                    value={selectedHouse}
                    onChange={(e) => handleHouseChange(e.target.value)}
                    placeholder="Select House"
                    maxW="200px"
                    borderRadius="lg"
                    border="2px"
                    borderColor={borderColor}
                  >
                    {dashboardData?.houses.map((house) => (
                      <option key={house._id} value={house._id}>
                        {house.name}
                      </option>
                    ))}
                  </Select>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                {houseMonthlyData.length > 0 ? (
                  <Box h="350px">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={houseMonthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorPoints"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={CONFIG.CHART.COLORS.primary}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={CONFIG.CHART.COLORS.primary}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip type="line" />} />
                        <Area
                          type="monotone"
                          dataKey="points"
                          stroke={CONFIG.CHART.COLORS.primary}
                          strokeWidth={3}
                          fill="url(#colorPoints)"
                          name="Points"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <VStack spacing={4} py={16}>
                    <Icon as={Activity} boxSize={12} color="gray.400" />
                    <Text color="gray.500" textAlign="center">
                      No trend data available
                    </Text>
                  </VStack>
                )}
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Certificates Table */}
          <Card
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <CardHeader>
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="md">Recent Certifications</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Latest certificate submissions and approvals
                  </Text>
                </VStack>
                {(dashboardData?.certificates?.length || 0) >
                  CONFIG.CHART.TABLE_PAGE_SIZE && (
                  <Button
                    rightIcon={<ArrowUpRight size={16} />}
                    variant="outline"
                    size="sm"
                    borderRadius="lg"
                    onClick={() => console.log("Navigate to all certificates")}
                  >
                    View All
                  </Button>
                )}
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              {dashboardData?.certificates?.length ? (
                <Box overflowX="auto">
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        <Th borderColor={borderColor} py={4}>
                          Certificate
                        </Th>
                        <Th borderColor={borderColor} py={4}>
                          Organization
                        </Th>
                        <Th borderColor={borderColor} py={4}>
                          Issue Date
                        </Th>
                        <Th borderColor={borderColor} py={4}>
                          Type
                        </Th>
                        <Th borderColor={borderColor} py={4}>
                          Level
                        </Th>
                        <Th borderColor={borderColor} py={4}>
                          Status
                        </Th>
              
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dashboardData.certificates
                        .slice(0, CONFIG.CHART.TABLE_PAGE_SIZE)
                        .map((cert) => {
                          const statusVariant = getBadgeVariant(cert.status);
                          const typeVariant = getBadgeVariant(cert.type);
                          const levelVariant = getBadgeVariant(cert.level);
                          const StatusIcon = getStatusIcon(cert.status);

                          return (
                            <Tr
                              key={cert._id}
                              _hover={{
                                bg: useColorModeValue("gray.50", "gray.700"),
                              }}
                            >
                              <Td borderColor={borderColor} py={4}>
                                <HStack spacing={3}>
                                  <Box
                                    p={2}
                                    borderRadius="lg"
                                    bg={useColorModeValue(
                                      "blue.50",
                                      "blue.900/20"
                                    )}
                                    color="blue.500"
                                  >
                                    <Award size={16} />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="600" fontSize="sm">
                                      {cert.name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      ID: {cert._id.slice(-6)}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </Td>
                              <Td borderColor={borderColor} py={4}>
                                <HStack spacing={2}>
                                  <Icon
                                    as={Building2}
                                    color="gray.500"
                                    boxSize={4}
                                  />
                                  <Text fontSize="sm">
                                    {cert.issuingOrganization}
                                  </Text>
                                </HStack>
                              </Td>
                              <Td borderColor={borderColor} py={4}>
                                <HStack spacing={2}>
                                  <Icon
                                    as={Calendar}
                                    color="gray.500"
                                    boxSize={4}
                                  />
                                  <Text fontSize="sm">
                                    {cert.issueDate.month} {cert.issueDate.year}
                                  </Text>
                                </HStack>
                              </Td>
                              <Td borderColor={borderColor} py={4}>
                                <Badge
                                  colorScheme={typeVariant.colorScheme}
                                  variant={typeVariant.variant}
                                  borderRadius="full"
                                  px={3}
                                  py={1}
                                  fontSize="xs"
                                  fontWeight="600"
                                >
                                  {cert.type}
                                </Badge>
                              </Td>
                              <Td borderColor={borderColor} py={4}>
                                <Badge
                                  colorScheme={levelVariant.colorScheme}
                                  variant={levelVariant.variant}
                                  borderRadius="full"
                                  px={3}
                                  py={1}
                                  fontSize="xs"
                                  fontWeight="600"
                                >
                                  {cert.level}
                                </Badge>
                              </Td>
                              <Td borderColor={borderColor} py={4}>
                                <Badge
                                  colorScheme={statusVariant.colorScheme}
                                  variant={statusVariant.variant}
                                  borderRadius="full"
                                  px={3}
                                  py={1}
                                  fontSize="xs"
                                  fontWeight="600"
                                >
                                  <HStack spacing={1}>
                                    <Icon as={StatusIcon} boxSize={3} />
                                    <Text>{cert.status}</Text>
                                  </HStack>
                                </Badge>
                              </Td>
                            </Tr>
                          );
                        })}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <VStack spacing={6} py={16}>
                  <Icon as={Award} boxSize={16} color="gray.400" />
                  <VStack spacing={2}>
                    <Text fontSize="lg" fontWeight="600" color="gray.500">
                      No certificates yet
                    </Text>
                    <Text
                      fontSize="sm"
                      color="gray.400"
                      textAlign="center"
                      maxW="400px"
                    >
                      When users submit certificates for verification, they'll
                      appear here for review.
                    </Text>
                  </VStack>
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}
