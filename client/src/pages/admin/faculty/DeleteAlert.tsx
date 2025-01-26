import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { DeleteAlertProps } from '../../../types/faculty';

const DeleteAlert: React.FC<DeleteAlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cancelRef,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      >
        <AlertDialogContent 
          as={motion.div}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          mx={4}
        >
          <AlertDialogHeader fontSize="lg" fontWeight="bold" textAlign="center">
            <Flex direction="column" align="center" mb={2}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <AlertTriangle size={40} color="red" />
              </motion.div>
              Delete Faculty Member
            </Flex>
          </AlertDialogHeader>

          <AlertDialogBody textAlign="center">
            This action cannot be undone. Are you sure you want to proceed?
          </AlertDialogBody>

          <AlertDialogFooter justifyContent="center" gap={3}>
            <Button ref={cancelRef} onClick={onClose} size="md" width="100px">
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={onConfirm} 
              size="md" 
              width="100px"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteAlert;