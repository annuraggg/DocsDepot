import { useEffect, useState } from "react";
import {
  Checkbox,
  CheckboxGroup,
  Flex,
  Input,
  useToast,
} from "@chakra-ui/react";
import {
  Box,
  Button,
  Heading,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Select,
  Textarea,
} from "@chakra-ui/react";

import { useNavigate } from "react-router";
import Loader from "../../../../components/Loader";
import { Certificate, Comment } from "@shared-types/Certificate";
import useUser from "@/config/user";
import useAxios from "@/config/axios";
const Certificates = () => {
  const [pendingCertificates, setPendingCertificates] = useState<Certificate[]>(
    []
  );

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<
    Certificate[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);

  const [selectedCertificate, setSelectedCertificate] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);

  const navigate = useNavigate();
  const user = useUser();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();
  const axios = useAxios();

  useEffect(() => {
    axios
      .get("/certificates/faculty")
      .then((res) => {
        setCertificates(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [update]);

  const openCert = (cert: string) => {
    setSelectedCertificate(cert);
    onOpen();
  };

  const updateCert = () => {
    if (action === "") {
      toast({
        title: "Error",
        description: "Please select an action",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    fetch(
      `${
        import.meta.env.VITE_BACKEND_ADDRESS
      }/admin/faculty/certificates/update`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedCertificate,
          action: action,
          comments: comments,
        }),
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.error(data);
        setUpdate(!update);
        onClose();
      })
      .catch((err) => {
        console.error(err);

        toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    setFilteredCertificates(certificates);
  }, [certificates]);

  const search = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    if (keyword !== "") {
      const results = certificates.filter((certificate) => {
        return certificate.name.toLowerCase().startsWith(keyword.toLowerCase());
      });
      setFilteredCertificates(results);
    } else {
      setFilteredCertificates(certificates);
    }
  };

  const filter = (e: string[]) => {
    const keyword = e; //is an array
    if (keyword.length !== 0) {
      const results = certificates.filter((certificate) => {
        return keyword.includes(certificate.type);
      });
      setFilteredCertificates(results);
    } else {
      setFilteredCertificates(certificates);
    }
  };

  if (!loading) {
    return (
      <>
        <Box className="FacultyCertificates">
          <Heading fontSize="20px">Pending Certificates</Heading>
          <Table mt="50px" variant="striped">
            <Thead>
              <Tr>
                <Th>Faculty Name</Th>
                <Th>Certificate Name</Th>
                <Th>Certificate Type</Th>
                <Th>Issuing Organization</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pendingCertificates?.map((certificate) => {
                return (
                  <Tr key={certificate?._id}>
                    <Td>{certificate?.name}</Td>
                    <Td>{certificate?.name}</Td>
                    <Td>
                      {certificate?.type.slice(0, 1).toUpperCase() +
                        certificate?.type.slice(1)}
                    </Td>
                    <Td>{certificate?.issuingOrganization}</Td>
                    <Td>
                      <Button
                        onClick={() =>
                          navigate(`/certificates/${certificate?._id}`)
                        }
                        mr="20px"
                      >
                        View Certificate
                      </Button>
                      <Button
                        colorScheme="green"
                        onClick={() => openCert(certificate?._id)}
                      >
                        Accept / Reject
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>

        <Box className="FacultyCertificates">
          <Heading fontSize="20px">All Certificates</Heading>
          <Flex mt="20px">
            <Input
              type="text"
              placeholder="Search"
              w="300px"
              mr="20px"
              onChange={search}
            />
            <CheckboxGroup
              colorScheme="green"
              onChange={(e) => filter(e as string[])}
              defaultValue={["internal", "external"]}
            >
              <Checkbox value="internal">Internal</Checkbox>
              <Checkbox value="external" ml="20px">
                External
              </Checkbox>
            </CheckboxGroup>
          </Flex>
          <Table mt="20px" variant="striped">
            <Thead>
              <Tr>
                <Th>Faculty Name</Th>
                <Th>Certificate Name</Th>
                <Th>Certificate Type</Th>
                <Th>Issuing Organization</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCertificates?.map((certificate) => {
                return (
                  <Tr key={certificate?._id}>
                    <Td>{certificate?.name}</Td>
                    <Td>{certificate?.name}</Td>
                    <Td>
                      {certificate?.type.slice(0, 1).toUpperCase() +
                        certificate?.type.slice(1)}
                    </Td>
                    <Td>{certificate?.issuingOrganization}</Td>
                    <Td>
                      <Button
                        onClick={() =>
                          navigate(`/certificates/${certificate?._id}`)
                        }
                        mr="20px"
                      >
                        View Certificate
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
          <ModalContent>
            <ModalHeader>Update Certificate Status</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Select
                placeholder="Choose a Action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="approved">Accept Certificate</option>
                <option value="rejected">Reject Certificate</option>
              </Select>

              {comments?.map((comment) => {
                return (
                  <Textarea
                    placeholder="Comments"
                    value={comment.comment}
                    onChange={(e) =>
                      setComments([
                        ...comments,
                        {
                          comment: e.target.value,
                          user: user?._id!,
                        },
                      ])
                    }
                  />
                );
              })}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant="ghost" onClick={updateCert}>
                Update
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  } else {
    return <Loader />;
  }
};

export default Certificates;
