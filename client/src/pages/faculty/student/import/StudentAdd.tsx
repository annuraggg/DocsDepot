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
import Loader from "@/components/Loader";

const MotionModalContent = motion(ModalContent);

interface StudentAddProps {
  setModal: (value: boolean) => void;
  houses: House[];
}

const StudentAdd = ({ setModal, houses: initialHouses }: StudentAddProps) => {
  const [houses, setHouses] = React.useState<House[]>(initialHouses);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetchingHouses, setIsFetchingHouses] = React.useState(false);
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
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    setIsFetchingHouses(true);
    try {
      const res = await axios.get("/houses");
      setHouses(res.data.data);
    } catch (err: any) {
      console.error("Error fetching houses:", err);
      toast({
        title: "Failed to Load Houses",
        description: err?.response?.data?.message || "Unable to load house list",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsFetchingHouses(false);
    }
  };

  const setClose = () => {
    if (!isLoading) {
      setModal(false);
      onClose();
    }
  };

  const validateForm = () => {
    if (!fname.trim() || !lname.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both first and last name",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!moodleid || moodleid.length !== 8 || !/^\d+$/.test(moodleid)) {
      toast({
        title: "Invalid Moodle ID",
        description: "Moodle ID must be exactly 8 digits",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!house) {
      toast({
        title: "House Required",
        description: "Please select a house for the student",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const addStudent = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const data = {
      fname: fname.trim(),
      lname: lname.trim(),
      mid: moodleid,
      email: email.trim(),
      house: house,
      gender: gender,
      role: "S"
    };

    try {
      const res = await axios.post("/user/student", data);
      
      if (res.status === 200) {
        toast({
          title: "Success",
          description: "Student has been added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setClose();
      }
    } catch (err: any) {
      console.error("Error adding student:", err);
      const errorMessage = err?.response?.status === 409
        ? "A student with this Moodle ID already exists"
        : err?.response?.data?.message || "Failed to add student";
      
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal 
          isOpen={isOpen} 
          onClose={setClose} 
          closeOnOverlayClick={!isLoading}
        >
          <ModalOverlay
            bg="blackAlpha.300"
            backdropFilter="blur(10px)"
          />
          <MotionModalContent
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            mx={4}
          >
            <ModalHeader fontSize="2xl">Add New Student</ModalHeader>
            <ModalCloseButton isDisabled={isLoading} />
            <ModalBody>
              <VStack spacing={6}>
                {isFetchingHouses ? (
                  <div className="w-full flex justify-center py-4">
                    <Loader />
                  </div>
                ) : (
                  <>
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
                            isDisabled={isLoading}
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
                            isDisabled={isLoading}
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
                          isDisabled={isLoading}
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
                          isDisabled={isLoading}
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
                          isDisabled={isLoading}
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
                      <RadioGroup 
                        onChange={setGender} 
                        value={gender}
                        isDisabled={isLoading}
                      >
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
                  </>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter gap={3}>
              <Button 
                variant="ghost" 
                onClick={setClose}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={addStudent}
                leftIcon={<UserPlus size={18} />}
                isLoading={isLoading}
                loadingText="Adding Student"
                isDisabled={isFetchingHouses}
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