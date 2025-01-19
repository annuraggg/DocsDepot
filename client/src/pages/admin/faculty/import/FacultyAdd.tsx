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
  VStack,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Box,
  List,
  ListItem,
  ListIcon,
  Table,
  Tbody,
  Tr,
  Td,
  Checkbox,
  CheckboxGroup,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Hash, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { House } from "@shared-types/House";
import useAxios from "@/config/axios";

const MotionModalContent = motion(ModalContent);

interface FacultyAddProps {
  setModal: (value: boolean) => void;
  h: { houses: House[] };
}

const FacultyAdd: React.FC<FacultyAddProps> = ({ setModal, h }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isPermOpen,
    onOpen: openPerms,
    onClose: setPermClose,
  } = useDisclosure();
  const [gender, setGender] = React.useState("Male");
  const [fname, setFname] = React.useState("");
  const [lname, setLname] = React.useState("");
  const [moodleid, setMoodleid] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [perms, setPerms] = React.useState(["UFC"]);
  const [houses, setHouses] = React.useState<House[]>([]);

  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const houseObjects = h.houses.map((house: House) => house);
    setHouses(houseObjects);
    onOpen();
  }, []);

  const setClose = () => {
    setModal(false);
    onClose();
  };

  const axios = useAxios();

  const addFaculty = () => {
    const data = {
      fname: fname,
      lname: lname,
      mid: moodleid,
      email: email,
      gender: gender,
      perms: perms,
      role: "F",
    };

    function checkElements(arr: string | string[]) {
      const elementsToCheck = ["HCO0", "HCO1", "HCO2", "HCO3"];
      let count = 0;
      for (const element of elementsToCheck) {
        if (arr.includes(element)) {
          count++;
          if (count > 1) return false;
        }
      }
      return true;
    }

    if (!checkElements(perms)) {
      toast({
        title: "Error",
        description: "Please select only one house coordinator",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    axios.post("/user/faculty", data).then((res) => {
      if (res.status === 200) {
        setClose();
        toast({
          title: "Faculty Added",
          description: "Faculty has been added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (res.status === 409) {
        toast({
          title: "Error",
          description: "Moodle ID already exists",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    });
  };

  const closePerms = () => {
    setPermClose();
    onOpen();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={setClose} size="xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <MotionModalContent
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            mx={4}
          >
            <ModalHeader fontSize="2xl">Add New Faculty</ModalHeader>
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
              <Button
                leftIcon={<Shield size={18} />}
                colorScheme="purple"
                onClick={() => {
                  onClose();
                  openPerms();
                }}
              >
                Configure Permissions
              </Button>
              <Button variant="ghost" onClick={setClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={addFaculty}>
                Add Faculty
              </Button>
            </ModalFooter>
          </MotionModalContent>
        </Modal>
      )}

      <Modal
        isOpen={isPermOpen}
        onClose={closePerms}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <MotionModalContent
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <ModalHeader fontSize="2xl">Faculty Permissions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              bg={bgColor}
              borderRadius="lg"
              shadow="xl"
              border="1px"
              borderColor={borderColor}
              p={4}
            >
              <CheckboxGroup>
                <Table variant="simple">
                  <Tbody>
                    <CheckboxGroup
                      value={perms}
                      onChange={(e) => setPerms(e as string[])}
                    >
                      <Tr>
                        <Td>
                          <Checkbox value="UFC" isDisabled defaultChecked>
                            Upload Faculty Certificates
                          </Checkbox>
                        </Td>
                        <Td>
                          <List spacing={2}>
                            <ListItem>
                              <ListIcon as={AlertTriangle} color="yellow.500" />
                              Default permission - Cannot be changed
                            </ListItem>
                            <ListItem>
                              <ListIcon as={CheckCircle} color="green.500" />
                              Add their own certifications to the system
                            </ListItem>
                          </List>
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <Checkbox value="MHI">Manage Events</Checkbox>
                        </Td>
                        <Td>
                          <List spacing={2}>
                            <ListItem>
                              <ListIcon as={CheckCircle} color="green.500" />
                              Create and Update Events
                            </ListItem>
                          </List>
                        </Td>
                      </Tr>
                      <RadioGroup
                        value={perms.find((perm) => perm.startsWith("HCO")) || ""}
                        onChange={(value) => {
                          setPerms((prev) =>
                            [
                              ...prev.filter((perm) => !perm.startsWith("HCO")),
                              value,
                            ].filter(Boolean)
                          );
                        }}
                      >
                        <Flex direction="column" gap={3}>
                          {houses.map((house, index) => (
                            <Radio key={index} value={`HCO${index}`} colorScheme="blue">
                              House Coordinator - {house.name}
                            </Radio>
                          ))}
                          <Radio value="" colorScheme="blue">None</Radio>
                        </Flex>
                      </RadioGroup>
                    </CheckboxGroup>
                  </Tbody>
                </Table>
              </CheckboxGroup>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="green"
              onClick={() => {
                setPermClose();
                onOpen();
              }}
              leftIcon={<CheckCircle size={18} />}
            >
              Set Permissions
            </Button>
          </ModalFooter>
        </MotionModalContent>
      </Modal>
    </AnimatePresence>
  );
};

export default FacultyAdd;