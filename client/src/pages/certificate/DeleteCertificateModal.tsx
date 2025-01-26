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
  const [btnLoading, setBtnLoading] = useState(false);

  const handleDelete = async () => {
    setBtnLoading(true);

    try {
      await axios.delete(`/certificates/${certificate._id}`);
      toast({
        title: "Success",
        description: "Certificate deleted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      onDelete();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent>
        <ModalHeader>
          <VStack spacing={2} align="center">
            <Icon as={Trash2} color="red.500" boxSize={10} />
            <Text>Delete Certificate</Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} textAlign="center">
            <Text fontWeight="bold">Are you sure?</Text>
            <Text>
              You are about to delete the certificate: 
              <Text as="span" color="blue.500" ml={1}>
                {certificate.name}
              </Text>
            </Text>
            <Text color="red.500" fontSize="sm">
              This action cannot be undone.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleDelete}
            isLoading={btnLoading}
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