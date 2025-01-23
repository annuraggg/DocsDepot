import React, { useEffect } from "react";
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
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  house,
  setHouse,
  isOpen,
  onClose,
  onSave,
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const user = useUser();
  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === "A");
    }
  }, [user]);

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

            <FormControl isRequired>
              <FormLabel>House Abstract</FormLabel>
              <Input
                value={house.abstract}
                onChange={(e) =>
                  setHouse({ ...house, abstract: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>House Description</FormLabel>
              <Textarea
                value={house.desc}
                onChange={(e) => setHouse({ ...house, desc: e.target.value })}
                size="sm"
                rows={6}
              />
            </FormControl>

            {/* Social Links Section */}
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
            <Button colorScheme="blue" onClick={onSave}>
              Save Changes
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
