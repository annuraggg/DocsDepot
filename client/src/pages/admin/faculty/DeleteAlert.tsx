import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  VStack,
  Text,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
} from "@chakra-ui/react";

interface DeleteAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelRef: React.RefObject<HTMLButtonElement>;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

const MotionAlertDialogContent = motion(AlertDialogContent);

const DeleteAlert: React.FC<DeleteAlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cancelRef,
  title = "Delete Faculty Member",
  message = "This action cannot be undone. Are you sure you want to proceed?",
  isLoading = false,
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      motionPreset="slideInBottom"
    >
      <AlertDialogOverlay backdropFilter="blur(8px)">
        <MotionAlertDialogContent
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{
            duration: 0.2,
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          borderRadius="xl"
          mx={4}
        >
          <AlertDialogHeader
            borderBottom="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <VStack spacing={4}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <Icon
                  as={AlertTriangle}
                  boxSize={12}
                  color="red.500"
                  filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                />
              </motion.div>
              <Text fontSize="lg" fontWeight="700">
                {title}
              </Text>
            </VStack>
          </AlertDialogHeader>

          <AlertDialogBody py={6}>
            <VStack spacing={4}>
              <Text textAlign="center" color="gray.600">
                {message}
              </Text>

              <Alert status="error" borderRadius="xl" variant="left-accent">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <AlertTitle fontSize="sm">Warning!</AlertTitle>
                  <AlertDescription fontSize="sm">
                    This will permanently remove the faculty member and all
                    associated data from the system.
                  </AlertDescription>
                </VStack>
              </Alert>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter borderTop="1px" borderColor={borderColor} gap={3}>
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="outline"
              borderRadius="lg"
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={onConfirm}
              leftIcon={<Trash2 size={16} />}
              borderRadius="lg"
              isLoading={isLoading}
              loadingText="Deleting..."
            >
              Delete Faculty
            </Button>
          </AlertDialogFooter>
        </MotionAlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteAlert;
