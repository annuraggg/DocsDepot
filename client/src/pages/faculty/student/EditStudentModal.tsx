import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Select,
  VStack
} from '@chakra-ui/react';
import { User, Gender, Social } from '@shared-types/User';
import { House } from '@/types/house';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User | null;
  houses: House[];
  onUpdate: (updatedStudent: Partial<User>) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  houses,
  onUpdate
}) => {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [house, setHouse] = useState('');
  const [gender, setGender] = useState<Gender>('M');

  useEffect(() => {
    if (student) {
      setFname(student.fname);
      setLname(student.lname);
      setEmail(student.social.email);
      setHouse(student.house);
      setGender(student.gender);
    }
  }, [student]);

  const handleUpdate = () => {
    if (student) {
      const updatedSocial: Social = {
        email,
        github: student.social.github,
        linkedin: student.social.linkedin
      };

      onUpdate({
        mid: student.mid,
        fname,
        lname,
        social: updatedSocial,
        house,
        gender
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Student Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Input
              placeholder="First Name"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
            />
            <Input
              placeholder="Last Name"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Select
              placeholder="Select House"
              value={house}
              onChange={(e) => setHouse(e.target.value)}
            >
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Select Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Others</option>
            </Select>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="green" onClick={handleUpdate}>
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};