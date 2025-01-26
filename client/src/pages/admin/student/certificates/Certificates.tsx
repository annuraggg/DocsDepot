import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  HStack,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  useToast,
  Badge,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useDisclosure,
  Input,
  Stack,
  Checkbox,
  CheckboxGroup,
  FormLabel,
  FormControl,
  SimpleGrid,
  useBreakpointValue,
  InputGroup,
  InputLeftElement,
  VStack,
  IconButton,
  ModalFooter,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import {
  Award,
  Building2,
  Calendar,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { Certificate } from "@shared-types/Certificate";
import Loader from "@/components/Loader";
import useAxios from "@/config/axios";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

const StudentCertificates = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<
    Certificate[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    types: string[];
    levels: string[];
    status: string[];
    issueYears: string[];
    expiryYears: string[];
  }>({
    types: [],
    levels: [],
    status: [],
    issueYears: [],
    expiryYears: [],
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const axios = useAxios();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    axios
      .get("/certificates/student")
      .then((res) => {
        setCertificates(res.data.data);
        setFilteredCertificates(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = [...certificates];
    if (searchQuery) {
      result = result.filter((cert) =>
        cert.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.types.length > 0) {
      result = result.filter((cert) =>
        filters.types.includes(cert.type.toLowerCase())
      );
    }

    if (filters.levels.length > 0) {
      result = result.filter((cert) =>
        filters.levels.includes(cert.level.toLowerCase())
      );
    }

    if (filters.status.length > 0) {
      result = result.filter((cert) =>
        filters.status.includes((cert.status || "pending").toLowerCase())
      );
    }

    if (filters.issueYears.length > 0) {
      result = result.filter(() => false);
    }

    setFilteredCertificates(result);
  }, [certificates, searchQuery, filters]);

  const getLevelProps = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return { bg: "emerald.100", color: "emerald.800" };
      case "intermediate":
        return { bg: "orange.100", color: "orange.800" };
      case "advanced":
        return { bg: "red.100", color: "red.800" };
      default:
        return { bg: "gray.100", color: "gray.800" };
    }
  };

  const getTypeProps = (type: string) => {
    return type?.toLowerCase() === "internal"
      ? { bg: "blue.100", color: "blue.800" }
      : { bg: "purple.100", color: "purple.800" };
  };

  const getStatusProps = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { bg: "green.100", color: "green.800" };
      case "expired":
        return { bg: "red.100", color: "red.800" };
      case "pending":
        return { bg: "yellow.100", color: "yellow.800" };
      default:
        return { bg: "gray.100", color: "gray.800" };
    }
  };

  if (loading) return <Loader />;

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
          mb={6}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <Box textAlign={{ base: "center", md: "left" }}>
            <Heading size="lg" mb={2}>
              Student Certificates
            </Heading>
            <Text color="gray.600">
              Total Certificates: {filteredCertificates.length}
            </Text>
          </Box>
          <HStack spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Search size={18} />
              </InputLeftElement>
              <Input
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                w={{ base: "full", md: "300px" }}
                borderRadius="full"
              />
            </InputGroup>
            <Button
              leftIcon={<Filter size={18} />}
              onClick={onOpen}
              variant="outline"
              size="sm"
            >
              Filters
            </Button>
          </HStack>
        </Flex>
        <AnimatePresence>
          {isMobile ? (
            <SimpleGrid columns={1} spacing={4}>
              {filteredCertificates.map((cert) => (
                <MotionBox
                  key={cert._id}
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
                    <Box flex={1}>
                      <Flex align="center" mb={2}>
                        <Icon as={Award} color="green.500" boxSize={5} mr={2} />
                        <Text fontWeight="600" fontSize="sm">
                          {cert.name}
                        </Text>
                      </Flex>

                      <Flex wrap="wrap" gap={2} mb={2}>
                        <Badge
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                          fontSize="xs"
                          {...getTypeProps(cert.type)}
                        >
                          {cert.type?.charAt(0).toUpperCase() +
                            cert.type?.slice(1)}
                        </Badge>

                        <Badge
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                          fontSize="xs"
                          {...getLevelProps(cert.level)}
                        >
                          {cert.level?.charAt(0).toUpperCase() +
                            cert.level?.slice(1)}
                        </Badge>

                        <Badge
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                          fontSize="xs"
                          {...getStatusProps(cert.status)}
                        >
                          {(cert.status ?? "Pending")?.charAt(0).toUpperCase() +
                            (cert.status ?? "pending")?.slice(1)}
                        </Badge>
                      </Flex>

                      <VStack spacing={1} align="start">
                        <HStack>
                          <Icon as={Building2} color="gray.400" boxSize={4} />
                          <Text fontSize="sm" color="gray.600">
                            {cert.issuingOrganization}
                          </Text>
                        </HStack>

                        <HStack>
                          <Icon as={Calendar} color="blue.400" boxSize={4} />
                          <Text fontSize="sm" color="gray.600">
                            {cert?.issueDate?.month?.charAt(0)?.toUpperCase() +
                              cert?.issueDate?.month?.slice(1)}{" "}
                            {cert?.issueDate?.year}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>

                    <IconButton
                      aria-label="View certificate"
                      icon={<ChevronRight size={16} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => navigate(`/certificates/${cert._id}`)}
                    />
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
                    <Th>Sr No.</Th>
                    <Th>Certificate</Th>
                    <Th>Organization</Th>
                    <Th>Issue Date</Th>
                    <Th>Type</Th>
                    <Th>Level</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredCertificates.map((cert, index) => (
                    <Tr key={cert._id}>
                      <Td>{index + 1}</Td>
                      <Td>
                        <HStack>
                          <Icon as={Award} color="green.500" />
                          <Text>{cert.name}</Text>
                        </HStack>
                      </Td>
                      <Td>{cert.issuingOrganization}</Td>
                      <Td>
                        {cert?.issueDate?.month?.charAt(0)?.toUpperCase() +
                          cert?.issueDate?.month?.slice(1)}{" "}
                        {cert?.issueDate?.year}
                      </Td>
                      <Td>
                        <Badge {...getTypeProps(cert.type)}>
                          {cert.type?.charAt(0).toUpperCase() +
                            cert.type?.slice(1)}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge {...getLevelProps(cert.level)}>
                          {cert.level?.charAt(0).toUpperCase() +
                            cert.level?.slice(1)}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge {...getStatusProps(cert.status)}>
                          {(cert.status ?? "Pending")?.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          rightIcon={<ChevronRight size={16} />}
                          onClick={() => navigate(`/certificates/${cert._id}`)}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </AnimatePresence>
        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Filter Certificates</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Certificate Type</FormLabel>
                  <CheckboxGroup
                    value={filters.types}
                    onChange={(values) =>
                      setFilters({ ...filters, types: values as string[] })
                    }
                  >
                    <Stack>
                      <Checkbox value="internal">Internal</Checkbox>
                      <Checkbox value="external">External</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Level</FormLabel>
                  <CheckboxGroup
                    value={filters.levels}
                    onChange={(values) =>
                      setFilters({ ...filters, levels: values as string[] })
                    }
                  >
                    <Stack>
                      <Checkbox value="beginner">Beginner</Checkbox>
                      <Checkbox value="intermediate">Intermediate</Checkbox>
                      <Checkbox value="advanced">Advanced</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <CheckboxGroup
                    value={filters.status}
                    onChange={(values) =>
                      setFilters({ ...filters, status: values as string[] })
                    }
                  >
                    <Stack>
                      <Checkbox value="active">Active</Checkbox>
                      <Checkbox value="expired">Expired</Checkbox>
                      <Checkbox value="pending">Pending</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={() =>
                  setFilters({
                    types: [],
                    levels: [],
                    status: [],
                    issueYears: [],
                    expiryYears: [],
                  })
                }
              >
                Clear All
              </Button>
              <Button colorScheme="blue" onClick={onClose}>
                Apply
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </MotionBox>
    </Container>
  );
};

export default StudentCertificates;
