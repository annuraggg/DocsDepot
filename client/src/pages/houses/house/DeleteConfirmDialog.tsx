import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@chakra-ui/react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {title}
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            {description}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="default" 
            variant="light" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            color="danger" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};