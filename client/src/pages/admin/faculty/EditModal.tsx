import React from "react";
import { motion } from "framer-motion";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Radio,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { User, Mail, Edit3, Settings, Save, UserCheck } from "lucide-react";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermsOpen: () => void;
  facultyData: {
    fname: string;
    lname: string;
    email: string;
    gender: string;
  };
  setFacultyData: (data: any) => void;
  updateFaculty: () => void;
}

const MotionModalContent = motion(ModalContent);

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onPermsOpen,
  facultyData,
  setFacultyData,
  updateFaculty,
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  const isFormValid = () => {
    return (
      facultyData.fname.trim() !== "" &&
      facultyData.lname.trim() !== "" &&
      facultyData.email.trim() !== "" &&
      facultyData.gender !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(facultyData.email)
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <MotionModalContent
        initial={{ y: -20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        borderRadius="xl"
        mx={4}
      >
        <ModalHeader borderBottom="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Icon as={Edit3} color="blue.500" boxSize={6} />
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="700">
                Edit Faculty Member
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="normal">
                Update faculty information and settings
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Personal Information */}
            <Card variant="outline" borderRadius="xl">
              <CardBody p={6}>
                <VStack spacing={5} align="stretch">
                  <HStack spacing={3} mb={3}>
                    <Icon as={User} color="blue.500" boxSize={5} />
                    <Text fontSize="md" fontWeight="600">
                      Personal Information
                    </Text>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="500" mb={2}>
                        First Name
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <User size={16} color="gray" />
                        </InputLeftElement>
                        <Input
                          value={facultyData.fname}
                          onChange={(e) =>
                            setFacultyData({
                              ...facultyData,
                              fname: e.target.value,
                            })
                          }
                          placeholder="Enter first name"
                          borderRadius="lg"
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px blue.500",
                          }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="500" mb={2}>
                        Last Name
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <User size={16} color="gray" />
                        </InputLeftElement>
                        <Input
                          value={facultyData.lname}
                          onChange={(e) =>
                            setFacultyData({
                              ...facultyData,
                              lname: e.target.value,
                            })
                          }
                          placeholder="Enter last name"
                          borderRadius="lg"
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px blue.500",
                          }}
                        />
                      </InputGroup>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel fontWeight="500" mb={2}>
                      Email Address
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Mail size={16} color="gray" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={facultyData.email}
                        onChange={(e) =>
                          setFacultyData({
                            ...facultyData,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email address"
                        borderRadius="lg"
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px blue.500",
                        }}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="500" mb={3}>
                      Gender
                    </FormLabel>
                    <RadioGroup
                      value={facultyData.gender}
                      onChange={(value) =>
                        setFacultyData({ ...facultyData, gender: value })
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
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card variant="outline" borderRadius="xl" bg={cardBg}>
              <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={3}>
                    <Icon as={Settings} color="purple.500" boxSize={5} />
                    <Text fontSize="md" fontWeight="600">
                      Advanced Settings
                    </Text>
                  </HStack>

                  <Text fontSize="sm" color="gray.600">
                    Configure permissions and access levels for this faculty
                    member
                  </Text>

                  <Button
                    leftIcon={<UserCheck size={16} />}
                    colorScheme="purple"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onPermsOpen();
                    }}
                    borderRadius="lg"
                  >
                    Configure Permissions
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Validation Alert */}
            {!isFormValid() && (
              <Alert status="warning" borderRadius="xl" variant="left-accent">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Please fill in all required fields with valid information
                  before saving.
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={borderColor} gap={3}>
          <Button variant="outline" onClick={onClose} borderRadius="lg">
            Cancel
          </Button>
          <Button
            leftIcon={<Save size={16} />}
            colorScheme="blue"
            onClick={updateFaculty}
            isDisabled={!isFormValid()}
            borderRadius="lg"
          >
            Save Changes
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  );
};

export default EditModal;
