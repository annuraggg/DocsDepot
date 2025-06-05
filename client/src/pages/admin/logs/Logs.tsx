import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Badge,
  Text,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Divider,
  Tooltip,
  useColorModeValue,
  Select,
  ButtonGroup,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  SkeletonText,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  SimpleGrid,
  Center,
  Spinner,
} from "@chakra-ui/react";
import {
  Search,
  Download,
  ChevronDown,
  Trash2,
  RefreshCw,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Database,
  AlertTriangle,
  Info,
  Bug,
  Eye,
  MoreVertical,
} from "lucide-react";
import debounce from "lodash/debounce";
import jsPDF from "jspdf";
import useAxios from "@/config/axios";

// Enhanced enums and interfaces
enum LogLevel {
  ERROR = "error",
  WARN = "warning",
  INFO = "info",
  DEBUG = "debug",
}

interface LogLine {
  id: string;
  time: string;
  message: string;
  level: LogLevel;
  timestamp: Date;
  component?: string;
  userId?: string;
}

interface LogEntryProps {
  log: LogLine;
  isNew?: boolean;
  searchTerm?: string;
}

interface FilterOptions {
  level: LogLevel | "all";
  dateRange: "all" | "today" | "yesterday" | "week" | "month";
  component?: string;
}

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  debug: number;
}

// Configuration constants
const CONFIG = {
  PAGINATION: {
    ITEMS_PER_PAGE: 50,
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
  LOG: {
    HEIGHT: "500px",
    REFRESH_INTERVAL: 30000, // 30 seconds
  },
} as const;

// Enhanced utility functions
const getLogLevel = (message: string): LogLevel => {
  const lowerMessage = message?.toLowerCase() || "";
  if (lowerMessage.includes("error") || lowerMessage.includes("fail"))
    return LogLevel.ERROR;
  if (lowerMessage.includes("warn") || lowerMessage.includes("warning"))
    return LogLevel.WARN;
  if (lowerMessage.includes("debug")) return LogLevel.DEBUG;
  return LogLevel.INFO;
};

const getLogIcon = (level: LogLevel) => {
  switch (level) {
    case LogLevel.ERROR:
      return AlertTriangle;
    case LogLevel.WARN:
      return AlertCircle;
    case LogLevel.DEBUG:
      return Bug;
    case LogLevel.INFO:
    default:
      return Info;
  }
};

const getLogColorScheme = (level: LogLevel): string => {
  switch (level) {
    case LogLevel.ERROR:
      return "red";
    case LogLevel.WARN:
      return "orange";
    case LogLevel.DEBUG:
      return "gray";
    case LogLevel.INFO:
    default:
      return "blue";
  }
};

const highlightSearchTerm = (
  text: string,
  searchTerm?: string
): React.ReactNode => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <Box
        key={index}
        as="mark"
        bg="yellow.200"
        color="yellow.800"
        px={1}
        borderRadius="sm"
        fontWeight="600"
      >
        {part}
      </Box>
    ) : (
      part
    )
  );
};

const formatTimestamp = (time: string): string => {
  try {
    const date = new Date(time.replace(/[\[\]]/g, ""));
    return date.toLocaleString();
  } catch {
    return time;
  }
};

// Enhanced LogEntry component
const LogEntry: React.FC<LogEntryProps> = ({ log, isNew, searchTerm }) => {
  const bgHover = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.100", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const timeColor = useColorModeValue("gray.500", "gray.400");

  const colorScheme = getLogColorScheme(log.level);
  const LogIcon = getLogIcon(log.level);

  return (
    <Box
      p={4}
      _hover={{ bg: bgHover }}
      borderBottom="1px"
      borderColor={borderColor}
      transition="all 0.2s ease"
      bg={isNew ? useColorModeValue("blue.50", "blue.900/20") : "transparent"}
      position="relative"
    >
      {isNew && (
        <Box
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          w={1}
          bg="blue.400"
          borderRadius="0 2px 2px 0"
        />
      )}

      <HStack spacing={4} align="start">
        <Badge
          colorScheme={colorScheme}
          variant="subtle"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="600"
          minW="80px"
          textAlign="center"
        >
          <HStack spacing={1}>
            <Icon as={LogIcon} boxSize={3} />
            <Text>{log.level.toUpperCase()}</Text>
          </HStack>
        </Badge>

        <VStack align="start" spacing={1} flex={1} minW={0}>
          <HStack spacing={2} color={timeColor} fontSize="sm" fontFamily="mono">
            <Icon as={Calendar} boxSize={4} />
            <Text>{formatTimestamp(log.time)}</Text>
          </HStack>

          <Text
            color={textColor}
            fontSize="sm"
            wordBreak="break-word"
            lineHeight="1.5"
          >
            {highlightSearchTerm(log.message, searchTerm)}
          </Text>
        </VStack>

        <Menu>
          <MenuButton
            as={IconButton}
            icon={<MoreVertical size={14} />}
            variant="ghost"
            size="sm"
            borderRadius="lg"
            opacity={0.6}
            _hover={{ opacity: 1 }}
          />
          <MenuList borderRadius="xl" fontSize="sm">
            <MenuItem icon={<Eye size={14} />}>View Details</MenuItem>
            <MenuItem icon={<FileText size={14} />}>Copy Message</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Box>
  );
};

