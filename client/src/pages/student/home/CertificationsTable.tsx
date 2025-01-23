import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Box,
  Badge,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Certificate } from "@/types/dashboard";
import { CheckCircle, Clock, Award } from "lucide-react";

interface Props {
  certifications: Certificate[];
}

const MotionTr = motion(Tr);
const MotionTd = motion(Td);
const MotionBox = motion(Box);

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    scale: 1.01,
    backgroundColor: "rgba(237, 242, 247, 0.5)",
    transition: {
      duration: 0.2,
    },
  },
};

export const CertificationsTable = ({ certifications }: Props) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return {
          bg: "green.50",
          color: "green.600",
          borderColor: "green.200",
        };
      default:
        return {
          bg: "yellow.50",
          color: "yellow.600",
          borderColor: "yellow.200",
        };
    }
  };

  const renderCertifications = (type: string) => {
    return certifications
      ?.filter((cert) => cert.certificateType === type)
      ?.slice(0, 3)
      ?.map((cert, index) => {
        const StatusIcon = getStatusIcon(cert.status);
        const statusColor = getStatusColor(cert.status);

        return (
          <MotionTr
            key={cert._id}
            variants={rowVariants}
            whileHover="hover"
            initial="hidden"
            animate="visible"
            cursor="pointer"
            transition={{ delay: index * 0.1 }}
          >
            <MotionTd>
              <Flex align="center" gap={3}>
                <Icon as={Award} width={5} height={5} color="blue.500" />
                <Box>
                  <Text fontWeight="semibold" color="gray.800">
                    {cert.certificateName}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {cert.issuingOrg}
                  </Text>
                </Box>
              </Flex>
            </MotionTd>
            <MotionTd isNumeric>
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                colorScheme="blue"
                fontSize="sm"
                fontWeight="semibold"
              >
                {cert.points || cert.xp || "0"} pts
              </Badge>
            </MotionTd>
            <MotionTd>
              <Text color="gray.600" fontSize="sm" fontWeight="medium">
                {months[cert.submittedMonth]} {cert.submittedYear}
              </Text>
            </MotionTd>
            <MotionTd>
              <Flex
                align="center"
                gap={2}
                px={3}
                py={1.5}
                borderRadius="full"
                bg={statusColor.bg}
                color={statusColor.color}
                border="1px solid"
                borderColor={statusColor.borderColor}
                width="fit-content"
              >
                <StatusIcon size={14} />
                <Text fontSize="sm" fontWeight="semibold">
                  {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                </Text>
              </Flex>
            </MotionTd>
          </MotionTr>
        );
      });
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs variant="unstyled">
        <TabList mb={6} gap={4}>
          {["Internal", "Events", "External"].map((tab) => (
            <Tab
              key={tab}
              px={6}
              py={3}
              borderRadius="full"
              bg="gray.100"
              color="gray.600"
              fontSize="sm"
              fontWeight="semibold"
              _selected={{
                bg: "blue.500",
                color: "white",
                transform: "scale(1.05)",
                boxShadow: "lg",
              }}
              _hover={{
                bg: "gray.200",
                _selected: {
                  bg: "blue.500",
                },
              }}
              transition="all 0.2s"
            >
              {tab}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {["internal", "event", "external"].map((type) => (
            <TabPanel key={type} p={0}>
              <Box
                borderRadius="2xl"
                overflow="hidden"
                bg="white"
                boxShadow="lg"
                border="1px solid"
                borderColor="gray.100"
              >
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th
                        fontSize="sm"
                        textTransform="none"
                        color="gray.600"
                        py={4}
                      >
                        Certification Details
                      </Th>
                      <Th
                        isNumeric
                        fontSize="sm"
                        textTransform="none"
                        color="gray.600"
                        py={4}
                      >
                        Points
                      </Th>
                      <Th
                        fontSize="sm"
                        textTransform="none"
                        color="gray.600"
                        py={4}
                      >
                        Submitted On
                      </Th>
                      <Th
                        fontSize="sm"
                        textTransform="none"
                        color="gray.600"
                        py={4}
                      >
                        Status
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <AnimatePresence>
                      {renderCertifications(type)}
                    </AnimatePresence>
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </MotionBox>
  );
};
