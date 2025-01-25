import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Container,
  VStack,
  Flex,
  HStack,
  Button,
  Icon,
  Heading,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  ButtonGroup,
  useToast,
} from "@chakra-ui/react";
import { FileBadge, Filter, Search } from "lucide-react";
import { CertificateFilters } from "./CertificateFilters";
import { CertificateTable } from "./CertificateTable";
import { ExtendedCertificate } from "@/types/ExtendedCertificate";
import useAxios from "@/config/axios";
import useUser from "@/config/user";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

interface FilterState {
  types: string[];
  levels: string[];
  status: string[];
  issueYears: string[];
  expiryYears: string[];
}

const Certificates = () => {
  const [certificates, setCertificates] = useState<ExtendedCertificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<
    ExtendedCertificate[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    levels: [],
    status: [],
    issueYears: [],
    expiryYears: [],
  });

  const toast = useToast();
  const axios = useAxios();
  const user = useUser();

  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose,
  } = useDisclosure();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    const houseId = user?.house;
    axios
      .get(`/certificates/house/${houseId}`)
      .then((res) => {
        setCertificates(res.data.data);
        setFilteredCertificates(res.data.data);
      })
      .catch((err) => {
        console.error(err); 
        toast({
          title: "Error",
          description: "Failed to fetch certificates",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const applyFilters = () => {
    let filtered = [...certificates];

    if (searchTerm) {
      filtered = filtered.filter((cert) =>
        cert.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.levels.length) {
      filtered = filtered.filter((cert) => filters.levels.includes(cert.level));
    }

    if (filters.status.length) {
      filtered = filtered.filter((cert) =>
        filters.status.includes(cert.status)
      );
    }

    if (filters.issueYears.length) {
      filtered = filtered.filter((cert) =>
        filters.issueYears.includes(
          new Date(cert.issueDate.toString()).getFullYear().toString()
        )
      );
    }

    setFilteredCertificates(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50"
    >
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <motion.div variants={itemVariants}>
            <VStack spacing={6} align="stretch">
              <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                  <Heading size="lg">Pending Certificates</Heading>
                </HStack>
                <Button
                  leftIcon={<Filter />}
                  colorScheme="gray"
                  variant="outline"
                  onClick={onFilterOpen}
                >
                  Filters
                </Button>
              </Flex>

              <InputGroup>
                <InputLeftElement>
                  <Search className="text-gray-400" />
                </InputLeftElement>
                <Input
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </VStack>
          </motion.div>

          <motion.div variants={itemVariants}>
            <CertificateTable certificates={filteredCertificates} />
          </motion.div>
        </VStack>

        <Popover
          isOpen={isFilterOpen}
          onClose={onFilterClose}
          placement="bottom-end"
        >
          <PopoverContent>
            <PopoverBody>
              <CertificateFilters filters={filters} setFilters={setFilters} />
            </PopoverBody>
            <PopoverFooter>
              <ButtonGroup size="sm" width="full">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      types: [],
                      levels: [],
                      status: [],
                      issueYears: [],
                      expiryYears: [],
                    });
                    onFilterClose();
                  }}
                >
                  Clear
                </Button>
                <Button colorScheme="blue" onClick={onFilterClose}>
                  Apply
                </Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </Container>
    </motion.div>
  );
};

export default Certificates;
