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
  FormControl
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { Award, Building2, Calendar, ChevronRight, Filter } from "lucide-react";
import { Certificate } from "@shared-types/Certificate";
import Loader from "@/components/Loader";
import useAxios from "@/config/axios";

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
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
      result = result.filter((cert) => filters.types.includes(cert.type.toLowerCase()));
    }

    if (filters.levels.length > 0) {
      result = result.filter((cert) => filters.levels.includes(cert.level.toLowerCase()));
    }

    if (filters.status.length > 0) {
      result = result.filter((cert) => 
        filters.status.includes((cert.status || 'pending').toLowerCase())
      );
    }

    if (filters.issueYears.length > 0) {
      result = result.filter((cert) => 
        filters.issueYears.includes(cert.issueDate.year.toString())
      );
    }

    if (filters.expiryYears.length > 0) {
      result = result.filter((cert) => 
        false
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

  if (loading) return <Loader />;

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg">Student Certificates</Heading>
          <Text color="gray.600" mt={2}>
            Total Certificates: {filteredCertificates.length}
          </Text>
        </Box>
        <HStack spacing={4}>
          <Input
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            w="300px"
          />
          <Button
            leftIcon={<Icon as={Filter} />}
            onClick={onOpen}
            colorScheme="blue"
            variant="ghost"
          >
            Filters
          </Button>
        </HStack>
      </Flex>

      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        border="1px"
        borderColor="gray.200"
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr bg="gray.50" borderBottom="1px" borderColor="gray.200">
                <Th py={4} px={6} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                  Sr No.
                </Th>
                <Th py={4} px={6} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                  Certificate
                </Th>
                <Th py={4} px={6} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                  Organization
                </Th>
                <Th py={4} px={6} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                  Issue Date
                </Th>
                <Th py={4} px={6} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                  Type
                </Th>
                <Th py={4} px={6} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                  Level
                </Th>
                <Th py={4} px={6} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                  Status
                </Th>
                <Th py={4} px={6} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCertificates.map((cert, index) => (
                <Tr
                  key={cert._id}
                  _hover={{ bg: "gray.50" }}
                  transition="background 0.15s"
                  borderBottom="1px"
                  borderColor="gray.200"
                >
                  <Td py={4} px={6} fontSize="sm" color="gray.900">
                    {index + 1}
                  </Td>
                  <Td py={4} px={6}>
                    <HStack spacing={2}>
                      <Icon as={Award} color="green.500" boxSize={5} />
                      <Text fontSize="sm" fontWeight="medium" color="gray.900">
                        {cert.name}
                      </Text>
                    </HStack>
                  </Td>
                  <Td py={4} px={6}>
                    <HStack spacing={2}>
                      <Icon as={Building2} color="gray.400" boxSize={5} />
                      <Text fontSize="sm" color="gray.600">
                        {cert.issuingOrganization}
                      </Text>
                    </HStack>
                  </Td>
                  <Td py={4} px={6}>
                    <HStack spacing={2}>
                      <Icon as={Calendar} color="blue.400" boxSize={5} />
                      <Text fontSize="sm" color="gray.600">
                        {cert?.issueDate?.month?.charAt(0)?.toUpperCase() +
                          cert?.issueDate?.month?.slice(1)}{" "}
                        {cert?.issueDate?.year}
                      </Text>
                    </HStack>
                  </Td>
                  <Td py={4} px={6}>
                    <Badge
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      fontSize="xs"
                      textTransform="initial"
                      fontWeight="medium"
                      {...getTypeProps(cert.type)}
                    >
                      {cert.type?.charAt(0).toUpperCase() + cert.type?.slice(1)}
                    </Badge>
                  </Td>
                  <Td py={4} px={6}>
                    <Badge
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      fontSize="xs"
                      textTransform="initial"
                      fontWeight="medium"
                      {...getLevelProps(cert.level)}
                    >
                      {cert.level?.charAt(0).toUpperCase() + cert.level?.slice(1)}
                    </Badge>
                  </Td>
                  <Td py={4} px={6}>
                    <Badge
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="medium"
                      textTransform="initial"
                      {...getStatusProps(cert.status)}
                    >
                      {(cert.status ?? "Pending")?.charAt(0).toUpperCase() +
                        (cert.status ?? "pending")?.slice(1)}
                    </Badge>
                  </Td>
                  <Td py={4} px={6}>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      rightIcon={<ChevronRight size={16} />}
                      onClick={() => navigate(`/certificates/${cert._id}`)}
                      _hover={{
                        bg: "blue.50",
                        transform: "translateX(4px)",
                      }}
                      transition="all 0.2s"
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

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
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default StudentCertificates;