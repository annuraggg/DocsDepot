import React, { useState } from "react";
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
  VStack,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import useAxios from "@/config/axios";
import { ExtendedCertificate } from "@/types/ExtendedCertificate";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: ExtendedCertificate;
  onDelete: () => void;
}

export const DeleteCertificateModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  certificate,
  onDelete,
}) => {
  const axios = useAxios();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await axios.delete(`/certificates/${certificate._id}`);
      console.log('Certificate deleted successfully:', response.data);
      
      toast({
        title: "Certificate Deleted",
        description: response.data?.message || "Certificate deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      
      onDelete();
      onClose();
    } catch (err: any) {
      console.error('Error deleting certificate:', err);
      
      toast({
        title: "Delete Failed",
        description: err.response?.data?.message || 
                    "Failed to delete certificate. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      motionPreset="slideInBottom"
      closeOnOverlayClick={!isDeleting}
      closeOnEsc={!isDeleting}
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent>
        <ModalHeader>
          <VStack spacing={2} align="center">
            <Icon as={Trash2} color="red.500" boxSize={10} />
            <Text>Delete Certificate</Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton disabled={isDeleting} />

        <ModalBody>
          <VStack spacing={4} textAlign="center">
            <Text fontWeight="bold">Are you sure?</Text>
            <Text>
              You are about to delete the certificate:{" "}
              <Text as="span" color="blue.500" fontWeight="medium">
                {certificate.name}
              </Text>
            </Text>
            <Text color="red.500" fontSize="sm">
              This action cannot be undone.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="ghost" 
            mr={3} 
            onClick={onClose}
            isDisabled={isDeleting}
            colorScheme="red"
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleDelete}
            isLoading={isDeleting}
            loadingText="Deleting..."
            leftIcon={<Trash2 />}
          >
            Delete Certificate
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteCertificateModal;