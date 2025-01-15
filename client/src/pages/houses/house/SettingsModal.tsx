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
  InputRightElement,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Settings, Star, Lock } from "lucide-react";
import { ChromePicker } from "react-color";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseName: string;
  houseColor: string;
  houseAbstract: string;
  houseDesc: string;
  isAdmin: boolean;
  onNameChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onAbstractChange: (value: string) => void;
  onDescChange: (value: string) => void;
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
  onNameChange,
  onColorChange,
  onAbstractChange,
  onDescChange,
  onSave,
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

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
                    <Box
                      position="absolute"
                      left={3}
                      top="50%"
                      transform="translateY(-50%)"
                      zIndex={1}
                    >
                      <Lock size={16} />
                    </Box>
                  )}
                  <Input
                    value={houseName}
                    onChange={(e) => onNameChange(e.target.value)}
                    pl={!isAdmin ? 10 : 4}
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
