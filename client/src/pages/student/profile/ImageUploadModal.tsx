import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ZoomIn } from "lucide-react";
import AvatarEditor from "react-avatar-editor";

const MotionModalContent = motion(ModalContent);

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  newImage: File | undefined;
  zoom: number;
  setZoom: (value: number) => void;
  newImageRef: React.RefObject<AvatarEditor>;
  btnLoading: boolean;
  uploadImage: () => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  newImage,
  zoom,
  setZoom,
  newImageRef,
  btnLoading,
  uploadImage,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay className="backdrop-blur-sm" />
          <MotionModalContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-xl"
          >
            <ModalHeader className="flex items-center gap-2">
              <Camera className="text-purple-600" size={20} />
              <Text>Update Profile Picture</Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex className="flex-col items-center gap-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <AvatarEditor
                    image={newImage || ""}
                    width={250}
                    height={250}
                    border={50}
                    borderRadius={125}
                    color={[0, 0, 0, 0.6]}
                    scale={zoom}
                    rotate={0}
                    className="ring-4 ring-purple-100"
                    ref={newImageRef}
                  />
                </motion.div>
                <Box className="w-full space-y-2">
                  <Flex className="items-center gap-2 text-gray-600">
                    <ZoomIn size={16} />
                    <Text>Adjust Zoom</Text>
                  </Flex>
                  <Slider
                    aria-label="zoom-slider"
                    min={1.2}
                    max={2.5}
                    step={0.1}
                    value={zoom}
                    onChange={setZoom}
                  >
                    <SliderTrack className="bg-purple-100">
                      <SliderFilledTrack className="bg-purple-500" />
                    </SliderTrack>
                    <SliderThumb className="bg-white border-2 border-purple-500" />
                  </Slider>
                </Box>
              </Flex>
            </ModalBody>

            <ModalFooter className="space-x-3">
              <Button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={uploadImage}
                isLoading={btnLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save Changes
              </Button>
            </ModalFooter>
          </MotionModalContent>
        </Modal>
      )}
    </AnimatePresence>
  );
};