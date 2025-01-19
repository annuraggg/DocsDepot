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
      })
      .finally(() => setLoading(false));
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
    <Box className="min-h-screen bg-gray-50">
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Box className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Student Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and monitor student information
          </p>
        </Box>

        <Stack
          spacing={4}
          direction={{ base: "column", md: "row" }}
          className="mb-6 w-full"
        >
          <Button
            onClick={() => navigate("/admin/students/add")}
            colorScheme="blue"
            className="w-full max-w-48"
          >
            Add New Student
          </Button>

          <Box className="flex-1 w-full min-w-80">
            <FormLabel className="sr-only">Search</FormLabel>
            <Box className="relative w-full">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full min-w-72"
              />
            </Box>
          </Box>

          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
          </Select>

          <Select
            value={selectedHouse}
            onChange={(e) => setSelectedHouse(e.target.value)}
          >
            <option value="all">All Houses</option>
            {uniqueHouses.map(
              (house) =>
                house && (
                  <option key={house._id} value={house._id}>
                    {house.name}
                  </option>
                )
            )}
          </Select>
        </Stack>

        <Box className="shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
          <Table variant="simple">
            <Thead className="bg-gray-50">
              <Tr>
                <Th className="font-semibold">Moodle ID</Th>
                <Th className="font-semibold">Name</Th>
                <Th className="font-semibold">Year</Th>
                <Th className="font-semibold">Email</Th>
                <Th className="font-semibold">House</Th>
                <Th className="font-semibold text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredStudents.map((student) => (
                <Tr
                  key={student.mid}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <Td>{student.mid}</Td>
                  <Td>{`${student.fname} ${student.lname}`}</Td>
                  <Td>{student.academicDetails.admissionYear}</Td>
                  <Td>{student.social.email}</Td>
                  <Td>{student.house?.name || "N/A"}</Td>
                  <Td className="text-right">
                    <Button
                      onClick={() => openEdit(student.mid)}
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center gap-1.5"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay className="bg-gray-500 bg-opacity-75" />
        <ModalContent className="mx-4">
          <ModalHeader className="text-lg font-medium">
            Update Student
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
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
                type="email"
              />
              <RadioGroup
                value={gender}
                onChange={(val) => setGender(val as Gender)}
              >
                <Stack direction="row" spacing={4}>
                  <Radio value="M">Male</Radio>
                  <Radio value="F">Female</Radio>
                </Stack>
              </RadioGroup>
            </Stack>
          </ModalBody>
          <ModalFooter className="space-x-3">
            <Button onClick={onEditClose} variant="ghost">
              Cancel
            </Button>
            <Button
              onClick={updateStudent}
              colorScheme="blue"
              className="inline-flex items-center"
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Students;
