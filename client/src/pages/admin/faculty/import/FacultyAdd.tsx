import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Radio,
  RadioGroup,
  Input,
  useToast,
  VStack,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Box,
  HStack,
  Checkbox,
  CheckboxGroup,
  useColorModeValue,
  Icon,
  Text,
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  SimpleGrid,
  Divider,
  Progress,
  FormErrorMessage,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Hash,
  Shield,
  CheckCircle,
  AlertTriangle,
  Home,
  Settings,
  Calendar,
  Key,
  UserPlus,
  Award,
  Save,
  X,
} from "lucide-react";
import { House } from "@shared-types/House";
import useAxios from "@/config/axios";

// Enhanced interfaces
interface FacultyAddProps {
  setModal: (value: boolean) => void;
  h: { houses: House[] };
}

interface FormData {
  fname: string;
  lname: string;
  moodleid: string;
  email: string;
  gender: string;
}

interface FormErrors {
  fname?: string;
  lname?: string;
  moodleid?: string;
  email?: string;
  gender?: string;
}

// Configuration constants
const CONFIG = {
  ANIMATION: {
    DURATION: 0.3,
    SPRING: { type: "spring", stiffness: 300, damping: 30 },
  },
  VALIDATION: {
    MOODLE_ID_LENGTH: 3,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    NAME_MIN_LENGTH: 2,
  },
  PERMISSIONS: {
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
  },
  TOAST: {
    DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
    },
    POSITION: "top-right" as const,
  },
} as const;

// Enhanced components
const MotionModalContent = motion(ModalContent);
const MotionCard = motion(Card);

// Utility functions
const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.fname.trim()) {
    errors.fname = "First name is required";
  } else if (formData.fname.trim().length < CONFIG.VALIDATION.NAME_MIN_LENGTH) {
    errors.fname = "First name must be at least 2 characters";
  }

  if (!formData.lname.trim()) {
    errors.lname = "Last name is required";
  } else if (formData.lname.trim().length < CONFIG.VALIDATION.NAME_MIN_LENGTH) {
    errors.lname = "Last name must be at least 2 characters";
  }

  if (!formData.moodleid.trim()) {
    errors.moodleid = "Moodle ID is required";
  } else if (
    formData.moodleid.trim().length !== CONFIG.VALIDATION.MOODLE_ID_LENGTH
  ) {
    errors.moodleid = `Moodle ID must be exactly ${CONFIG.VALIDATION.MOODLE_ID_LENGTH} characters`;
  } else if (!/^\d+$/.test(formData.moodleid.trim())) {
    errors.moodleid = "Moodle ID must contain only numbers";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!CONFIG.VALIDATION.EMAIL_REGEX.test(formData.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!formData.gender) {
    errors.gender = "Please select a gender";
  }

  return errors;
};

const validatePermissions = (permissions: string[]): boolean => {
  const houseCoordinatorPerms = permissions.filter((p) => p.startsWith("H"));
  return houseCoordinatorPerms.length <= 1;
};

