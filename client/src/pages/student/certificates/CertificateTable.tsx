import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  Icon,
  Text,
  Badge,
  Box,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Building, Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Certificate } from "@shared-types/Certificate";
import { StatusBadge } from "./StatusBadge";

interface CertificateTableProps {
  certificates: Certificate[];
}

const tableRowVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export const CertificateTable: React.FC<CertificateTableProps> = ({
  certificates,
}) => {
  return (
    <Box overflow="auto">
      <Table>
        <Thead>
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
          <AnimatePresence>
            {certificates.map((cert, index) => (
              <motion.tr
                key={cert._id}
                variants={tableRowVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layoutId={cert._id}
              >
                <Td>{index + 1}</Td>
                <Td>
                  <HStack>
                    <Icon as={Award} color="green.500" />
                    <Text fontWeight="medium">{cert.certificateName}</Text>
                  </HStack>
                </Td>
                <Td>
                  <HStack>
                    <Icon as={Building} color="gray.500" />
                    <Text>{cert.issuingOrg}</Text>
                  </HStack>
                </Td>
                <Td>
                  <HStack>
                    <Icon as={Calendar} color="blue.500" />
                    <Text>
                      {cert.issueMonth.charAt(0).toUpperCase() +
                        cert.issueMonth.slice(1)}{" "}
                      {cert.issueYear}
                    </Text>
                  </HStack>
                </Td>
                <Td>
                  <Badge
                    colorScheme={
                      cert.certificateType === "internal" ? "blue" : "purple"
                    }
                    rounded="full"
                  >
                    {cert.certificateType.charAt(0).toUpperCase() +
                      cert.certificateType.slice(1)}
                  </Badge>
                </Td>
                <Td>
                  <Badge
                    colorScheme={
                      cert.certificateLevel === "beginner"
                        ? "green"
                        : cert.certificateLevel === "intermediate"
                        ? "yellow"
                        : "red"
                    }
                    rounded="full"
                  >
                    {cert.certificateLevel.charAt(0).toUpperCase() +
                      cert.certificateLevel.slice(1)}
                  </Badge>
                </Td>
                <Td>
                  <StatusBadge status={cert.status ?? "pending"} />
                </Td>
                <Td>
                  <Link to={`/certificates/${cert._id}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      rightIcon={<ChevronRight />}
                      _hover={{
                        bg: "blue.50",
                        transform: "translateX(4px)",
                      }}
                      transition="all 0.2s"
                    >
                      View
                    </Button>
                  </Link>
                </Td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </Tbody>
      </Table>
    </Box>
  );
};
