import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Card,
  CardHeader,
  CardBody,
  useBreakpointValue,
  useToast,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Skeleton,
  SkeletonText,
  Center,
  Divider,
  Select,
  InputGroup,
  InputLeftElement,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  SortDesc,
  ChevronDown,
  User,
  Clock,
  Award,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import useAxios from "@/config/axios";
import debounce from "lodash/debounce";

// Enhanced interfaces
interface Feedback {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  category?: string;
  isHelpful?: boolean;
  replies?: FeedbackReply[];
}

interface FeedbackReply {
  _id: string;
  message: string;
  createdAt: string;
  adminName: string;
}

interface FeedbackStats {
  total: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  recentCount: number;
  positivePercentage: number;
}

interface FilterOptions {
  rating: number | "all";
  sortBy: "newest" | "oldest" | "rating-high" | "rating-low";
  category: string | "all";
  searchTerm: string;
}

// Configuration constants
const CONFIG = {
  PAGINATION: {
    ITEMS_PER_PAGE: 12,
  },
  RATING: {
    POSITIVE_THRESHOLD: 4,
    COLORS: {
      5: "green",
      4: "blue",
      3: "yellow",
      2: "orange",
      1: "red",
    },
  },
  TOAST: {
    DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
    },
    POSITION: "top-right" as const,
  },
  DEBOUNCE: {
    SEARCH_DELAY: 300,
  },
  ANIMATION: {
    CARD_HOVER: {
      y: -8,
      transition: { duration: 0.2 },
    },
    CARD_INITIAL: { opacity: 0, y: 20 },
    CARD_ANIMATE: { opacity: 1, y: 0 },
  },
} as const;