const FacultyAdd: React.FC<FacultyAddProps> = ({ setModal, h }) => {
  // State management
  const [formData, setFormData] = useState<FormData>({
    fname: "",
    lname: "",
    moodleid: "",
    email: "",
    gender: "M",
  });
  const [perms, setPerms] = useState<string[]>(["UFC"]);
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [_focuscurrentStep, setCurrentStep] = useState<"basic" | "permissions">(
    "basic"
  );

  // Hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isPermOpen,
    onOpen: openPerms,
    onClose: setPermClose,
  } = useDisclosure();
  const toast = useToast();
  const axios = useAxios();

  // Color mode values
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Memoized calculations
  const isFormValid = useMemo(() => {
    const errors = validateForm(formData);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const currentHouseAssignment = useMemo(() => {
    return perms.find((perm) => perm.startsWith("H")) || "";
  }, [perms]);

  const regularPermissions = useMemo(() => {
    return perms.filter((perm) => !perm.startsWith("H"));
  }, [perms]);

  const formProgress = useMemo(() => {
    const totalFields = 5; // fname, lname, moodleid, email, gender
    const filledFields = Object.values(formData).filter(
      (value) => value.trim() !== ""
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  }, [formData]);

  // Event handlers
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      // Special handling for moodleid - only allow digits and limit to 3 characters
      if (field === "moodleid") {
        const digitsOnly = value
          .replace(/\D/g, "")
          .slice(0, CONFIG.VALIDATION.MOODLE_ID_LENGTH);
        setFormData((prev) => ({ ...prev, [field]: digitsOnly }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }

      // Clear error for this field when user starts typing
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [formErrors]
  );

  const handleHouseCoordinatorChange = useCallback(
    (value: string) => {
      const updatedPerms = perms.filter((perm) => !perm.startsWith("H"));
      if (value) {
        updatedPerms.push(value);
      }
      setPerms(updatedPerms);
    },
    [perms]
  );

  const handlePermissionsChange = useCallback(
    (values: string[]) => {
      const houseCoordinatorPerms = perms.filter((perm) =>
        perm.startsWith("H")
      );
      setPerms([...values, ...houseCoordinatorPerms]);
    },
    [perms]
  );

  const setClose = useCallback(() => {
    setModal(false);
    onClose();
    setFormData({
      fname: "",
      lname: "",
      moodleid: "",
      email: "",
      gender: "M",
    });
    setPerms(["UFC"]);
    setFormErrors({});
    setCurrentStep("basic");
  }, [setModal, onClose]);

  const closePerms = useCallback(() => {
    setPermClose();
    onOpen();
  }, [setPermClose, onOpen]);

  const proceedToPermissions = useCallback(() => {
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      onClose();
      openPerms();
      setCurrentStep("permissions");
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding",
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    }
  }, [formData, onClose, openPerms, toast]);

  const addFaculty = useCallback(async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting",
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
      return;
    }

    if (!validatePermissions(perms)) {
      toast({
        title: "Permission Error",
        description: "Please select only one house coordinator role",
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
      return;
    }

    setIsLoading(true);

    const data = {
      fname: formData.fname.trim(),
      lname: formData.lname.trim(),
      mid: formData.moodleid.trim(),
      email: formData.email.trim().toLowerCase(),
      gender: formData.gender,
      perms,
      role: "F",
    };

    try {
      await axios.post("/user/faculty", data);

      toast({
        title: "Faculty Added Successfully",
        description: `${formData.fname} ${formData.lname} has been added to the system`,
        status: "success",
        duration: CONFIG.TOAST.DURATION.SUCCESS,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });

      setClose();
    } catch (err: any) {
      console.error("Faculty add error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to add faculty member";

      toast({
        title: "Error Adding Faculty",
        description: errorMessage,
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, perms, axios, toast, setClose]);

  // Effects
  useEffect(() => {
    setHouses(h.houses || []);
    onOpen();
  }, [h.houses, onOpen]);

  return (
    <AnimatePresence>
      {/* Basic Information Modal */}
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={setClose}
          size="xl"
          motionPreset="slideInBottom"
        >
          <ModalOverlay backdropFilter="blur(8px)" />
          <MotionModalContent
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={CONFIG.ANIMATION.SPRING}
            borderRadius="xl"
            mx={4}
          >
            <ModalHeader borderBottom="1px" borderColor={borderColor}>
              <VStack align="start" spacing={3}>
                <HStack spacing={3}>
                  <Icon as={UserPlus} color="blue.500" boxSize={6} />
                  <Text fontSize="lg" fontWeight="700">
                    Add New Faculty Member
                  </Text>
                </HStack>
                <Box w="full">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">
                      Basic Information
                    </Text>
                    <Text fontSize="sm" color="blue.600" fontWeight="600">
                      {formProgress}% Complete
                    </Text>
                  </HStack>
                  <Progress
                    value={formProgress}
                    colorScheme="blue"
                    size="sm"
                    borderRadius="full"
                  />
                </Box>
              </VStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody py={6}>
              {isLoading ? (
                <VStack spacing={4} py={8}>
                  <Spinner size="xl" color="blue.500" />
                  <Text>Adding faculty member...</Text>
                </VStack>
              ) : (
                <Card variant="outline" borderRadius="xl">
                  <CardBody p={6}>
                    <VStack spacing={6} align="stretch">
                      <Alert
                        status="info"
                        borderRadius="lg"
                        variant="left-accent"
                      >
                        <AlertIcon />
                        <AlertDescription fontSize="sm">
                          All fields are required. Moodle ID must be exactly 3
                          digits.
                        </AlertDescription>
                      </Alert>

                      {/* Name Fields */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isInvalid={!!formErrors.fname} isRequired>
                          <FormLabel fontWeight="500">First Name</FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <User size={16} color="gray" />
                            </InputLeftElement>
                            <Input
                              placeholder="Enter first name"
                              value={formData.fname}
                              onChange={(e) =>
                                handleInputChange("fname", e.target.value)
                              }
                              borderRadius="lg"
                              _focus={{
                                borderColor: "blue.500",
                                boxShadow: "0 0 0 1px blue.500",
                              }}
                            />
                            {formData.fname && !formErrors.fname && (
                              <InputRightElement>
                                <CheckCircle size={16} color="green" />
                              </InputRightElement>
                            )}
                          </InputGroup>
                          <FormErrorMessage>
                            {formErrors.fname}
                          </FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!formErrors.lname} isRequired>
                          <FormLabel fontWeight="500">Last Name</FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <User size={16} color="gray" />
                            </InputLeftElement>
                            <Input
                              placeholder="Enter last name"
                              value={formData.lname}
                              onChange={(e) =>
                                handleInputChange("lname", e.target.value)
                              }
                              borderRadius="lg"
                              _focus={{
                                borderColor: "blue.500",
                                boxShadow: "0 0 0 1px blue.500",
                              }}
                            />
                            {formData.lname && !formErrors.lname && (
                              <InputRightElement>
                                <CheckCircle size={16} color="green" />
                              </InputRightElement>
                            )}
                          </InputGroup>
                          <FormErrorMessage>
                            {formErrors.lname}
                          </FormErrorMessage>
                        </FormControl>
                      </SimpleGrid>

                      {/* Moodle ID */}
                      <FormControl isInvalid={!!formErrors.moodleid} isRequired>
                        <FormLabel fontWeight="500">Moodle ID</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Hash size={16} color="gray" />
                          </InputLeftElement>
                          <Input
                            placeholder="Enter 3-digit Moodle ID"
                            value={formData.moodleid}
                            onChange={(e) =>
                              handleInputChange("moodleid", e.target.value)
                            }
                            maxLength={3}
                            borderRadius="lg"
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px blue.500",
                            }}
                          />
                          {formData.moodleid && !formErrors.moodleid && (
                            <InputRightElement>
                              <CheckCircle size={16} color="green" />
                            </InputRightElement>
                          )}
                        </InputGroup>
                        <FormErrorMessage>
                          {formErrors.moodleid}
                        </FormErrorMessage>
                        {formData.moodleid &&
                          formData.moodleid.length < 3 &&
                          !formErrors.moodleid && (
                            <HStack spacing={2} mt={1}>
                              <Icon
                                as={AlertTriangle}
                                color="orange.500"
                                boxSize={3}
                              />
                              <Text fontSize="xs" color="orange.500">
                                {3 - formData.moodleid.length} more digits
                                needed
                              </Text>
                            </HStack>
                          )}
                      </FormControl>

                      {/* Email */}
                      <FormControl isInvalid={!!formErrors.email} isRequired>
                        <FormLabel fontWeight="500">Email Address</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Mail size={16} color="gray" />
                          </InputLeftElement>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            borderRadius="lg"
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px blue.500",
                            }}
                          />
                          {formData.email && !formErrors.email && (
                            <InputRightElement>
                              <CheckCircle size={16} color="green" />
                            </InputRightElement>
                          )}
                        </InputGroup>
                        <FormErrorMessage>{formErrors.email}</FormErrorMessage>
                      </FormControl>

                      {/* Gender */}
                      <FormControl isInvalid={!!formErrors.gender} isRequired>
                        <FormLabel fontWeight="500">Gender</FormLabel>
                        <RadioGroup
                          value={formData.gender}
                          onChange={(value) =>
                            handleInputChange("gender", value)
                          }
                        >
                          <HStack spacing={8}>
                            <Radio value="M" colorScheme="blue" size="lg">
                              <Text ml={2}>Male</Text>
                            </Radio>
                            <Radio value="F" colorScheme="blue" size="lg">
                              <Text ml={2}>Female</Text>
                            </Radio>
                            <Radio value="O" colorScheme="blue" size="lg">
                              <Text ml={2}>Other</Text>
                            </Radio>
                          </HStack>
                        </RadioGroup>
                        <FormErrorMessage>{formErrors.gender}</FormErrorMessage>
                      </FormControl>

                      {/* Form Summary */}
                      {isFormValid && (
                        <Card
                          variant="filled"
                          borderRadius="xl"
                          bg={useColorModeValue("green.50", "green.900/20")}
                          border="1px"
                          borderColor="green.200"
                        >
                          <CardBody p={4}>
                            <HStack spacing={3}>
                              <Icon
                                as={CheckCircle}
                                color="green.500"
                                boxSize={5}
                              />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="600" color="green.700">
                                  Ready to Configure Permissions
                                </Text>
                                <Text fontSize="sm" color="green.600">
                                  All required information has been provided
                                </Text>
                              </VStack>
                            </HStack>
                          </CardBody>
                        </Card>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </ModalBody>

            <ModalFooter borderTop="1px" borderColor={borderColor} gap={3}>
              <Button
                variant="outline"
                onClick={setClose}
                isDisabled={isLoading}
                leftIcon={<X size={16} />}
              >
                Cancel
              </Button>
              <Button
                leftIcon={<Shield size={16} />}
                colorScheme="purple"
                onClick={proceedToPermissions}
                isDisabled={!isFormValid || isLoading}
              >
                Configure Permissions
              </Button>
              <Button
                colorScheme="blue"
                onClick={addFaculty}
                isLoading={isLoading}
                loadingText="Adding..."
                leftIcon={<Save size={16} />}
                isDisabled={!isFormValid}
              >
                Add Faculty
              </Button>
            </ModalFooter>
          </MotionModalContent>
        </Modal>
      )}

      {/* Permissions Modal */}
      <Modal
        isOpen={isPermOpen}
        onClose={closePerms}
        size="4xl"
        scrollBehavior="inside"
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader borderBottom="1px" borderColor={borderColor}>
            <HStack spacing={3}>
              <Icon as={Settings} color="purple.500" boxSize={6} />
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="700">
                  Configure Permissions
                </Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Set access levels for {formData.fname} {formData.lname}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <VStack spacing={6} align="stretch">
              {/* Default Permission */}
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
                          Upload Faculty Certificates
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          Default permission - Cannot be changed
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      borderRadius="full"
                    >
                      Default
                    </Badge>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <HStack spacing={2}>
                    <Icon as={CheckCircle} color="green.500" boxSize={4} />
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
                    {Object.entries(CONFIG.PERMISSIONS).map(([key, config]) => {
                      if (key === "UFC") return null;

                      return (
                        <MotionCard
                          key={key}
                          variant="outline"
                          borderRadius="xl"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          _hover={{ borderColor: `${config.color}.300` }}
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
                                      <Text fontWeight="600">
                                        {config.label}
                                      </Text>
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
                        </MotionCard>
                      );
                    })}
                  </SimpleGrid>
                </CheckboxGroup>
              </VStack>

              <Divider />

              {/* House Coordinator */}
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
                      Faculty can only be assigned as coordinator for one house
                      at a time.
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
                            transition="background 0.2s"
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
                          transition="background 0.2s"
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

              {/* Permission Summary */}
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
            <Button
              variant="outline"
              onClick={closePerms}
              isDisabled={isLoading}
            >
              Back to Basic Info
            </Button>
            <Button
              colorScheme="green"
              onClick={closePerms}
              leftIcon={<CheckCircle size={16} />}
              isDisabled={isLoading}
            >
              Apply Permissions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AnimatePresence>
  );
};

export default FacultyAdd;
