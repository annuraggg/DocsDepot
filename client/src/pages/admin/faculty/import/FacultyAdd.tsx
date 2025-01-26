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
import {
  User,
  Mail,
  Hash,
  Shield,
  FileWarningIcon,
  CheckCircleIcon,
} from "lucide-react";
import { House } from "@shared-types/House";
import useAxios from "@/config/axios";
import useUser from "@/config/user";

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
  const user = useUser();
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

    axios
      .post("/user/faculty", data)
      .then(() => {
    
        toast({
          title: "Faculty Added",
          description: "Faculty has been added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        if (err.response.status === 409) {
          toast({
            title: "Error",
            description: "Moodle ID or email already exists",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Error",
            description: err?.response?.data?.message || "Failed to add faculty",
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
        <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent>
          <ModalHeader>Faculty Permissions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <Table>
                <Tbody>
                  <CheckboxGroup
                    value={perms}
                    onChange={(e) => setPerms(e as string[])}
                  >
                    <Tr>
                      <Td>
                        <Checkbox value="UFC" readOnly>
                          Upload Faculty Certificates
                        </Checkbox>
                      </Td>
                      <Td>
                        <List>
                          <ListItem mb={2}>
                            <ListIcon as={FileWarningIcon} color="yellow.500" />
                            Default permission - Cannot be changed
                          </ListItem>
                          <ListItem mb={2}>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
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
                        <List>
                          <ListItem mb={2}>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Create Events
                          </ListItem>
                          <ListItem mb={2}>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Update Events
                          </ListItem>
                          <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Manage / Edit Events
                          </ListItem>
                        </List>
                      </Td>
                    </Tr>
                  </CheckboxGroup>

                  <Tr>
                    <Td>
                      <RadioGroup
                        value={
                          houses.find(
                            (house) => house.facultyCordinator === user?._id
                          )?.id
                        }
                        onChange={(value) => {
                          const updatedPerms = [
                            ...perms.filter((perm) => !perm.startsWith("H")),
                            value,
                          ].filter(Boolean);
                          setPerms(updatedPerms);
                        }}
                      >
                        <Flex direction="column" gap={3}>
                          {houses.map((house, index) => (
                            <Radio key={index} value={`H${index + 1}`}>
                              House Coordinator - {house.name}
                            </Radio>
                          ))}
                          <Radio value="">None</Radio>
                        </Flex>
                      </RadioGroup>
                    </Td>
                    <Td>
                      <List>
                        <ListItem>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Manage House Profile
                        </ListItem>
                        <ListItem>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Manage House Members
                        </ListItem>
                      </List>
                    </Td>
                  </Tr>

                  <CheckboxGroup
                    value={perms.filter((perm) => !perm.startsWith("H"))}
                    onChange={(values) => {
                      const nonHValues = values.filter(
                        (value) => !(value as string).startsWith("H")
                      );
                      setPerms([...nonHValues].map(String));
                    }}
                  >
                    <Tr>
                      <Td>
                        <Checkbox value="SND">Send Notifications</Checkbox>
                      </Td>
                      <Td>
                        <List>
                          <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Send Global Notifications to Users
                          </ListItem>
                        </List>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Checkbox value="RSP">Reset Student Password</Checkbox>
                      </Td>
                      <Td>
                        <List>
                          <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Assist in resetting student passwords when necessary
                          </ListItem>
                        </List>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Checkbox value="AES">Add/Edit Student</Checkbox>
                      </Td>
                      <Td>
                        <List>
                          <ListItem mb={2}>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Add Students to the system
                          </ListItem>
                          <ListItem mb={2}>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Delete Students from the system
                          </ListItem>
                          <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            Edit Student Profiles
                          </ListItem>
                        </List>
                      </Td>
                    </Tr>
                  </CheckboxGroup>
                </Tbody>
              </Table>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="green"
              onClick={() => {
                closePerms();
              }}
            >
              Set
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AnimatePresence>
  );
};

export default FacultyAdd;