// Loading skeleton component
const LogsSkeleton: React.FC = () => (
  <VStack spacing={4} align="stretch">
    {Array.from({ length: 8 }).map((_, i) => (
      <HStack key={i} spacing={4} p={4}>
        <Skeleton height="24px" width="80px" borderRadius="full" />
        <VStack align="start" spacing={2} flex={1}>
          <Skeleton height="16px" width="200px" />
          <SkeletonText noOfLines={1} spacing="2" width="100%" />
        </VStack>
      </HStack>
    ))}
  </VStack>
);

// Main Logs Component
const Logs: React.FC = () => {
  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<FilterOptions>({
    level: "all",
    dateRange: "all",
  });
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // Refs and hooks
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const axios = useAxios();

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("gray.50", "gray.900");

  // Calculate log statistics - FIXED: Proper counting based on actual log levels
  const logStats: LogStats = useMemo(() => {
    return logs.reduce(
      (stats, log) => {
        stats.total++;
        switch (log.level) {
          case LogLevel.ERROR:
            stats.errors++;
            break;
          case LogLevel.WARN:
            stats.warnings++;
            break;
          case LogLevel.INFO:
            stats.info++;
            break;
          case LogLevel.DEBUG:
            stats.debug++;
            break;
        }
        return stats;
      },
      {
        total: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        debug: 0,
      } as LogStats
    );
  }, [logs]);

  // Enhanced filter function
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Apply level filter
    if (filters.level !== "all") {
      filtered = filtered.filter((log) => log.level === filters.level);
    }

    // Apply date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filters.dateRange) {
      case "today":
        filtered = filtered.filter((log) => log.timestamp >= today);
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        filtered = filtered.filter((log) => {
          return log.timestamp >= yesterday && log.timestamp < today;
        });
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter((log) => log.timestamp >= weekAgo);
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter((log) => log.timestamp >= monthAgo);
        break;
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          log.time.toLowerCase().includes(searchLower)
      );
    }

    return filtered.reverse(); // Show newest first
  }, [logs, filters, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredLogs.length / CONFIG.PAGINATION.ITEMS_PER_PAGE
  );
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * CONFIG.PAGINATION.ITEMS_PER_PAGE;
    return filteredLogs.slice(
      startIndex,
      startIndex + CONFIG.PAGINATION.ITEMS_PER_PAGE
    );
  }, [filteredLogs, currentPage]);

  // API functions
  const fetchLogs = useCallback(
    async (showRefreshToast = false) => {
      try {
        if (showRefreshToast) setIsRefreshing(true);
        else setLoading(true);

        const res = await axios.get("/logs");

        const logLines: LogLine[] = res.data.data
          .split("\n")
          .filter((line: string) => line.trim())
          .map((line: string, index: number) => {
            const parts = line.split("] ");
            const timeString = parts[0] || "";
            const message = parts.slice(1).join("] ") || line;
            const level = getLogLevel(message);

            // Parse timestamp
            let timestamp: Date;
            try {
              timestamp = new Date(timeString.replace(/[\[\]]/g, ""));
            } catch {
              timestamp = new Date();
            }

            return {
              id: `${timestamp.getTime()}-${index}`,
              time: timeString.includes("[") ? timeString + "]" : timeString,
              message,
              level,
              timestamp,
            };
          });

        setLogs(logLines);
        setCurrentPage(1);

        if (showRefreshToast) {
          toast({
            title: "Logs Refreshed",
            description: `Loaded ${logLines.length} log entries`,
            status: "success",
            duration: CONFIG.TOAST.DURATION.SUCCESS,
            isClosable: true,
            position: CONFIG.TOAST.POSITION,
          });
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch logs";
        console.error("Error fetching logs:", errorMessage);

        toast({
          title: "Error Loading Logs",
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

  // Effects
  useEffect(() => {
    fetchLogs();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, CONFIG.LOG.REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
      }, CONFIG.DEBOUNCE.SEARCH_DELAY),
    []
  );

  // Event handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (
    filterType: keyof FilterOptions,
    value: FilterOptions[keyof FilterOptions]
  ) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of logs
    document
      .querySelector(".log-container")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteLogs = async () => {
    try {
      setIsDeleting(true);
      const res = await axios.delete("/admin/logs/");

      if (res.data.data.success) {
        toast({
          title: "Logs Cleared",
          description: "All server logs have been successfully deleted",
          status: "success",
          duration: CONFIG.TOAST.DURATION.SUCCESS,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });
        setLogs([]);
        setCurrentPage(1);
        onClose();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete logs";

      toast({
        title: "Delete Failed",
        description: errorMessage,
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const exportAsPDF = () => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text("Server Logs Report", 20, 20);

      // Metadata
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
      doc.text(`Total Logs: ${filteredLogs.length}`, 20, 45);
      doc.text(
        `Filters: Level=${filters.level}, Range=${filters.dateRange}`,
        20,
        55
      );

      // Statistics
      doc.text(
        `Errors: ${logStats.errors} | Warnings: ${logStats.warnings} | Info: ${logStats.info} | Debug: ${logStats.debug}`,
        20,
        65
      );

      doc.setFontSize(10);
      let y = 80;

      filteredLogs.forEach(({ time, message, level }) => {
        const text = `[${level.toUpperCase()}] ${formatTimestamp(
          time
        )} ${message}`;
        const splitText = doc.splitTextToSize(text, 170);

        doc.text(splitText, 20, y);
        y += splitText.length * 6;

        if (y >= 280) {
          doc.addPage();
          y = 20;
        }
      });

      doc.save(`server-logs-${new Date().toISOString().split("T")[0]}.pdf`);

      toast({
        title: "Export Successful",
        description: "Logs exported to PDF successfully",
        status: "success",
        duration: CONFIG.TOAST.DURATION.SUCCESS,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export logs to PDF",
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    }
  };

  const exportAsTXT = () => {
    try {
      const header = `Server Logs Report
Generated: ${new Date().toLocaleString()}
Total Logs: ${filteredLogs.length}
Filters: Level=${filters.level}, Range=${filters.dateRange}
Statistics: Errors=${logStats.errors}, Warnings=${logStats.warnings}, Info=${
        logStats.info
      }, Debug=${logStats.debug}

${"=".repeat(80)}

`;

      const content = filteredLogs
        .map(
          ({ time, message, level }) =>
            `[${level.toUpperCase()}] ${formatTimestamp(time)} ${message}`
        )
        .join("\n");

      const fullContent = header + content;

      const blob = new Blob([fullContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `server-logs-${
        new Date().toISOString().split("T")[0]
      }.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Logs exported to TXT successfully",
        status: "success",
        duration: CONFIG.TOAST.DURATION.SUCCESS,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export logs to TXT",
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" p={8}>
        <Card
          bg={cardBg}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
        >
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={2}>
                  <Skeleton height="32px" width="200px" />
                  <Skeleton height="20px" width="300px" />
                </VStack>
                <HStack spacing={2}>
                  <Skeleton height="40px" width="120px" />
                  <Skeleton height="40px" width="120px" />
                  <Skeleton height="40px" width="100px" />
                </HStack>
              </HStack>
              <Divider />
              <LogsSkeleton />
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" p={8}>
      <VStack spacing={6} align="stretch">
        {/* Statistics Cards */}
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
                  <StatLabel fontSize="sm" color="gray.600">
                    Total Logs
                  </StatLabel>
                  <Icon as={Database} color="blue.500" boxSize={4} />
                </HStack>
                <StatNumber fontSize="2xl" fontWeight="700">
                  {logStats.total}
                </StatNumber>
                <StatHelpText mb={0}>
                  {filteredLogs.length !== logStats.total && (
                    <Text fontSize="xs">{filteredLogs.length} filtered</Text>
                  )}
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
                  <StatLabel fontSize="sm" color="gray.600">
                    Errors
                  </StatLabel>
                  <Icon as={AlertTriangle} color="red.500" boxSize={4} />
                </HStack>
                <StatNumber fontSize="2xl" fontWeight="700" color="red.500">
                  {logStats.errors}
                </StatNumber>
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
                  <StatLabel fontSize="sm" color="gray.600">
                    Warnings
                  </StatLabel>
                  <Icon as={AlertCircle} color="orange.500" boxSize={4} />
                </HStack>
                <StatNumber fontSize="2xl" fontWeight="700" color="orange.500">
                  {logStats.warnings}
                </StatNumber>
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
                  <StatLabel fontSize="sm" color="gray.600">
                    Info
                  </StatLabel>
                  <Icon as={Info} color="blue.500" boxSize={4} />
                </HStack>
                <StatNumber fontSize="2xl" fontWeight="700" color="blue.500">
                  {logStats.info}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Logs Card */}
        <Card
          bg={cardBg}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
        >
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              {/* Header */}
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "start", md: "center" }}
                gap={4}
              >
                <VStack align="start" spacing={1}>
                  <Heading size="lg">Server Logs</Heading>
                  <Text color="gray.600" fontSize="sm">
                    Showing {paginatedLogs.length} of {filteredLogs.length} logs
                    {searchTerm && ` matching "${searchTerm}"`}
                  </Text>
                </VStack>

                {/* Controls - FIXED: Better alignment */}
                <VStack
                  spacing={3}
                  align={{ base: "stretch", md: "end" }}
                  className="w-full"
                >
                  {/* Filters Row */}
                  <HStack
                    spacing={2}
                    wrap="wrap"
                    justify={{ base: "stretch", md: "end" }}
                    className="w-full"
                  >
                    <Select
                      value={filters.level}
                      onChange={(e) =>
                        handleFilterChange(
                          "level",
                          e.target.value as LogLevel | "all"
                        )
                      }
                      size="sm"
                      minW="120px"
                      maxW="140px"
                      borderRadius="lg"
                    >
                      <option value="all">All Levels</option>
                      {Object.values(LogLevel).map((level) => (
                        <option key={level} value={level}>
                          {level.toUpperCase()}
                        </option>
                      ))}
                    </Select>

                    <Select
                      value={filters.dateRange}
                      onChange={(e) =>
                        handleFilterChange(
                          "dateRange",
                          e.target.value as FilterOptions["dateRange"]
                        )
                      }
                      size="sm"
                      minW="120px"
                      maxW="140px"
                      borderRadius="lg"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </Select>

                    <InputGroup maxW="200px">
                      <InputLeftElement>
                        <Search size={16} color="gray" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search logs..."
                        onChange={handleSearch}
                        size="sm"
                        borderRadius="lg"
                      />
                    </InputGroup>
                  </HStack>

                  {/* Actions Row */}
                  <HStack
                    spacing={2}
                    wrap="wrap"
                    justify={{ base: "stretch", md: "end" }}
                  >
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDown size={14} />}
                        colorScheme="blue"
                        variant="outline"
                        size="sm"
                        borderRadius="lg"
                      >
                        Export
                      </MenuButton>
                      <MenuList borderRadius="xl" fontSize="sm">
                        <MenuItem
                          icon={<Download size={14} />}
                          onClick={exportAsPDF}
                        >
                          Export as PDF
                        </MenuItem>
                        <MenuItem
                          icon={<Download size={14} />}
                          onClick={exportAsTXT}
                        >
                          Export as TXT
                        </MenuItem>
                        <MenuItem
                          icon={<FileText size={14} />}
                          onClick={() => window.print()}
                        >
                          Print Logs
                        </MenuItem>
                      </MenuList>
                    </Menu>

                    <Tooltip
                      label={
                        autoRefresh
                          ? "Disable auto-refresh"
                          : "Enable auto-refresh"
                      }
                    >
                      <Button
                        variant={autoRefresh ? "solid" : "outline"}
                        colorScheme={autoRefresh ? "green" : "gray"}
                        leftIcon={<Activity size={14} />}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        size="sm"
                        borderRadius="lg"
                      >
                        {autoRefresh ? "Auto" : "Manual"}
                      </Button>
                    </Tooltip>

                    <Tooltip label="Refresh logs">
                      <IconButton
                        aria-label="Refresh logs"
                        icon={
                          isRefreshing ? (
                            <Spinner size="sm" />
                          ) : (
                            <RefreshCw size={14} />
                          )
                        }
                        variant="outline"
                        onClick={() => fetchLogs(true)}
                        isDisabled={isRefreshing}
                        size="sm"
                        borderRadius="lg"
                      />
                    </Tooltip>

                    <Tooltip label="Clear all logs">
                      <IconButton
                        aria-label="Clear logs"
                        icon={<Trash2 size={14} />}
                        colorScheme="red"
                        variant="outline"
                        onClick={onOpen}
                        size="sm"
                        borderRadius="lg"
                      />
                    </Tooltip>
                  </HStack>
                </VStack>
              </Flex>

              <Divider />

              {/* Logs Container */}
              <Box
                className="log-container"
                height={CONFIG.LOG.HEIGHT}
                overflowY="auto"
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                bg={useColorModeValue("gray.25", "gray.750")}
              >
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <LogEntry
                      key={log.id}
                      log={log}
                      searchTerm={searchTerm}
                      isNew={false}
                    />
                  ))
                ) : (
                  <Center h="full">
                    <VStack spacing={4}>
                      <Icon as={AlertCircle} boxSize={12} color="gray.400" />
                      <VStack spacing={1}>
                        <Text fontSize="lg" fontWeight="600" color="gray.500">
                          {searchTerm ||
                          filters.level !== "all" ||
                          filters.dateRange !== "all"
                            ? "No logs match your criteria"
                            : "No logs found"}
                        </Text>
                        <Text fontSize="sm" color="gray.400" textAlign="center">
                          {searchTerm ||
                          filters.level !== "all" ||
                          filters.dateRange !== "all"
                            ? "Try adjusting your filters or search terms"
                            : "Logs will appear here when the server generates them"}
                        </Text>
                      </VStack>
                      {(searchTerm ||
                        filters.level !== "all" ||
                        filters.dateRange !== "all") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("");
                            setFilters({ level: "all", dateRange: "all" });
                            setCurrentPage(1);
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </VStack>
                  </Center>
                )}
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Flex justify="center" align="center" gap={4}>
                  <ButtonGroup size="sm" variant="outline" spacing={1}>
                    <IconButton
                      aria-label="Previous page"
                      icon={<ChevronLeft size={16} />}
                      onClick={() =>
                        handlePageChange(Math.max(currentPage - 1, 1))
                      }
                      isDisabled={currentPage === 1}
                      borderRadius="lg"
                    />

                    {/* Page numbers */}
                    {Array.from({
                      length: Math.min(
                        totalPages,
                        CONFIG.PAGINATION.MAX_PAGES_DISPLAY
                      ),
                    }).map((_, i) => {
                      const page =
                        i +
                        Math.max(
                          1,
                          currentPage -
                            Math.floor(CONFIG.PAGINATION.MAX_PAGES_DISPLAY / 2)
                        );
                      if (page > totalPages) return null;

                      return (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={currentPage === page ? "solid" : "outline"}
                          colorScheme={currentPage === page ? "blue" : "gray"}
                          borderRadius="lg"
                          minW="40px"
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <IconButton
                      aria-label="Next page"
                      icon={<ChevronRight size={16} />}
                      onClick={() =>
                        handlePageChange(Math.min(currentPage + 1, totalPages))
                      }
                      isDisabled={currentPage === totalPages}
                      borderRadius="lg"
                    />
                  </ButtonGroup>

                  <Text fontSize="sm" color="gray.500">
                    Page {currentPage} of {totalPages}
                  </Text>
                </Flex>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="xl" mx={4}>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="700"
              borderBottom="1px"
              borderColor={borderColor}
            >
              <HStack spacing={3}>
                <Icon as={AlertTriangle} color="red.500" boxSize={5} />
                <Text>Clear All Logs?</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              <VStack spacing={4} align="start">
                <Text>
                  This action cannot be undone. All {logStats.total} logs will
                  be permanently deleted from the server.
                </Text>
                <Alert status="warning" borderRadius="lg" size="sm">
                  <AlertIcon boxSize={4} />
                  <Box>
                    <AlertTitle fontSize="sm">Warning!</AlertTitle>
                    <AlertDescription fontSize="sm">
                      This will delete all log history including error logs that
                      might be needed for debugging.
                    </AlertDescription>
                  </Box>
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
                onClick={onClose}
                variant="outline"
                borderRadius="lg"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={deleteLogs}
                isLoading={isDeleting}
                loadingText="Deleting..."
                leftIcon={<Trash2 size={16} />}
                borderRadius="lg"
              >
                Delete All Logs
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Logs;
