import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Trash2,
  Mail,
  User as UserIcon,
  Building2,
  Award,
} from "lucide-react";
import { User } from "@shared-types/User";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  Badge,
  IconButton,
  SimpleGrid,
  HStack,
  Checkbox,
  VStack,
  Text,
  Card,
  CardBody,
  useColorModeValue,
  Avatar,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Divider,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

interface FacultyTableProps {
  filteredFaculty: User[];
  openEdit: (id: string) => void;
  deleteCustomer: (id: string) => void;
  isMobile?: boolean;
  isBulkDelete?: boolean;
  selectedFaculty?: string[];
  onFacultySelect?: (id: string) => void;
}

// Configuration for permission colors
const PERMISSION_COLORS: Record<string, string> = {
  UFC: "blue",
  H1: "purple",
  H2: "green",
  H3: "orange",
  H4: "red",
  MHI: "cyan",
  SND: "pink",
  RSP: "yellow",
  AES: "teal",
};

const PERMISSION_LABELS: Record<string, string> = {
  UFC: "Faculty",
  H1: "House 1 Coordinator",
  H2: "House 2 Coordinator",
  H3: "House 3 Coordinator",
  H4: "House 4 Coordinator",
  MHI: "Manage Events",
  SND: "Send Notifications",
  RSP: "Reset Student Password",
  AES: "Add/Edit Student",
};

const MotionCard = motion(Card);
const MotionTr = motion(Tr);

