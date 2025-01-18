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
  Box,
  Radio,
  RadioGroup,
  Stack,
  Input,
  useToast,
  Select,
} from "@chakra-ui/react";
import { House } from "@shared-types/House";
import useAxios from "@/config/axios";

interface StudentAddProps {
  setModal: (value: boolean) => void;
  houses: House[];
}

const StudentAdd = ({ setModal }: StudentAddProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [gender, setGender] = React.useState("Male");

  const [fname, setFname] = React.useState("");
  const [lname, setLname] = React.useState("");
  const [moodleid, setMoodleid] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [house, setHouse] = React.useState("");
  const [houses, setHouses] = React.useState<House[]>([]);

  const toast = useToast();
  const axios = useAxios();

  useEffect(() => {
    onOpen();
    axios
      .get("/houses")
      .then((res) => {
        console.log(res.data.data);
        setHouses(res.data.data);
      })
      .catch((err) => {
        console.error(err);
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
      role: "S"
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
      .then((res) => {
        if (res.status === 200) {
          setClose();
          toast({
            title: "Student Added",
            description: "Student has been added successfully",
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
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={setClose}>
        <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
        <ModalContent>
          <ModalHeader>Add Student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box className="StudentModal">
              <Box className="flex">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={fname}
                  onChange={(e) => {
                    setFname(e.target.value);
                  }}
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                />
              </Box>
              <Input
                type="text"
                placeholder="Moodle ID"
                value={moodleid}
                onChange={(e) => setMoodleid(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Select
                placeholder="Select a House"
                onChange={(e) => setHouse(e.target.value)}
                value={house}
              >
                {houses.map((house) => (
                  <option value={house._id} key={house._id}>
                    {house.name}
                  </option>
                ))}
              </Select>

              <RadioGroup onChange={setGender} value={gender}>
                <Stack direction="row">
                  <Radio value="M">Male</Radio>
                  <Radio value="F">Female</Radio>
                  <Radio value="O">Others</Radio>
                </Stack>
              </RadioGroup>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={setClose}>
              Close
            </Button>
            <Button colorScheme="green" onClick={addStudent}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StudentAdd;
