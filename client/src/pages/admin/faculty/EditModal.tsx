import React from 'react';
import { motion } from 'framer-motion';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Radio,
  Grid,
  VStack,
  HStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { EditModalProps } from '../../../types/faculty';

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onPermsOpen,
  facultyData,
  setFacultyData,
  updateFaculty,
}) => {
  const MotionVStack = motion(VStack);
  const MotionFormControl = motion(FormControl);
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={isMobile ? "full" : "xl"}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent 
        as={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        mx={4}
      >
        <ModalHeader>Edit Faculty Member</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <MotionVStack
            spacing={6}
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            <Grid templateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"} gap={4} width="100%">
              <MotionFormControl
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <FormLabel>First Name</FormLabel>
                <Input
                  value={facultyData.fname}
                  onChange={(e) => setFacultyData({ ...facultyData, fname: e.target.value })}
                  shadow="sm"
                  _focus={{ shadow: "md" }}
                />
              </MotionFormControl>

              <MotionFormControl
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={facultyData.lname}
                  onChange={(e) => setFacultyData({ ...facultyData, lname: e.target.value })}
                  shadow="sm"
                  _focus={{ shadow: "md" }}
                />
              </MotionFormControl>
            </Grid>

            <MotionFormControl
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={facultyData.email}
                onChange={(e) => setFacultyData({ ...facultyData, email: e.target.value })}
                shadow="sm"
                _focus={{ shadow: "md" }}
              />
            </MotionFormControl>

            <MotionFormControl
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <FormLabel>Gender</FormLabel>
              <RadioGroup
                value={facultyData.gender}
                onChange={(value) => setFacultyData({ ...facultyData, gender: value })}
              >
                <HStack spacing={6}>
                  <Radio value="Male">Male</Radio>
                  <Radio value="Female">Female</Radio>
                  <Radio value="Others">Others</Radio>
                </HStack>
              </RadioGroup>
            </MotionFormControl>
          </MotionVStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={() => {
              onClose();
              onPermsOpen();
            }}
            mr={2}
          >
            Configure Permissions
          </Button>
          <Button colorScheme="blue" onClick={updateFaculty}>
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditModal;