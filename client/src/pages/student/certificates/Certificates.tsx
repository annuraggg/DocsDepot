import React from "react";
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
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  ButtonGroup,
} from "@chakra-ui/react";
import { FileBadge as CertIcon, Upload, Filter, Search } from "lucide-react";
import { CertificateFilters } from "./CertificateFilters";
import CertificateTable from "./CertificateTable";
import { UploadModal } from "./UploadModal";
import { useCertificates } from "./useCertificates";
import Loader from "../../../components/Loader";
import useAxios from "@/config/axios";

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
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const Certificates: React.FC = () => {
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
  } = useDisclosure();
  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose,
  } = useDisclosure();
  const {
    certificates,
    loading,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    refreshCertificates,
    resetFilters,
  } = useCertificates();

  const hasActiveFilters = Object.values(filters).some((filter) =>
    Array.isArray(filter) ? filter.length > 0 : !!filter
  );

  if (loading) return <Loader />;

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
                  <Icon as={CertIcon} boxSize={6} color="green.500" />
                  <Heading size="md">Your Certificates</Heading>
                </HStack>
                <HStack spacing={3}>
                  <Popover
                    isOpen={isFilterOpen}
                    onClose={onFilterClose}
                    placement="bottom-end"
                    closeOnBlur={false}
                  >
                    <PopoverTrigger>
                      <Button
                        leftIcon={<Filter />}
                        variant={hasActiveFilters ? "solid" : "outline"}
                        colorScheme={hasActiveFilters ? "green" : "gray"}
                        onClick={onFilterOpen}
                      >
                        Filters {hasActiveFilters && "(Active)"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      width="400px"
                      shadow="xl"
                      borderRadius="xl"
                      borderWidth="1px"
                    >
                      <PopoverBody p={4}>
                        <CertificateFilters
                          filters={filters}
                          setFilters={setFilters}
                        />
                      </PopoverBody>
                      <PopoverFooter
                        p={4}
                        borderTop="1px"
                        borderColor="gray.200"
                      >
                        <ButtonGroup size="sm" width="full" spacing={3}>
                          <Button
                            variant="outline"
                            onClick={() => {
                              resetFilters();
                              onFilterClose();
                            }}
                            width="full"
                          >
                            Clear All
                          </Button>
                          <Button
                            colorScheme="green"
                            onClick={onFilterClose}
                            width="full"
                          >
                            Apply Filters
                          </Button>
                        </ButtonGroup>
                      </PopoverFooter>
                    </PopoverContent>
                  </Popover>

                  <Button
                    leftIcon={<Upload />}
                    colorScheme="green"
                    onClick={onUploadOpen}
                    className="shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Upload Certificate
                  </Button>
                </HStack>
              </Flex>

              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Search className="text-gray-400" />
                </InputLeftElement>
                <Input
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="lg"
                  fontSize="md"
                  bg="white"
                  _focus={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
                  }}
                />
              </InputGroup>
            </VStack>
          </motion.div>

          <motion.div variants={itemVariants}>
            <CertificateTable certificates={certificates} />
          </motion.div>
        </VStack>

        <UploadModal
          isOpen={isUploadOpen}
          onClose={onUploadClose}
          onUpload={async (formData) => {
            try {
              const axios = useAxios();
              const res = await axios.post("/certificates", formData);
              if (res.status === 200) {
                refreshCertificates();
                onUploadClose();
              }
            } catch (err) {
              console.error(err);
            }
          }}
        />
      </Container>
    </motion.div>
  );
};

export default Certificates;
