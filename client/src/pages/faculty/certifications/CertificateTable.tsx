import React from "react";
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
} from "@chakra-ui/react";
import { Award, Building2, Calendar, ChevronRight } from "lucide-react";
import { Certificate } from "@shared-types/Certificate";

interface CertificateTableProps {
  certificates: Certificate[];
}

const CertificateTable: React.FC<CertificateTableProps> = ({
  certificates = [],
}) => {
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
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Sr No.
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Certificate
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Organization
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Issue Date
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Type
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Level
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Status
              </Th>
              <Th
                py={4}
                px={6}
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                textTransform="initial"
              >
                Action
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {certificates?.map((cert, index) => (
              <Tr
                key={cert?._id}
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
                      {cert?.name}
                    </Text>
                  </HStack>
                </Td>
                <Td py={4} px={6}>
                  <HStack spacing={2}>
                    <Icon as={Building2} color="gray.400" boxSize={5} />
                    <Text fontSize="sm" color="gray.600">
                      {cert?.issuingOrganization}
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
                    {...getTypeProps(cert?.type)}
                  >
                    {cert?.type?.charAt(0)?.toUpperCase() +
                      cert?.type?.slice(1)}
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
                    {...getLevelProps(cert?.level)}
                  >
                    {cert?.level?.charAt(0)?.toUpperCase() +
                      cert?.level?.slice(1)}
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
                    {...getStatusProps(cert?.status)}
                  >
                    {(cert?.status ?? "Pending")?.charAt(0)?.toUpperCase() +
                      (cert?.status ?? "pending")?.slice(1)}
                  </Badge>
                </Td>
                <Td py={4} px={6}>
                  <Button
                    as="a"
                    href={`/certificates/${cert?._id}`}
                    size="sm"
                    variant="ghost"
                    colorScheme="lightblue"
                    rightIcon={<ChevronRight size={16} />}
                    fontSize="sm"
                    fontWeight="medium"
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
  );
};

export default CertificateTable;
