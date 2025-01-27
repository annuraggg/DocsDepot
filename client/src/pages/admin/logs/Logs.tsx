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
  Tag,
  Text,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  Stack,
  Divider,
  Tooltip,
  useColorModeValue,
  Select,
  HStack,
  ButtonGroup,
} from "@chakra-ui/react";
import {
  Search,
  Download,
  ChevronDown,
  Trash2,
  RefreshCcw,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Loader from "@/components/Loader";
import debounce from "lodash/debounce";
import jsPDF from "jspdf";
import useAxios from "@/config/axios";

enum LogLevel {
  ERROR = "error",
  WARN = "warning",
  INFO = "info",
  DEBUG = "debug",
}

interface LogLine {
  time: string;
  message: string;
  level: LogLevel;
}

interface LogEntryProps {
  log: LogLine;
  isNew?: boolean;
}

interface FilterOptions {
  level: LogLevel | "all";
  dateRange: "all" | "today" | "yesterday" | "week" | "month";
}

const ITEMS_PER_PAGE = 50;

const getLogLevel = (message: string): LogLevel => {
  const lowerMessage = message?.toLowerCase() || "";
  if (lowerMessage.includes("error")) return LogLevel.ERROR;
  if (lowerMessage.includes("warn")) return LogLevel.WARN;
  if (lowerMessage.includes("debug")) return LogLevel.DEBUG;
  return LogLevel.INFO;
};

const LogEntry: React.FC<LogEntryProps> = ({ log, isNew }) => {
  const bgHover = useColorModeValue("gray.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  const colorScheme = {
    [LogLevel.ERROR]: "red",
    [LogLevel.WARN]: "orange",
    [LogLevel.INFO]: "blue",
    [LogLevel.DEBUG]: "gray",
  }[log.level];

  return (
    <Box
      className={`p-3 hover:bg-${bgHover} border-b border-${borderColor} transition-colors duration-200 ${isNew ? "animate-highlight" : ""
        }`}
    >
      <Flex align="center" gap={4}>
        <Tag
          size="sm"
          colorScheme={colorScheme}
          className="w-16 justify-center font-medium"
        >
          {log.level.toUpperCase()}
        </Tag>
        <Flex
          align="center"
          gap={2}
          className="text-gray-500 text-sm font-mono"
        >
          <Calendar className="w-4 h-4" />
          {log.time}
        </Flex>
        <Text className="flex-1 font-medium">{log.message}</Text>
      </Flex>
    </Box>
  );
};

const Logs: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<FilterOptions>({
    level: "all",
    dateRange: "all",
  });
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const axios = useAxios();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Memoized filter function
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Apply level filter
    if (filters.level !== "all") {
      filtered = filtered.filter((log) => log.level === filters.level);
    }

    // Apply date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    switch (filters.dateRange) {
      case "today":
        filtered = filtered.filter((log) => new Date(log.time) >= today);
        break;
      case "yesterday":
        filtered = filtered.filter((log) => {
          const logDate = new Date(log.time);
          return logDate >= yesterday && logDate < today;
        });
        break;
      case "week":
        filtered = filtered.filter((log) => new Date(log.time) >= weekAgo);
        break;
      case "month":
        filtered = filtered.filter((log) => new Date(log.time) >= monthAgo);
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

    return filtered;
  }, [logs, filters, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/logs");

      const logLines: LogLine[] = res.data.data
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string) => {
          const parts = line.split("] ");
          const time = parts[0] || "";
          const message = parts[1] || "";
          return {
            time: time.length > 0 ? time + "]" : "",
            message,
            level: getLogLevel(message),
          };
        });
      setLogs(logLines);
      setCurrentPage(1);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong";
      console.error("Error fetching logs:", errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [axios, toast]);

  useEffect(() => {
    fetchLogs();
  }, []);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
      }, 300),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    debouncedSearch(e.target.value.toLowerCase());
  };

  const handleFilterChange = (
    filterType: keyof FilterOptions,
    value: FilterOptions[keyof FilterOptions]
  ) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const deleteLogs = async () => {
    try {
      setIsDeleting(true);
      const res = await axios.delete("/admin/logs/");
      if (res.data.data.success) {
        toast({
          title: "Logs cleared",
          description: "All server logs have been successfully deleted.",
          status: "success",
          duration: 3000,
        });
        setLogs([]);
        onClose();
      }
    } catch (err) {
      const error = err as Error;
      const errorMessage =
        (err as any).response?.data?.message ||
        "Failed to delete logs: " + error.message;
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const exportAsPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Server Logs Report", 20, 20);

      // Add metadata
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
      doc.text(`Total Logs: ${filteredLogs.length}`, 20, 40);

      doc.setFontSize(10);
      let y = 60;

      filteredLogs.forEach(({ time, message, level }) => {
        const text = `[${level.toUpperCase()}] ${time} ${message}`;
        const splitText = doc.splitTextToSize(text, 180);
        doc.text(splitText, 20, y);
        y += splitText.length * 7;

        if (y >= 280) {
          doc.addPage();
          y = 20;
        }
      });

      doc.save("server-logs.pdf");

      toast({
        title: "Export successful",
        description: "Logs have been exported to PDF",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export logs to PDF",
        status: "error",
        duration: 3000,
      });
    }
  };

  const exportAsTXT = () => {
    try {
      const text = filteredLogs
        .map(
          ({ time, message, level }) =>
            `[${level.toUpperCase()}] ${time} ${message}`
        )
        .join("\n");

      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "server-logs.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Logs have been exported to TXT",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export logs to TXT",
        status: "error",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Card className="shadow-xl" bg={cardBg}>
      <CardBody className="p-6">
        <Stack spacing={6}>
          <Flex className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <Stack spacing={2}>
              <Heading size="lg" className="text-gray-800">
                Server Logs
              </Heading>
              <Text className="text-gray-500">
                Showing {paginatedLogs.length} of {filteredLogs.length} logs
              </Text>
            </Stack>

            <Stack direction="row" spacing={3} className="w-full md:w-auto">
              <HStack spacing={2}>
                <Select
                  value={filters.level}
                  onChange={(e) =>
                    handleFilterChange(
                      "level",
                      e.target.value as LogLevel | "all"
                    )
                  }
                  width="120px"
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
                  width="120px"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </Select>

                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <Search className="w-4 h-4 text-gray-400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search logs..."
                    onChange={handleSearch}
                    defaultValue={searchTerm}
                    variant="filled"
                    className="shadow-sm"
                  />
                </InputGroup>
              </HStack>

              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDown className="w-4 h-4" />}
                  colorScheme="blue"
                  className="w-36 shadow-sm"
                >
                  Export
                </MenuButton>
                <MenuList>
                  <MenuItem
                    icon={<Download className="w-4 h-4" />}
                    onClick={exportAsPDF}
                  >
                    Export as PDF
                  </MenuItem>
                  <MenuItem
                    icon={<Download className="w-4 h-4" />}
                    onClick={exportAsTXT}
                  >
                    Export as TXT
                  </MenuItem>
                  <MenuItem
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => window.print()}
                  >
                    Print Logs
                  </MenuItem>
                </MenuList>
              </Menu>

              <Tooltip label="Clear all logs" placement="top">
                <Button
                  colorScheme="red"
                  variant="ghost"
                  onClick={onOpen}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  className="hover:bg-red-50"
                >
                  Clear
                </Button>
              </Tooltip>

              <Tooltip label="Refresh logs" placement="top">
                <Button
                  variant="ghost"
                  onClick={fetchLogs}
                  leftIcon={<RefreshCcw className="w-4 h-4" />}
                  className="hover:bg-blue-50"
                >
                  Refresh
                </Button>
              </Tooltip>
            </Stack>
          </Flex>

          <Divider />

          <Box
            className="log-container h-96 overflow-y-auto rounded-lg border"
            borderColor={borderColor}
          >
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log, index) => (
                <LogEntry
                  key={index}
                  log={log}
                  isNew={index === paginatedLogs.length - 1}
                />
              ))
            ) : (
              <Flex className="h-full items-center justify-center text-gray-500">
                <Stack direction="row" spacing={2} align="center">
                  <AlertCircle className="w-5 h-5" />
                  <Text>
                    {searchTerm ||
                      filters.level !== "all" ||
                      filters.dateRange !== "all"
                      ? "No logs match your criteria"
                      : "No logs found"}
                  </Text>
                </Stack>
              </Flex>
            )}
          </Box>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Flex justify="center" align="center" gap={4}>
              <ButtonGroup size="sm" variant="outline">
                <Button
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  isDisabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  isDisabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </ButtonGroup>
              <Text fontSize="sm" color="gray.500">
                Page {currentPage} of {totalPages}
              </Text>
            </Flex>
          )}
        </Stack>
      </CardBody>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear All Logs?
            </AlertDialogHeader>
            <AlertDialogBody>
              This action cannot be undone. All logs will be permanently
              deleted.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={deleteLogs}
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Card>
  );
};

export default Logs;
