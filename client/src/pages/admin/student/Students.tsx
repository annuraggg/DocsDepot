import { useEffect, useState } from "react";
import {
  Box,
  FormLabel,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import Loader from "../../../components/Loader";
import { User, Gender } from "@shared-types/User";
import useAxios from "@/config/axios";
import { House } from "@shared-types/House";
import { useNavigate } from "react-router";

interface ExtendedUser extends Omit<User, "house"> {
  house: House;
}

const Students = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<ExtendedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedHouse, setSelectedHouse] = useState("all");
  const [filteredStudents, setFilteredStudents] = useState<ExtendedUser[]>([]);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const navigate = useNavigate();

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [moodleid, setMoodleid] = useState("");
  const [email, setEmail] = useState("");
  const [house, setHouse] = useState("");
  const [gender, setGender] = useState<Gender>("M");
  const [update, setUpdate] = useState(false);
  const [studentId, setStudentId] = useState("");

  const toast = useToast();
  const axios = useAxios();

  useEffect(() => {
    axios
      .get("/user/students")
      .then((res) => {
        console.log(res.data.data);
        setLoading(false);
        setStudents(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Error fetching students",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  }, [update]);

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        (selectedYear === "all" ||
          student.academicDetails.academicYear?.toString() === selectedYear) &&
        (selectedHouse === "all" || student.house?._id === selectedHouse) &&
        [student.fname, student.lname, student.social.email].some((value) =>
          value.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students, selectedYear, selectedHouse]);

  const openEdit = (mid: string) => {
    const student = students.find((stu) => stu.mid === mid);
    if (student) {
      setStudentId(student._id);
      setFname(student.fname);
      setLname(student.lname);
      setMoodleid(student.mid);
      setEmail(student.social.email);
      setHouse(student.house?._id || "");
      setGender(student.gender);
      onEditOpen();
    }
  };

  const updateStudent = () => {
    onEditClose();
    axios
      .put(`/user/${studentId}`, {
        mid: moodleid,
        fname,
        lname,
        email,
        house,
        gender,
      })
      .then(() => {
        toast({
          title: "Success",
          description: "Student Updated Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setUpdate(!update);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Error updating student",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const uniqueHouses = Array.from(
    new Set(students.map((student) => student.house?._id))
  ).map((id) => students.find((student) => student.house?._id === id)?.house);

  if (loading) return <Loader />;
  return (
    <>
      <Box>
        {/* Search and Filter UI */}
        <Box>
          <Button onClick={() => navigate("/admin/students/add")}>
            Add Student
          </Button>
          <FormLabel>Search</FormLabel>
          <Input
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
          </Select>
          <Select
            value={selectedHouse}
            onChange={(e) => setSelectedHouse(e.target.value)}
          >
            <option value="all">All</option>
            {uniqueHouses.map(
              (house) =>
                house && (
                  <option value={house._id} key={house._id}>
                    {house.name}
                  </option>
                )
            )}
          </Select>
        </Box>
        {/* Table UI */}
        <Table>
          <Thead>
            <Tr>
              <Th>Moodle ID</Th>
              <Th>Name</Th>
              <Th>Year</Th>
              <Th>Email</Th>
              <Th>House</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredStudents.map((student) => (
              <Tr key={student.mid}>
                <Td>{student.mid}</Td>
                <Td>{`${student.fname} ${student.lname}`}</Td>
                <Td>{student.academicDetails.academicYear}</Td>
                <Td>{student.social.email}</Td>
                <Td>{student.house?.name || "N/A"}</Td>
                <Td>
                  <Button onClick={() => openEdit(student.mid)}>Edit</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <RadioGroup
              value={gender}
              onChange={(val) => setGender(val as Gender)}
            >
              <Stack direction="row">
                <Radio value="M">Male</Radio>
                <Radio value="F">Female</Radio>
              </Stack>
            </RadioGroup>
          </ModalBody>
          <ModalFooter>
            <Button onClick={updateStudent}>Update</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Students;