const FacultyTable: React.FC<FacultyTableProps> = ({
  filteredFaculty,
  openEdit,
  deleteCustomer,
  isMobile = false,
  isBulkDelete = false,
  selectedFaculty = [],
  onFacultySelect = () => {},
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const renderPermissionBadges = (permissions: string[]) => (
    <Wrap spacing={1}>
      {permissions.map((perm, index) => (
        <WrapItem key={index}>
          <Tooltip label={PERMISSION_LABELS[perm] || perm} placement="top">
            <Badge
              colorScheme={PERMISSION_COLORS[perm] || "gray"}
              variant="subtle"
              fontSize="xs"
              borderRadius="full"
              px={2}
              py={1}
            >
              {perm}
            </Badge>
          </Tooltip>
        </WrapItem>
      ))}
    </Wrap>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        <SimpleGrid columns={1} spacing={4}>
          {filteredFaculty.map((faculty, index) => (
            <MotionCard
              key={faculty._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              overflow="hidden"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
                borderColor: "blue.300",
              }}
            >
              <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="start">
                    <HStack spacing={3} flex={1}>
                      {isBulkDelete && (
                        <Checkbox
                          isChecked={selectedFaculty.includes(faculty._id)}
                          onChange={() => onFacultySelect(faculty._id)}
                          colorScheme="blue"
                        />
                      )}

                      <Avatar
                        name={`${faculty.fname} ${faculty.lname}`}
                        size="md"
                        bg="blue.500"
                        color="white"
                        fontWeight="600"
                      />

                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="700" fontSize="lg">
                          {faculty.fname} {faculty.lname}
                        </Text>
                        <Badge
                          colorScheme="blue"
                          variant="outline"
                          borderRadius="full"
                        >
                          {faculty.mid}
                        </Badge>
                      </VStack>
                    </HStack>

                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<Icon as={Edit2} />}
                        variant="ghost"
                        size="sm"
                        borderRadius="lg"
                      />
                      <MenuList borderRadius="xl">
                        <MenuItem
                          icon={<Edit2 size={16} />}
                          onClick={() => openEdit(faculty.mid)}
                        >
                          Edit Faculty
                        </MenuItem>
                        {!isBulkDelete && (
                          <MenuItem
                            icon={<Trash2 size={16} />}
                            color="red.500"
                            onClick={() => deleteCustomer(faculty._id)}
                          >
                            Delete Faculty
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Flex>

                  <Divider />

                  <VStack spacing={3} align="stretch">
                    <HStack spacing={2}>
                      <Icon as={Mail} color="gray.500" boxSize={4} />
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        wordBreak="break-word"
                      >
                        {faculty.social.email}
                      </Text>
                    </HStack>

                    <HStack spacing={2}>
                      <Icon as={Building2} color="gray.500" boxSize={4} />
                      <Badge
                        colorScheme="purple"
                        variant="subtle"
                        borderRadius="full"
                      >
                        {faculty.academicDetails.branch || "No Department"}
                      </Badge>
                    </HStack>

                    <HStack spacing={2} align="start">
                      <Icon as={Award} color="gray.500" boxSize={4} mt={1} />
                      <Box flex={1}>
                        {renderPermissionBadges(faculty.permissions)}
                      </Box>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>
      </AnimatePresence>
    );
  }

  return (
    <Card
      bg={cardBg}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      overflow="hidden"
    >
      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead bg={useColorModeValue("gray.50", "gray.700")}>
            <Tr>
              {isBulkDelete && (
                <Th width="5%" borderColor={borderColor}>
                  <Checkbox
                    isChecked={
                      filteredFaculty.length > 0 &&
                      filteredFaculty.every((f) =>
                        selectedFaculty.includes(f._id)
                      )
                    }
                    isIndeterminate={
                      selectedFaculty.length > 0 &&
                      selectedFaculty.length < filteredFaculty.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        filteredFaculty.forEach((f) => {
                          if (!selectedFaculty.includes(f._id)) {
                            onFacultySelect(f._id);
                          }
                        });
                      } else {
                        filteredFaculty.forEach((f) => {
                          if (selectedFaculty.includes(f._id)) {
                            onFacultySelect(f._id);
                          }
                        });
                      }
                    }}
                    colorScheme="blue"
                  />
                </Th>
              )}
              <Th
                borderColor={borderColor}
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Faculty
              </Th>
              <Th
                borderColor={borderColor}
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Contact
              </Th>
              <Th
                borderColor={borderColor}
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Department
              </Th>
              <Th
                borderColor={borderColor}
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Permissions
              </Th>
              <Th
                borderColor={borderColor}
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="wider"
                textAlign="center"
              >
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <AnimatePresence>
              {filteredFaculty.map((faculty, index) => (
                <MotionTr
                  key={faculty._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  _hover={{ bg: hoverBg }}
                >
                  {isBulkDelete && (
                    <Td borderColor={borderColor}>
                      <Checkbox
                        isChecked={selectedFaculty.includes(faculty._id)}
                        onChange={() => onFacultySelect(faculty._id)}
                        colorScheme="blue"
                      />
                    </Td>
                  )}

                  <Td borderColor={borderColor} py={4}>
                    <HStack spacing={3}>
                      <Avatar
                        name={`${faculty.fname} ${faculty.lname}`}
                        size="sm"
                        bg="blue.500"
                        color="white"
                        fontWeight="600"
                      />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="600" fontSize="sm">
                          {faculty.fname} {faculty.lname}
                        </Text>
                        <Badge
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          borderRadius="full"
                        >
                          {faculty.mid}
                        </Badge>
                      </VStack>
                    </HStack>
                  </Td>

                  <Td borderColor={borderColor} py={4}>
                    <VStack align="start" spacing={1}>
                      <HStack spacing={2}>
                        <Icon as={Mail} color="gray.500" boxSize={3} />
                        <Text fontSize="sm" color="gray.600">
                          {faculty.social.email}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={UserIcon} color="gray.500" boxSize={3} />
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          textTransform="capitalize"
                        >
                          {faculty.gender === "M"
                            ? "Male"
                            : faculty.gender === "F"
                            ? "Female"
                            : "Other"}
                        </Text>
                      </HStack>
                    </VStack>
                  </Td>

                  <Td borderColor={borderColor} py={4}>
                    <Badge
                      colorScheme="purple"
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {faculty.academicDetails.branch || "No Department"}
                    </Badge>
                  </Td>

                  <Td borderColor={borderColor} py={4} maxW="200px">
                    {renderPermissionBadges(faculty.permissions)}
                  </Td>

                  <Td borderColor={borderColor} py={4} textAlign="center">
                    <HStack spacing={1} justify="center">
                      <Tooltip label="Edit faculty details" placement="top">
                        <IconButton
                          aria-label="Edit faculty"
                          icon={<Edit2 size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          borderRadius="lg"
                          onClick={() => openEdit(faculty.mid)}
                        />
                      </Tooltip>

                      {!isBulkDelete && (
                        <Tooltip label="Delete faculty" placement="top">
                          <IconButton
                            aria-label="Delete faculty"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            borderRadius="lg"
                            onClick={() => deleteCustomer(faculty._id)}
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </Td>
                </MotionTr>
              ))}
            </AnimatePresence>
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
};

export default FacultyTable;
