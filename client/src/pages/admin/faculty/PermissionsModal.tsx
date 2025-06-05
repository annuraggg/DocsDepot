import React, { useEffect, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  VStack,
  HStack,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  useBreakpointValue,
  useColorModeValue,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  CheckCircle,
  AlertTriangle,
  Home,
  Settings,
  Mail,
  UserPlus,
  Award,
  Calendar,
  Key,
} from "lucide-react";
import { House } from "@shared-types/House";

export interface PermissionsModalProps {
  userid: string;
  isOpen: boolean;
  onClose: () => void;
  onEditOpen: () => void;
  houses: House[];
  perms: string[];
  setPerms: (perms: string[]) => void;
}

// Configuration for permissions
const PERMISSIONS_CONFIG = {
  UFC: {
    label: "Upload Faculty Certificates",
    description: "Default permission - Cannot be changed",
    icon: Award,
    color: "blue",
    type: "default",
    features: ["Add their own certifications to the system"],
  },
  MHI: {
    label: "Manage Events",
    description: "Create and manage institutional events",
    icon: Calendar,
    color: "cyan",
    type: "optional",
    features: ["Create Events", "Update Events", "Manage / Edit Events"],
  },
  SND: {
    label: "Send Notifications",
    description: "Send system-wide notifications",
    icon: Mail,
    color: "pink",
    type: "optional",
    features: ["Send Global Notifications to Users"],
  },
  RSP: {
    label: "Reset Student Password",
    description: "Assist students with password recovery",
    icon: Key,
    color: "yellow",
    type: "optional",
    features: ["Assist in resetting student passwords when necessary"],
  },
  AES: {
    label: "Add/Edit Student",
    description: "Manage student profiles and data",
    icon: UserPlus,
    color: "teal",
    type: "optional",
    features: [
      "Add Students to the system",
      "Delete Students from the system",
      "Edit Student Profiles",
    ],
  },
} as const;

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  userid,
  isOpen,
  onClose,
  onEditOpen,
  houses,
  perms,
  setPerms,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Find current house coordinator assignment
  const currentHouseAssignment = useMemo(() => {
    const houseCoordinatorPerm = perms.find((perm) => perm.startsWith("H"));
    if (houseCoordinatorPerm) {
      const houseIndex = parseInt(houseCoordinatorPerm.substring(1)) - 1;
      return houses[houseIndex]?.id || houseCoordinatorPerm;
    }
    return houses.find((house) => house.facultyCordinator === userid)?.id || "";
  }, [perms, houses, userid]);

  // Handle house coordinator change
  const handleHouseCoordinatorChange = (value: string) => {
    const updatedPerms = perms.filter((perm) => !perm.startsWith("H"));
    if (value) {
      updatedPerms.push(value);
    }
    setPerms(updatedPerms);
  };

  // Handle regular permissions change
  const handlePermissionsChange = (values: string[]) => {
    const houseCoordinatorPerms = perms.filter((perm) => perm.startsWith("H"));
    setPerms([...values, ...houseCoordinatorPerms]);
  };

  const regularPermissions = perms.filter((perm) => !perm.startsWith("H"));

  useEffect(() => {
    console.log("User ID:", userid);
    console.log("Current House Assignment:", currentHouseAssignment);
  }, [userid, currentHouseAssignment]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isMobile ? "full" : "4xl"}
      scrollBehavior="inside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent borderRadius="xl" mx={isMobile ? 0 : 4}>
        <ModalHeader borderBottom="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Icon as={Settings} color="blue.500" boxSize={6} />
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="700">
                Faculty Permissions
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="normal">
                Configure access levels and responsibilities
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Default Permission - UFC */}
            <Card
              variant="outline"
              borderRadius="xl"
              borderColor="blue.200"
              bg="blue.50"
            >
              <CardHeader pb={3}>
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Icon as={Award} color="blue.500" boxSize={5} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="blue.700">
                        {PERMISSIONS_CONFIG.UFC.label}
                      </Text>
                      <Text fontSize="sm" color="blue.600">
                        {PERMISSIONS_CONFIG.UFC.description}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme="blue" variant="solid" borderRadius="full">
                    Default
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <HStack spacing={2} align="start">
                  <Icon
                    as={CheckCircle}
                    color="green.500"
                    boxSize={4}
                    mt={0.5}
                  />
                  <Text fontSize="sm" color="gray.700">
                    Add their own certifications to the system
                  </Text>
                </HStack>
              </CardBody>
            </Card>

            {/* Optional Permissions */}
            <VStack spacing={4} align="stretch">
              <HStack spacing={3}>
                <Icon as={Settings} color="purple.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="600">
                  Optional Permissions
                </Text>
              </HStack>

              <CheckboxGroup
                value={regularPermissions}
                onChange={handlePermissionsChange}
              >
                <SimpleGrid columns={1} spacing={4}>
                  {Object.entries(PERMISSIONS_CONFIG).map(([key, config]) => {
                    if (key === "UFC") return null; // Skip UFC as it's handled above

                    return (
                      <Card
                        key={key}
                        variant="outline"
                        borderRadius="xl"
                        _hover={{ borderColor: `${config.color}.300` }}
                        transition="all 0.2s"
                      >
                        <CardBody p={4}>
                          <HStack spacing={4} align="start">
                            <Checkbox
                              value={key}
                              colorScheme={config.color}
                              size="lg"
                              mt={1}
                            />
                            <Box flex={1}>
                              <VStack align="start" spacing={3}>
                                <HStack spacing={3}>
                                  <Icon
                                    as={config.icon}
                                    color={`${config.color}.500`}
                                    boxSize={5}
                                  />
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="600">{config.label}</Text>
                                    <Text fontSize="sm" color="gray.600">
                                      {config.description}
                                    </Text>
                                  </VStack>
                                </HStack>

                                <VStack align="start" spacing={2} pl={8}>
                                  {config.features.map((feature, index) => (
                                    <HStack key={index} spacing={2}>
                                      <Icon
                                        as={CheckCircle}
                                        color="green.500"
                                        boxSize={3}
                                      />
                                      <Text fontSize="sm" color="gray.700">
                                        {feature}
                                      </Text>
                                    </HStack>
                                  ))}
                                </VStack>
                              </VStack>
                            </Box>
                          </HStack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              </CheckboxGroup>
            </VStack>

            <Divider />

            {/* House Coordinator Section */}
            <VStack spacing={4} align="stretch">
              <HStack spacing={3}>
                <Icon as={Home} color="orange.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="600">
                  House Coordinator
                </Text>
              </HStack>

              <Alert status="info" borderRadius="xl" variant="left-accent">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <AlertTitle fontSize="sm">Important Note</AlertTitle>
                  <AlertDescription fontSize="sm">
                    Faculty can only be assigned as coordinator for one house at
                    a time.
                  </AlertDescription>
                </VStack>
              </Alert>

              <Card variant="outline" borderRadius="xl">
                <CardBody p={4}>
                  <RadioGroup
                    value={currentHouseAssignment}
                    onChange={handleHouseCoordinatorChange}
                  >
                    <VStack spacing={4} align="stretch">
                      {houses.map((house, index) => (
                        <HStack
                          key={house.id}
                          spacing={4}
                          p={3}
                          borderRadius="lg"
                          _hover={{
                            bg: useColorModeValue("gray.50", "gray.700"),
                          }}
                        >
                          <Radio
                            value={`H${index + 1}`}
                            colorScheme="orange"
                            size="lg"
                          />
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={3}>
                              <Text fontWeight="600">
                                {house.name} Coordinator
                              </Text>
                              <Badge
                                colorScheme={
                                  `H${index + 1}` === currentHouseAssignment
                                    ? "orange"
                                    : "gray"
                                }
                                variant="subtle"
                                borderRadius="full"
                              >
                                H{index + 1}
                              </Badge>
                            </HStack>
                            <VStack align="start" spacing={1} pl={0}>
                              <HStack spacing={2}>
                                <Icon
                                  as={CheckCircle}
                                  color="green.500"
                                  boxSize={3}
                                />
                                <Text fontSize="sm" color="gray.700">
                                  Manage House Profile
                                </Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Icon
                                  as={CheckCircle}
                                  color="green.500"
                                  boxSize={3}
                                />
                                <Text fontSize="sm" color="gray.700">
                                  Manage House Members
                                </Text>
                              </HStack>
                            </VStack>
                          </VStack>
                        </HStack>
                      ))}

                      <HStack
                        spacing={4}
                        p={3}
                        borderRadius="lg"
                        _hover={{
                          bg: useColorModeValue("gray.50", "gray.700"),
                        }}
                      >
                        <Radio value="" colorScheme="gray" size="lg" />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="600" color="gray.600">
                            No House Assignment
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Faculty will not have house coordinator
                            responsibilities
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </RadioGroup>
                </CardBody>
              </Card>
            </VStack>

            {/* Summary */}
            <Card
              variant="filled"
              borderRadius="xl"
              bg={useColorModeValue("blue.50", "blue.900/20")}
            >
              <CardBody p={4}>
                <VStack spacing={3} align="start">
                  <HStack spacing={3}>
                    <Icon as={AlertTriangle} color="blue.500" boxSize={5} />
                    <Text fontWeight="600" color="blue.700">
                      Permission Summary
                    </Text>
                  </HStack>

                  <VStack align="start" spacing={2} pl={8}>
                    <Text fontSize="sm" color="blue.600">
                      <strong>Total Permissions:</strong> {perms.length}
                    </Text>
                    {perms.length > 0 && (
                      <Box>
                        <Text fontSize="sm" color="blue.600" mb={2}>
                          <strong>Active Permissions:</strong>
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                          {perms.map((perm, index) => (
                            <Badge
                              key={index}
                              colorScheme={
                                perm.startsWith("H") ? "orange" : "blue"
                              }
                              variant="subtle"
                              borderRadius="full"
                              px={3}
                              py={1}
                            >
                              {perm}
                            </Badge>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={borderColor} gap={3}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={() => {
              onClose();
              onEditOpen();
            }}
            leftIcon={<CheckCircle size={16} />}
          >
            Apply Permissions
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PermissionsModal;
