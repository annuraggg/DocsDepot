import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  Textarea,
  HStack,
  VStack,
  Text,
  Box,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import {
  Settings,
  Star,
  Lock,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import { ChromePicker } from "react-color";
import { ExtendedHouse } from "@shared-types/ExtendedHouse";
import useUser from "@/config/user";

interface SettingsModalProps {
  house: ExtendedHouse;
  setHouse: React.Dispatch<React.SetStateAction<ExtendedHouse | null>>;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  house,
  setHouse,
  isOpen,
  onClose,
  onSave,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [validationErrors, setValidationErrors] = useState({
    abstract: "",
    desc: "",
  });

  const user = useUser();
  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === "A");
    }
  }, [user]);

  const validateWordCount = (text: string, maxWords: number) => {
    const words = text.trim().split(/\s+/);
    return words.length <= maxWords;
  };

  const handleAbstractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAbstract = e.target.value;

    if (!validateWordCount(newAbstract, 50)) {
      setValidationErrors((prev) => ({
        ...prev,
        abstract: "Abstract must be 50 words or less",
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        abstract: "",
      }));
    }

    setHouse({ ...house, abstract: newAbstract });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newDesc = e.target.value;

    if (!validateWordCount(newDesc, 200)) {
      setValidationErrors((prev) => ({
        ...prev,
        desc: "Description must be 200 words or less",
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        desc: "",
      }));
    }

    setHouse({ ...house, desc: newDesc });
  };

  const handleSave = () => {
    const abstractValid = validateWordCount(house.abstract, 50);
    const descValid = validateWordCount(house.desc, 200);

    if (!abstractValid || !descValid) {
      setValidationErrors({
        abstract: !abstractValid ? "Abstract must be 50 words or less" : "",
        desc: !descValid ? "Description must be 200 words or less" : "",
      });
      return;
    }

    onSave();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <Settings size={20} />
            <Text>House Settings</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <VStack spacing={2} align="stretch">
              <HStack spacing={1} color="gray.500" fontSize="sm">
                <Star size={12} />
                <Text>Required fields</Text>
              </HStack>
              <HStack spacing={1} color="gray.500" fontSize="sm">
                <Lock size={12} />
                <Text>Admin only fields</Text>
              </HStack>
            </VStack>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4}>
              <FormControl isRequired isDisabled={!isAdmin}>
                <FormLabel>House Name</FormLabel>
                <InputGroup>
                  {!isAdmin && (
                    <InputLeftElement>
                      <Lock size={16} />
                    </InputLeftElement>
                  )}
                  <Input
                    value={house.name}
                    onChange={(e) =>
                      setHouse({ ...house, name: e.target.value })
                    }
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired position="relative">
                <FormLabel>House Color</FormLabel>
                <InputGroup>
                  <Input
                    value={house.color}
                    onChange={(e) =>
                      setHouse({ ...house, color: e.target.value })
                    }
                  />
                  <InputRightElement>
                    <Box
                      w="24px"
                      h="24px"
                      border="1px"
                      borderRadius="full"
                      bg={house.color}
                      cursor="pointer"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    />
                  </InputRightElement>
                </InputGroup>
                {showColorPicker && (
                  <Box position="absolute" zIndex={2} mt={2}>
                    <ChromePicker
                      color={house.color}
                      onChange={(color) =>
                        setHouse({ ...house, color: color.hex })
                      }
                    />
                  </Box>
                )}
              </FormControl>
            </Box>

            <FormControl isRequired isInvalid={!!validationErrors.abstract}>
              <FormLabel>House Abstract</FormLabel>
              <Input value={house.abstract} onChange={handleAbstractChange} />
              <FormErrorMessage>{validationErrors.abstract}</FormErrorMessage>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Max 50 words
              </Text>
            </FormControl>

            <FormControl isInvalid={!!validationErrors.desc}>
              <FormLabel>House Description</FormLabel>
              <Textarea
                value={house.desc}
                onChange={handleDescriptionChange}
                size="sm"
                rows={6}
              />
              <FormErrorMessage>{validationErrors.desc}</FormErrorMessage>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Max 200 words
              </Text>
            </FormControl>

            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>
                Social Links
              </Text>
              <VStack spacing={3}>
                <FormControl>
                  <InputGroup>
                    <InputLeftElement>
                      <Instagram size={18} />
                    </InputLeftElement>
                    <Input
                      placeholder="Instagram URL"
                      value={house.social.instagram!}
                      onChange={(e) =>
                        setHouse({
                          ...house,
                          social: {
                            ...house.social,
                            instagram: e.target.value,
                          },
                        })
                      }
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <InputGroup>
                    <InputLeftElement>
                      <Twitter size={18} />
                    </InputLeftElement>
                    <Input
                      placeholder="Twitter URL"
                      value={house.social.twitter!}
                      onChange={(e) =>
                        setHouse({
                          ...house,
                          social: {
                            ...house.social,
                            twitter: e.target.value,
                          },
                        })
                      }
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <InputGroup>
                    <InputLeftElement>
                      <Linkedin size={18} />
                    </InputLeftElement>
                    <Input
                      placeholder="LinkedIn URL"
                      value={house.social.linkedin!}
                      onChange={(e) =>
                        setHouse({
                          ...house,
                          social: {
                            ...house.social,
                            linkedin: e.target.value,
                          },
                        })
                      }
                    />
                  </InputGroup>
                </FormControl>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" colorScheme="red" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              Save Changes
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
