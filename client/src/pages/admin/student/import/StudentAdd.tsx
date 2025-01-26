import React, { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Radio,
  RadioGroup,
  Stack,
  Input,
  useToast,
  Select,
  VStack,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Hash, Home, UserPlus } from "lucide-react";
import { House } from "@shared-types/House";
import useAxios from "@/config/axios";

const MotionModalContent = motion(ModalContent);

interface StudentAddProps {
  setModal: (value: boolean) => void;
  houses: House[];
}

const StudentAdd = ({ setModal, houses: initialHouses }: StudentAddProps) => {
  const [houses, setHouses] = React.useState<House[]>(initialHouses);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [gender, setGender] = React.useState("Male");
  const [fname, setFname] = React.useState("");
  const [lname, setLname] = React.useState("");
  const [moodleid, setMoodleid] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [house, setHouse] = React.useState("");

  const toast = useToast();
  const axios = useAxios();

  useEffect(() => {
    onOpen();
    axios
      .get("/houses")
      .then((res) => {
        setHouses(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: err.response.data.message || "Failed to fetch houses",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, []);

  const setClose = () => {
    setModal(false);
    onClose();
  };

  const addStudent = () => {
    const data = {
      fname: fname,
      lname: lname,
      mid: moodleid,
      email: email,
      house: house,
      gender: gender,
      role: "S",
    };

    if (moodleid.length !== 8) {
      toast({
        title: "Error",
        description: "Moodle ID must be 8 digits",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    axios
      .post("/user/student", data)
      .then(() => {
        setClose();
        toast({
          title: "Student Added",
          description: "Student has been added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        if (err.response.status === 409) {
          toast({
            title: "Error",
            description: "Moodle ID already exists",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        console.error(err);
        toast({
          title: "Error",
          description: err.response.data.message || "Failed to add student",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={setClose}>
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <MotionModalContent
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            mx={4}
          >
            <ModalHeader fontSize="2xl">Add New Student</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6}>
                <Stack direction={["column", "row"]} spacing={4} w="full">
                  <FormControl>
                    <FormLabel>First Name</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <User size={18} />
                      </InputLeftElement>
                      <Input
                        placeholder="First Name"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Last Name</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <User size={18} />
                      </InputLeftElement>
                      <Input
                        placeholder="Last Name"
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>
                </Stack>

                <FormControl>
                  <FormLabel>Moodle ID</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Hash size={18} />
                    </InputLeftElement>
                    <Input
                      placeholder="Moodle ID"
                      value={moodleid}
                      onChange={(e) => setMoodleid(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Mail size={18} />
                    </InputLeftElement>
                    <Input
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>House</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Home size={18} />
                    </InputLeftElement>
                    <Select
                      placeholder="Select a House"
                      onChange={(e) => setHouse(e.target.value)}
                      value={house}
                      pl={10}
                    >
                      {houses.map((house) => (
                        <option value={house._id} key={house._id}>
                          {house.name}
                        </option>
                      ))}
                    </Select>
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Gender</FormLabel>
                  <RadioGroup onChange={setGender} value={gender}>
                    <Stack direction="row" spacing={6}>
                      <Radio value="M" colorScheme="blue">
                        Male
                      </Radio>
                      <Radio value="F" colorScheme="pink">
                        Female
                      </Radio>
                      <Radio value="O" colorScheme="purple">
                        Others
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter gap={3}>
              <Button variant="ghost" onClick={setClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={addStudent}
                leftIcon={<UserPlus size={18} />}
              >
                Add Student
              </Button>
            </ModalFooter>
          </MotionModalContent>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default StudentAdd;