// Enhanced utility functions
const calculateFeedbackStats = (feedbackList: Feedback[]): FeedbackStats => {
  if (feedbackList.length === 0) {
    return {
      total: 0,
      averageRating: 0,
      ratingDistribution: {},
      recentCount: 0,
      positivePercentage: 0,
    };
  }

  const total = feedbackList.length;
  const totalRating = feedbackList.reduce((sum, item) => sum + item.rating, 0);
  const averageRating = totalRating / total;

  const ratingDistribution = feedbackList.reduce((acc, item) => {
    acc[item.rating] = (acc[item.rating] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentCount = feedbackList.filter(
    (item) => new Date(item.createdAt) >= sevenDaysAgo
  ).length;

  const positiveCount = feedbackList.filter(
    (item) => item.rating >= CONFIG.RATING.POSITIVE_THRESHOLD
  ).length;
  const positivePercentage = (positiveCount / total) * 100;

  return {
    total,
    averageRating,
    ratingDistribution,
    recentCount,
    positivePercentage,
  };
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInHours < 24) {
    return diffInHours < 1 ? "Just now" : `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const getRatingColor = (rating: number): string => {
  return (
    CONFIG.RATING.COLORS[rating as keyof typeof CONFIG.RATING.COLORS] || "gray"
  );
};

// Enhanced components
const MotionCard = motion(Card);

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20,
  showValue = false,
  interactive = false,
}) => {
  const starColor = useColorModeValue("yellow.400", "yellow.300");
  const emptyStarColor = useColorModeValue("gray.300", "gray.600");

  return (
    <HStack spacing={1} align="center">
      <HStack spacing={0.5}>
        {[...Array(5)].map((_, index) => (
          <Icon
            key={index}
            as={Star}
            boxSize={`${size}px`}
            color={index < rating ? starColor : emptyStarColor}
            fill={index < rating ? starColor : "transparent"}
            cursor={interactive ? "pointer" : "default"}
            transition="all 0.2s"
            _hover={interactive ? { transform: "scale(1.1)" } : {}}
          />
        ))}
      </HStack>
      {showValue && (
        <Text fontSize="sm" color="gray.600" fontWeight="500">
          ({rating}/5)
        </Text>
      )}
    </HStack>
  );
};

interface FeedbackCardProps {
  feedback: Feedback;
  index: number;
  onOpen: (feedback: Feedback) => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  index,
  onOpen,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");

  return (
    <MotionCard
      bg={cardBg}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      cursor="pointer"
      onClick={() => onOpen(feedback)}
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "lg",
        borderColor: "blue.300",
      }}
      initial={CONFIG.ANIMATION.CARD_INITIAL}
      animate={CONFIG.ANIMATION.CARD_ANIMATE}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      overflow="hidden"
    >
      <CardHeader pb={3}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <HStack spacing={2}>
              <Icon as={MessageCircle} color="blue.500" boxSize={4} />
              <Text fontSize="sm" fontWeight="600" color={mutedTextColor}>
                Feedback #{index + 1}
              </Text>
            </HStack>
            {feedback.category && (
              <Badge
                colorScheme={getRatingColor(feedback.rating)}
                variant="subtle"
                borderRadius="full"
                fontSize="xs"
              >
                {feedback.category}
              </Badge>
            )}
          </VStack>

          <VStack align="end" spacing={1}>
            <Badge
              colorScheme="gray"
              variant="outline"
              borderRadius="full"
              fontSize="xs"
            >
              {formatTimeAgo(feedback.createdAt)}
            </Badge>
          </VStack>
        </Flex>
      </CardHeader>

      <CardBody pt={0}>
        <VStack align="start" spacing={4}>
          <StarRating rating={feedback.rating} size={18} showValue />

          <Text
            color={textColor}
            noOfLines={3}
            fontSize="sm"
            lineHeight="tall"
            minH="60px"
          >
            {feedback.review}
          </Text>

          <Divider />

          <Flex justify="space-between" align="center" w="full">
            {feedback.userName ? (
              <HStack spacing={2}>
                <Icon as={User} color="blue.500" boxSize={4} />
                <Text fontSize="sm" color="blue.600" fontWeight="500">
                  {feedback.userName}
                </Text>
              </HStack>
            ) : (
              <Text fontSize="sm" color={mutedTextColor}>
                Anonymous
              </Text>
            )}

            <HStack spacing={2}>
              {feedback.replies && feedback.replies.length > 0 && (
                <Badge colorScheme="green" variant="subtle" borderRadius="full">
                  {feedback.replies.length}{" "}
                  {feedback.replies.length === 1 ? "reply" : "replies"}
                </Badge>
              )}
            </HStack>
          </Flex>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Loading skeleton component
const FeedbackSkeleton: React.FC = () => (
  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} borderRadius="xl">
        <CardHeader>
          <Flex justify="space-between">
            <Skeleton height="20px" width="120px" />
            <Skeleton height="20px" width="80px" />
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <VStack align="start" spacing={3}>
            <Skeleton height="20px" width="150px" />
            <SkeletonText noOfLines={3} spacing="2" width="100%" />
            <Flex justify="space-between" w="full">
              <Skeleton height="16px" width="100px" />
              <Skeleton height="16px" width="60px" />
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    ))}
  </SimpleGrid>
);

// Main Feedback Component
const Feedback: React.FC = () => {
  // State management
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [filters, setFilters] = useState<FilterOptions>({
    rating: "all",
    sortBy: "newest",
    category: "all",
    searchTerm: "",
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const axios = useAxios();
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Memoized calculations
  const feedbackStats = useMemo(
    () => calculateFeedbackStats(feedback),
    [feedback]
  );

  const filteredAndSortedFeedback = useMemo(() => {
    let filtered = [...feedback];

    // Apply rating filter
    if (filters.rating !== "all") {
      filtered = filtered.filter((item) => item.rating === filters.rating);
    }

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.review.toLowerCase().includes(searchTerm) ||
          item.userName?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "rating-high":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-low":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    return filtered;
  }, [feedback, filters]);

  const categories = useMemo(() => {
    const cats = feedback.map((item) => item.category).filter(Boolean);
    return [...new Set(cats)] as string[];
  }, [feedback]);

  // API functions
  const fetchFeedback = useCallback(
    async (showRefreshToast = false) => {
      try {
        if (showRefreshToast) setIsRefreshing(true);
        else setLoading(true);

        const response = await axios.get("/feedback");
        setFeedback(response.data.data || []);
        setError("");

        if (showRefreshToast) {
          toast({
            title: "Feedback Refreshed",
            description: `Loaded ${
              response.data.data?.length || 0
            } feedback entries`,
            status: "success",
            duration: CONFIG.TOAST.DURATION.SUCCESS,
            isClosable: true,
            position: CONFIG.TOAST.POSITION,
          });
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to load feedback";
        setError(errorMessage);

        toast({
          title: "Error Loading Feedback",
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

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilters((prev) => ({ ...prev, searchTerm: value }));
      }, CONFIG.DEBOUNCE.SEARCH_DELAY),
    []
  );

  // Event handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const openFeedbackModal = (feedbackItem: Feedback) => {
    setSelectedFeedback(feedbackItem);
    onOpen();
  };

  const clearFilters = () => {
    setFilters({
      rating: "all",
      sortBy: "newest",
      category: "all",
      searchTerm: "",
    });
  };

  // Effects
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" p={8}>
        <VStack spacing={8} align="stretch" maxW="7xl" mx="auto">
          {/* Header Skeleton */}
          <VStack spacing={4}>
            <Skeleton height="40px" width="300px" />
            <Skeleton height="20px" width="400px" />
          </VStack>

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

          {/* Feedback Skeleton */}
          <FeedbackSkeleton />
        </VStack>
      </Box>
    );
  }

  // Error state
  if (error && feedback.length === 0) {
    return (
      <Box bg={bgColor} minH="100vh" p={8}>
        <Center h="400px">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="300px"
            borderRadius="xl"
            maxW="md"
          >
            <AlertIcon as={AlertCircle} boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Failed to load feedback!
            </AlertTitle>
            <AlertDescription maxWidth="sm" mb={4}>
              {error}
            </AlertDescription>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => fetchFeedback()}
              leftIcon={<RefreshCw size={16} />}
            >
              Try Again
            </Button>
          </Alert>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" p={8}>
      <VStack spacing={8} align="stretch" maxW="7xl" mx="auto">
        {/* Header */}
        <VStack spacing={4}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HStack justify="center" spacing={3} mb={2}>
              <Icon as={MessageCircle} color="blue.500" boxSize={8} />
              <Heading size="xl" fontWeight="800">
                User Feedback
              </Heading>
            </HStack>
            <Text fontSize="md" color="gray.600" maxW="2xl">
              Real experiences and insights from our valued community members
            </Text>
          </motion.div>
        </VStack>

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
                  <StatLabel fontSize="sm">Total Feedback</StatLabel>
                  <Icon as={BarChart3} color="blue.500" boxSize={4} />
                </HStack>
                <StatNumber fontSize="2xl" fontWeight="700">
                  {feedbackStats.total}
                </StatNumber>
                <StatHelpText mb={0}>
                  <StatArrow type="increase" />
                  {feedbackStats.recentCount} this week
                </StatHelpText>
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
                  <StatLabel fontSize="sm">Average Rating</StatLabel>
                  <Icon as={Award} color="yellow.500" boxSize={4} />
                </HStack>
                <StatNumber fontSize="2xl" fontWeight="700">
                  {feedbackStats.averageRating.toFixed(1)}
                </StatNumber>
                <StatHelpText mb={0}>
                  <StarRating
                    rating={Math.round(feedbackStats.averageRating)}
                    size={14}
                  />
                </StatHelpText>
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
                  <StatLabel fontSize="sm">Satisfaction</StatLabel>
                  <Icon as={TrendingUp} color="green.500" boxSize={4} />
                </HStack>
                <StatNumber fontSize="2xl" fontWeight="700">
                  {feedbackStats.positivePercentage.toFixed(0)}%
                </StatNumber>
                <StatHelpText mb={0}>4+ star ratings</StatHelpText>
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
                  <StatLabel fontSize="sm">Recent Activity</StatLabel>
                  <Icon as={Clock} color="purple.500" boxSize={4} />
                </HStack>
                <StatNumber fontSize="2xl" fontWeight="700">
                  {feedbackStats.recentCount}
                </StatNumber>
                <StatHelpText mb={0}>Last 7 days</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters and Controls */}
        <Card
          bg={cardBg}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
        >
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <HStack spacing={3}>
                  <Icon as={Filter} color="blue.500" boxSize={5} />
                  <Heading size="md">Filters & Search</Heading>
                </HStack>

                <HStack spacing={2}>
                  <Button
                    leftIcon={<RefreshCw size={16} />}
                    variant="outline"
                    size="sm"
                    onClick={() => fetchFeedback(true)}
                    isLoading={isRefreshing}
                    borderRadius="lg"
                  >
                    Refresh
                  </Button>

                  {(filters.rating !== "all" ||
                    filters.category !== "all" ||
                    filters.searchTerm) && (
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

              <Flex
                direction={{ base: "column", md: "row" }}
                gap={4}
                wrap="wrap"
              >
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <Search size={16} color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search feedback..."
                    onChange={handleSearch}
                    borderRadius="lg"
                    bg={useColorModeValue("white", "gray.700")}
                  />
                </InputGroup>

                <Select
                  value={filters.rating}
                  onChange={(e) =>
                    handleFilterChange(
                      "rating",
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
                  maxW="150px"
                  borderRadius="lg"
                  bg={useColorModeValue("white", "gray.700")}
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </Select>

                {categories.length > 0 && (
                  <Select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    maxW="150px"
                    borderRadius="lg"
                    bg={useColorModeValue("white", "gray.700")}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                )}

                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDown size={16} />}
                    variant="outline"
                    borderRadius="lg"
                    minW="150px"
                  >
                    <HStack spacing={2}>
                      <SortDesc size={16} />
                      <Text>Sort by</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList borderRadius="xl">
                    <MenuItem
                      onClick={() => handleFilterChange("sortBy", "newest")}
                    >
                      Newest First
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleFilterChange("sortBy", "oldest")}
                    >
                      Oldest First
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        handleFilterChange("sortBy", "rating-high")
                      }
                    >
                      Highest Rating
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleFilterChange("sortBy", "rating-low")}
                    >
                      Lowest Rating
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>

              {/* Active Filters */}
              {(filters.rating !== "all" ||
                filters.category !== "all" ||
                filters.searchTerm) && (
                <Wrap>
                  {filters.rating !== "all" && (
                    <WrapItem>
                      <Tag size="md" colorScheme="blue" borderRadius="full">
                        <TagLabel>{filters.rating} Stars</TagLabel>
                        <TagCloseButton
                          onClick={() => handleFilterChange("rating", "all")}
                        />
                      </Tag>
                    </WrapItem>
                  )}
                  {filters.category !== "all" && (
                    <WrapItem>
                      <Tag size="md" colorScheme="green" borderRadius="full">
                        <TagLabel>{filters.category}</TagLabel>
                        <TagCloseButton
                          onClick={() => handleFilterChange("category", "all")}
                        />
                      </Tag>
                    </WrapItem>
                  )}
                  {filters.searchTerm && (
                    <WrapItem>
                      <Tag size="md" colorScheme="purple" borderRadius="full">
                        <TagLabel>"{filters.searchTerm}"</TagLabel>
                        <TagCloseButton
                          onClick={() => handleFilterChange("searchTerm", "")}
                        />
                      </Tag>
                    </WrapItem>
                  )}
                </Wrap>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Feedback Results */}
        {filteredAndSortedFeedback.length === 0 ? (
          <Center minH="400px">
            <VStack spacing={6}>
              <Icon as={MessageCircle} boxSize={16} color="gray.400" />
              <VStack spacing={2}>
                <Heading size="lg" color="gray.500">
                  {feedback.length === 0
                    ? "No Feedback Yet"
                    : "No Matching Feedback"}
                </Heading>
                <Text color="gray.500" textAlign="center" maxW="md">
                  {feedback.length === 0
                    ? "Be the first to share your experience and help others!"
                    : "Try adjusting your filters or search terms to find more feedback."}
                </Text>
              </VStack>
              {feedback.length > 0 && (
                <Button
                  onClick={clearFilters}
                  colorScheme="blue"
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              )}
            </VStack>
          </Center>
        ) : (
          <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
              <Text color="gray.600" fontSize="sm">
                Showing {filteredAndSortedFeedback.length} of {feedback.length}{" "}
                feedback entries
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              <AnimatePresence>
                {filteredAndSortedFeedback.map((item, index) => (
                  <FeedbackCard
                    key={item._id}
                    feedback={item}
                    index={index}
                    onOpen={openFeedbackModal}
                  />
                ))}
              </AnimatePresence>
            </SimpleGrid>
          </VStack>
        )}
      </VStack>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size={isMobile ? "full" : "xl"}
          motionPreset="slideInBottom"
        >
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent borderRadius="xl" mx={isMobile ? 0 : 4}>
            <ModalHeader borderBottom="1px" borderColor={borderColor}>
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Text fontSize="lg" fontWeight="700">
                    Detailed Feedback
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Submitted {formatTimeAgo(selectedFeedback.createdAt)}
                  </Text>
                </VStack>
                <Badge
                  colorScheme={getRatingColor(selectedFeedback.rating)}
                  variant="solid"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  {selectedFeedback.rating}/5 Stars
                </Badge>
              </Flex>
            </ModalHeader>

            <ModalBody py={6}>
              <VStack spacing={6} align="stretch">
                <VStack spacing={4} align="start">
                  <StarRating rating={selectedFeedback.rating} size={24} />

                  <Box>
                    <Text fontWeight="600" mb={2}>
                      Feedback:
                    </Text>
                    <Text color="gray.700" lineHeight="tall" fontSize="md">
                      {selectedFeedback.review}
                    </Text>
                  </Box>
                </VStack>

                <Divider />

                <HStack justify="space-between" wrap="wrap" gap={4}>
                  {selectedFeedback.userName ? (
                    <HStack spacing={2}>
                      <Icon as={User} color="blue.500" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="600" color="blue.600">
                          {selectedFeedback.userName}
                        </Text>
                        {selectedFeedback.userEmail && (
                          <Text fontSize="xs" color="gray.500">
                            {selectedFeedback.userEmail}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      Anonymous Feedback
                    </Text>
                  )}

                  <VStack align="end" spacing={1}>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(selectedFeedback.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </Text>
                    {selectedFeedback.category && (
                      <Badge
                        colorScheme="purple"
                        variant="subtle"
                        borderRadius="full"
                      >
                        {selectedFeedback.category}
                      </Badge>
                    )}
                  </VStack>
                </HStack>

                {selectedFeedback.replies &&
                  selectedFeedback.replies.length > 0 && (
                    <>
                      <Divider />
                      <VStack spacing={4} align="stretch">
                        <Text fontWeight="600">Admin Replies:</Text>
                        {selectedFeedback.replies.map((reply) => (
                          <Box
                            key={reply._id}
                            bg={useColorModeValue("blue.50", "blue.900/20")}
                            p={4}
                            borderRadius="lg"
                          >
                            <VStack spacing={2} align="start">
                              <Text fontSize="sm" lineHeight="tall">
                                {reply.message}
                              </Text>
                              <Flex justify="space-between" w="full">
                                <Text
                                  fontSize="xs"
                                  color="blue.600"
                                  fontWeight="500"
                                >
                                  {reply.adminName}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {formatTimeAgo(reply.createdAt)}
                                </Text>
                              </Flex>
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </>
                  )}
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px" borderColor={borderColor} gap={3}>
              <Button variant="outline" onClick={onClose} borderRadius="lg">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default Feedback;
