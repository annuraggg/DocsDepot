import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Text,
  Button,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { Link } from 'react-router';
import { Award, Building2, Calendar, ChevronRight } from 'lucide-react';
import { ExtendedCertificate } from '@/types/ExtendedCertificate';

interface CertificateTableProps {
  certificates: ExtendedCertificate[];
}

export const CertificateTable: React.FC<CertificateTableProps> = ({
  certificates = [],
}) => {
  const getLevelBadgeProps = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return { bg: 'emerald.100', color: 'emerald.800' };
      case 'intermediate':
        return { bg: 'orange.100', color: 'orange.800' };
      case 'advanced':
        return { bg: 'red.100', color: 'red.800' };
      default:
        return { bg: 'gray.100', color: 'gray.800' };
    }
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: 'green.100', color: 'green.800' };
      case 'rejected':
        return { bg: 'red.100', color: 'red.800' };
      case 'pending':
        return { bg: 'yellow.100', color: 'yellow.800' };
      default:
        return { bg: 'gray.100', color: 'gray.800' };
    }
  };

  return (
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
              <Th>Certificate Name</Th>
              <Th>Organization</Th>
              <Th>Issue Date</Th>
              <Th>Level</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {certificates.map((cert) => (
              <Tr 
                key={cert._id}
                _hover={{ bg: 'gray.50' }}
                transition="background 0.15s"
              >
                <Td>
                  <HStack spacing={2}>
                    <Icon as={Award} color="green.500" boxSize={5} />
                    <Text fontSize="sm" fontWeight="medium">
                      {cert.name}
                    </Text>
                  </HStack>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Icon as={Building2} color="gray.400" boxSize={5} />
                    <Text fontSize="sm" color="gray.600">
                      {cert.issuingOrganization}
                    </Text>
                  </HStack>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Icon as={Calendar} color="blue.400" boxSize={5} />
                    <Text fontSize="sm" color="gray.600">
                      {cert.issueDate.toString()}
                    </Text>
                  </HStack>
                </Td>
                <Td>
                  <Badge {...getLevelBadgeProps(cert.level)}>
                    {cert.level}
                  </Badge>
                </Td>
                <Td>
                  <Badge {...getStatusBadgeProps(cert.status)}>
                    {cert.status}
                  </Badge>
                </Td>
                <Td>
                  <Button
                    as={Link}
                    to={`/certificates/${cert._id}`}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    rightIcon={<ChevronRight className="h-4 w-4" />}
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
  );
};