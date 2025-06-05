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
  Select,
  VStack,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Text,
  HStack,
  Icon,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertDescription,
  Card,
  CardBody,
  Box,
  Progress,
  InputRightElement,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Hash,
  Home,
  UserPlus,
  CheckCircle,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";
import { House } from "@shared-types/House";
import useAxios from "@/config/axios";
import Loader from "@/components/Loader";

// Enhanced interfaces
interface StudentAddProps {
  setModal: (value: boolean) => void;
  houses: House[];
}

interface FormData {
  fname: string;
  lname: string;
  moodleid: string;
  email: string;
  gender: string;
  house: string;
}

interface FormErrors {
  fname?: string;
  lname?: string;
  moodleid?: string;
  email?: string;
  house?: string;
  gender?: string;
}

// Configuration constants
const CONFIG = {
  ANIMATION: {
    DURATION: 0.3,
    SPRING: { type: "spring", stiffness: 300, damping: 30 },
  },
  VALIDATION: {
    STUDENT_ID_LENGTH: 8,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    NAME_MIN_LENGTH: 2,
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
    errors.moodleid = "Student ID is required";
  } else if (!/^\d{8}$/.test(formData.moodleid.trim())) {
    errors.moodleid = "Student ID must be exactly 8 digits";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!CONFIG.VALIDATION.EMAIL_REGEX.test(formData.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!formData.house) {
    errors.house = "Please select a house";
  }

  if (!formData.gender) {
    errors.gender = "Please select a gender";
  }

  return errors;
};

const StudentAdd: React.FC<StudentAddProps> = ({
  setModal,
  houses: initialHouses,
}) => {
  // State management
  const [formData, setFormData] = useState<FormData>({
    fname: "",
    lname: "",
    moodleid: "",
    email: "",
    gender: "M",
    house: "",
  });
  const [houses, setHouses] = useState<House[]>(initialHouses);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchingHouses, setFetchingHouses] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const axios = useAxios();

  // Color mode values
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Memoized calculations
  const isFormValid = useMemo(() => {
    const errors = validateForm(formData);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const formProgress = useMemo(() => {
    const totalFields = 6; // fname, lname, moodleid, email, gender, house
    const filledFields = Object.values(formData).filter(
      (value) => value.trim() !== ""
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  }, [formData]);

  // Event handlers
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      // Special handling for moodleid - only allow digits and limit to 8 characters
      if (field === "moodleid") {
        const digitsOnly = value
          .replace(/\D/g, "")
          .slice(0, CONFIG.VALIDATION.STUDENT_ID_LENGTH);
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

  const setClose = useCallback(() => {
    setModal(false);
    onClose();
    setFormData({
      fname: "",
      lname: "",
      moodleid: "",
      email: "",
      gender: "M",
      house: "",
    });
    setFormErrors({});
  }, [setModal, onClose]);

  const addStudent = useCallback(async () => {
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
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

    setIsLoading(true);

    const data = {
      fname: formData.fname.trim(),
      lname: formData.lname.trim(),
      mid: formData.moodleid.trim(),
      email: formData.email.trim().toLowerCase(),
      house: formData.house,
      gender: formData.gender,
      role: "S",
    };

    try {
      await axios.post("/user/student", data);

      toast({
        title: "Student Added Successfully",
        description: `${formData.fname} ${formData.lname} has been added to the system`,
        status: "success",
        duration: CONFIG.TOAST.DURATION.SUCCESS,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });

      setClose();
    } catch (err: any) {
      console.error("Student add error:", err);

      if (err.response?.status === 409) {
        const field = err.response?.data?.field;
        if (field === "mid") {
          setFormErrors({ moodleid: "This Student ID already exists" });
        } else if (field === "email") {
          setFormErrors({ email: "This email is already registered" });
        }

        toast({
          title: "Duplicate Entry",
          description: "A student with this ID or email already exists",
          status: "error",
          duration: CONFIG.TOAST.DURATION.ERROR,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });
      } else {
        const errorMessage =
          err.response?.data?.message || "Failed to add student";

        toast({
          title: "Error Adding Student",
          description: errorMessage,
          status: "error",
          duration: CONFIG.TOAST.DURATION.ERROR,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, axios, toast, setClose]);

  // Effects
  useEffect(() => {
    onOpen();
    if (initialHouses.length === 0) {
      setFetchingHouses(true);
      axios
        .get("/houses")
        .then((res) => {
          setHouses(res.data.data);
        })
        .catch((err) => {
          console.error("Error fetching houses:", err);
          toast({
            title: "Error",
            description:
              err.response?.data?.message || "Failed to fetch houses",
            status: "error",
            duration: CONFIG.TOAST.DURATION.ERROR,
            isClosable: true,
            position: CONFIG.TOAST.POSITION,
          });
        })
        .finally(() => {
          setFetchingHouses(false);
        });
    }
  }, [axios, initialHouses.length, onOpen, toast]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={setClose}
          size="xl"
          closeOnOverlayClick={!isLoading}
          motionPreset="slideInBottom"
        >
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <MotionModalContent
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={CONFIG.ANIMATION.SPRING}
            mx={4}
            borderRadius="xl"
          >
            <ModalHeader borderBottom="1px" borderColor={borderColor}>
              <VStack align="start" spacing={3}>
                <HStack spacing={3}>
                  <Icon as={UserPlus} color="blue.500" boxSize={6} />
                  <Text fontSize="lg" fontWeight="700">
                    Add New Student
                  </Text>
                </HStack>
                <Box w="full">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">
                      Student Information
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
            <ModalCloseButton isDisabled={isLoading} />

            <ModalBody py={6}>
              {fetchingHouses ? (
                <VStack spacing={4} py={8}>
                  <Loader />
                  <Text color="gray.600">Loading houses...</Text>
                </VStack>
              ) : isLoading ? (
                <VStack spacing={4} py={8}>
                  <Spinner size="xl" color="blue.500" />
                  <Text>Adding student...</Text>
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
                          All fields are required. Student ID must be exactly 8
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

                      {/* Student ID */}
                      <FormControl isInvalid={!!formErrors.moodleid} isRequired>
                        <FormLabel fontWeight="500">Student ID</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Hash size={16} color="gray" />
                          </InputLeftElement>
                          <Input
                            placeholder="Enter 8-digit student ID"
                            value={formData.moodleid}
                            onChange={(e) =>
                              handleInputChange("moodleid", e.target.value)
                            }
                            maxLength={8}
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
                          formData.moodleid.length < 8 &&
                          !formErrors.moodleid && (
                            <HStack spacing={2} mt={1}>
                              <Icon
                                as={AlertTriangle}
                                color="orange.500"
                                boxSize={3}
                              />
                              <Text fontSize="xs" color="orange.500">
                                {8 - formData.moodleid.length} more digits
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
                            placeholder="Enter email address"
                            type="email"
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

                      {/* House Assignment */}
                      <FormControl isInvalid={!!formErrors.house} isRequired>
                        <FormLabel fontWeight="500">House Assignment</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Home size={16} color="gray" />
                          </InputLeftElement>
                          <Select
                            placeholder="Select a house"
                            onChange={(e) =>
                              handleInputChange("house", e.target.value)
                            }
                            value={formData.house}
                            pl={10}
                            borderRadius="lg"
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px blue.500",
                            }}
                          >
                            {houses.map((house) => (
                              <option value={house._id} key={house._id}>
                                {house.name}
                              </option>
                            ))}
                          </Select>
                        </InputGroup>
                        <FormErrorMessage>{formErrors.house}</FormErrorMessage>
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
                                  Ready to Add Student
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
                borderRadius="lg"
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={addStudent}
                leftIcon={isLoading ? undefined : <Save size={16} />}
                isLoading={isLoading}
                loadingText="Adding Student..."
                isDisabled={fetchingHouses || !isFormValid}
                borderRadius="lg"
              >
                Add Student
              </Button>
            </ModalFooter>
          </MotionModalContent>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default StudentAdd;
