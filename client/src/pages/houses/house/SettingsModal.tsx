import React from "react";
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
import { Settings, Star, Lock, Instagram, Twitter, Linkedin } from "lucide-react";
import { ChromePicker } from "react-color";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseName: string;
  houseColor: string;
  houseAbstract: string;
  houseDesc: string;
  isAdmin: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  onNameChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onAbstractChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onSocialLinksChange?: (type: 'instagram' | 'twitter' | 'linkedin', value: string) => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  houseName,
  houseColor,
  houseAbstract,
  houseDesc,
  isAdmin,
  socialLinks = {}, // Provide default empty object
  onNameChange,
  onColorChange,
  onAbstractChange,
  onDescChange,
  onSocialLinksChange = () => {}, // Provide default no-op function
  onSave,
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  // Safely access social links with defaults
  const {
    instagram = '',
    twitter = '',
    linkedin = ''
  } = socialLinks;

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
                    value={houseName}
                    onChange={(e) => onNameChange(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired position="relative">
                <FormLabel>House Color</FormLabel>
                <InputGroup>
                  <Input
                    value={houseColor}
                    onChange={(e) => onColorChange(e.target.value)}
                  />
                  <InputRightElement>
                    <Box
                      w="24px"
                      h="24px"
                      borderRadius="full"
                      bg={houseColor}
                      cursor="pointer"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    />
                  </InputRightElement>
                </InputGroup>
                {showColorPicker && (
                  <Box position="absolute" zIndex={2} mt={2}>
                    <ChromePicker
                      color={houseColor}
                      onChange={(color) => onColorChange(color.hex)}
                    />
                  </Box>
                )}
              </FormControl>
            </Box>

            <FormControl isRequired>
              <FormLabel>House Abstract</FormLabel>
              <Input
                value={houseAbstract}
                onChange={(e) => onAbstractChange(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>House Description</FormLabel>
              <Textarea
                value={houseDesc}
                onChange={(e) => onDescChange(e.target.value)}
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
                      value={instagram}
                      onChange={(e) => onSocialLinksChange('instagram', e.target.value)}
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
                      value={twitter}
                      onChange={(e) => onSocialLinksChange('twitter', e.target.value)}
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
                      value={linkedin}
                      onChange={(e) => onSocialLinksChange('linkedin', e.target.value)}
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