import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
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
  Select,
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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Textarea,
  Stack,
  Checkbox,
  CheckboxGroup,
  FormLabel,
  FormControl,
  useBreakpointValue,
  InputGroup,
  InputLeftElement,
  IconButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { Award, Building2, ChevronRight, Filter, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/components/Loader";
import { Certificate, Comment } from "@shared-types/Certificate";
import useUser from "@/config/user";
import useAxios from "@/config/axios";

const MotionBox = motion(Box);

const FacultyCertificates = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [pendingCertificates, _setPendingCertificates] = useState<Certificate[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
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
  const user = useUser();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose,
  } = useDisclosure();
  const toast = useToast();
  const axios = useAxios();

  useEffect(() => {
    setLoading(true);
    axios
      .get("/certificates/faculty")
      .then((res) => {
        setCertificates(res.data.data);
        setFilteredCertificates(res.data.data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to fetch certificates",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [update]);

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
      result = result.filter((cert) =>
        filters.issueYears.includes(cert.issueDate.year.toString())
      );
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

  const openCert = (cert: string) => {
    setSelectedCertificate(cert);
    onModalOpen();
  };

  const updateCert = () => {
    if (action === "") {
      toast({
        title: "Error",
        description: "Please select an action",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setUpdateLoading(true);
    axios
      .post("/admin/faculty/certificates/update", {
        id: selectedCertificate,
        action: action,
        comments: comments,
      })
      .then(() => {
        setUpdate(!update);
        onModalClose();
        toast({
          title: "Success",
          description: "Certificate status updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error("Update error:", err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to update certificate",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setUpdateLoading(false);
        setAction("");
        setComments([]);
      });
  };

  const CertificateTableComponent = ({ data }: { data: Certificate[] }) => (
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
            <Th>Type</Th>
            <Th>Level</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((cert, index) => (
            <Tr key={cert._id}>
              <Td>{index + 1}</Td>
              <Td>
                <HStack>
                  <Icon as={Award} color="green.500" />
                  <Text>{cert.name}</Text>
                </HStack>
              </Td>
              <Td>
                <HStack>
                  <Icon as={Building2} color="gray.400" />
                  <Text>{cert.issuingOrganization}</Text>
                </HStack>
              </Td>
              <Td>
                <Badge {...getTypeProps(cert.type)}>
                  {cert.type?.charAt(0).toUpperCase() + cert.type?.slice(1)}
                </Badge>
              </Td>
              <Td>
                <Badge {...getLevelProps(cert.level)}>
                  {cert.level?.charAt(0).toUpperCase() + cert.level?.slice(1)}
                </Badge>
              </Td>
              <Td>
                <Badge {...getStatusProps(cert.status)}>
                  {(cert.status ?? "Pending")?.charAt(0).toUpperCase() +
                    (cert.status ?? "pending")?.slice(1)}
                </Badge>
              </Td>
              <Td>
                <HStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    rightIcon={<ChevronRight />}
                    onClick={() => navigate(`/certificates/${cert._id}`)}
                  >
                    View
                  </Button>
                  {pendingCertificates.includes(cert) && (
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => openCert(cert._id)}
                    >
                      Review
                    </Button>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );

  const CertificateCard = ({ cert }: { cert: Certificate; index: number }) => (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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

          <Flex align="center" mb={2}>
            <Icon as={Building2} color="gray.400" boxSize={5} mr={2} />
            <Text fontSize="sm" color="gray.600">
              {cert.issuingOrganization}
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
              {cert.type?.charAt(0).toUpperCase() + cert.type?.slice(1)}
            </Badge>
            <Badge
              px={2.5}
              py={0.5}
              borderRadius="full"
              fontSize="xs"
              {...getLevelProps(cert.level)}
            >
              {cert.level?.charAt(0).toUpperCase() + cert.level?.slice(1)}
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
        </Box>
        <HStack spacing={2}>
          <IconButton
            aria-label="View certificate"
            icon={<ChevronRight size={16} />}
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={() => navigate(`/certificates/${cert._id}`)}
          />
          {pendingCertificates.includes(cert) && (
            <Button
              size="sm"
              colorScheme="green"
              onClick={() => openCert(cert._id)}
            >
              Review
            </Button>
          )}
        </HStack>
      </Flex>
    </MotionBox>
  );

  if (loading) return <Loader />;

  return (
    <Container maxW="container.xl" p={{ base: 4, md: 8 }}>
      {loading ? (
        <Flex justify="center" align="center" minH="200px">
          <Loader />
        </Flex>
      ) : (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs variant="soft-rounded" colorScheme="green">
            <Flex
              justify="space-between"
              align="center"
              mb={6}
              direction={{ base: "column", md: "row" }}
              gap={4}
            >
              <TabList>
                <Tab>All Certificates</Tab>
                <Tab>
                  Pending Review
                  {pendingCertificates.length > 0 && (
                    <Badge ml={2} colorScheme="red">
                      {pendingCertificates.length}
                    </Badge>
                  )}
                </Tab>
              </TabList>

              <InputGroup maxW={{ base: "full", md: "300px" }} size="sm">
                <InputLeftElement pointerEvents="none">
                  <Search size={18} />
                </InputLeftElement>
                <Input
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="full"
                  bg="white"
                />
              </InputGroup>
            </Flex>

            <TabPanels>
              <TabPanel px={0}>
                <Flex justify="end" mb={4}>
                  <Button
                    leftIcon={<Filter size={16} />}
                    onClick={onFilterOpen}
                    size="sm"
                    variant="outline"
                  >
                    Filters
                  </Button>
                </Flex>

                <AnimatePresence>
                  {isMobile ? (
                    <SimpleGrid columns={1} spacing={4}>
                      {filteredCertificates.map((cert, index) => (
                        <CertificateCard
                          key={cert._id}
                          cert={cert}
                          index={index}
                        />
                      ))}
                    </SimpleGrid>
                  ) : (
                    <CertificateTableComponent data={filteredCertificates} />
                  )}
                </AnimatePresence>
              </TabPanel>

              <TabPanel px={0}>
                <AnimatePresence>
                  {isMobile ? (
                    <SimpleGrid columns={1} spacing={4}>
                      {pendingCertificates.map((cert, index) => (
                        <CertificateCard
                          key={cert._id}
                          cert={cert}
                          index={index}
                        />
                      ))}
                    </SimpleGrid>
                  ) : (
                    <CertificateTableComponent data={pendingCertificates} />
                  )}
                </AnimatePresence>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Modal
            isOpen={isModalOpen}
            onClose={onModalClose}
            size={{ base: "full", md: "md" }}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Review Certificate</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={4}>
                  <Select
                    placeholder="Choose an action"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    size="sm"
                  >
                    <option value="approved">Accept Certificate</option>
                    <option value="rejected">Reject Certificate</option>
                  </Select>

                  <Textarea
                    placeholder="Add your comments..."
                    value={comments[0]?.comment || ""}
                    onChange={(e) =>
                      setComments([
                        {
                          comment: e.target.value,
                          user: user?._id!,
                        },
                      ])
                    }
                    size="sm"
                    minH="120px"
                  />
                </Stack>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="outline"
                  mr={3}
                  onClick={onModalClose}
                  size="sm"
                  isDisabled={updateLoading}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="green"
                  onClick={updateCert}
                  size="sm"
                  isLoading={updateLoading}
                  loadingText="Submitting..."
                >
                  Submit
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Modal
            isOpen={isFilterOpen}
            onClose={onFilterClose}
            size={{ base: "full", md: "md" }}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Filter Certificates</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
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
                  size="sm"
                  variant="outline"
                  mr={3}
                  onClick={onFilterClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </MotionBox>
      )}
    </Container>
  );
};

export default FacultyCertificates;