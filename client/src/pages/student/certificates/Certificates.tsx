import React from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  VStack,
  Flex,
  HStack,
  Button,
  Icon,
  Heading,
  useDisclosure,
} from '@chakra-ui/react';
import { FileBadge as CertIcon, Upload } from 'lucide-react';
import { CertificateFilters } from './CertificateFilters';
import { CertificateTable } from './CertificateTable';
import { UploadModal } from './UploadModal';
import { useCertificates } from './useCertificates';
import Loader from '../../../components/Loader';
import useAxios from "@/config/axios";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const Certificates: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    certificates,
    loading,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    refreshCertificates,
  } = useCertificates();

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
            <Flex justify="space-between" align="center">
              <HStack spacing={4}>
                <Icon as={CertIcon} boxSize={8} color="green.500" />
                <Heading size="lg">Your Certificates</Heading>
              </HStack>
              <Button
                leftIcon={<Upload />}
                colorScheme="green"
                size="lg"
                onClick={onOpen}
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Upload Certificate
              </Button>
            </Flex>
          </motion.div>

          <motion.div variants={itemVariants}>
            <CertificateFilters
              filters={filters}
              setFilters={setFilters}
              onSearch={setSearchTerm}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CertificateTable certificates={certificates} />
          </motion.div>
        </VStack>

        <UploadModal
          isOpen={isOpen}
          onClose={onClose}
          onUpload={async (formData) => {
            try {
              const axios = useAxios();
              const res = await axios.post("/certificates", formData);
              if (res.status === 200) {
                refreshCertificates();
                onClose();
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