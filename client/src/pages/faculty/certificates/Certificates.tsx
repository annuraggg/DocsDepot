import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
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
import Loader from "../../../components/Loader";
import { ExtendedCertificate } from "@/types/ExtendedCertificate";

const Certificates = () => {
  const [certificates, setCertificates] = useState<ExtendedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);

  const [selectedCertificate, setSelectedCertificate] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [xp, setXp] = useState(0);
  const [comments, setComments] = useState();

  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/faculty/certificates`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCertificates(data.certs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);

        toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }, [update]);

  const openCert = (id: string) => {
    setSelectedCertificate(id);
    onOpen();
  };

  const updateCert = () => {
    if (action == undefined) {
      console.log(action)
      toast({
        title: "Error",
        description: "Please select a valid action",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      return
    }

    fetch(
      `${import.meta.env.VITE_BACKEND_ADDRESS}/faculty/certificates/update`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedCertificate,
          action: action,
          xp: Number(xp),
          comments: comments,
        }),
      }
    )
      .then((res) => {
        return res.json();
      })
      .then(() => {
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

  if (!loading) {
    return (
      <>
        <Box className="FacultyCertificates">
          <Heading fontSize="20px">Pending Certificates</Heading>
          <Table mt="50px" variant="striped">
            <Thead>
              <Tr>
                <Th>Student Name</Th>
                <Th>Certificate Name</Th>
                <Th>Certificate Type</Th>
                <Th>Issuing Organization</Th>
              </Tr>
            </Thead>
            <Tbody>
              {certificates.map((certificate) => {
                return (
                  <Tr key={certificate?._id}>
                    <Td>{certificate?.user?.fname} {certificate?.user?.lname}</Td>
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

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
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

              {action === "approved" ? (
                <Select
                  mt="20px"
                  placeholder="Allocate XP"
                  value={xp}
                  onChange={(e) => setXp(parseInt(e.target.value))}
                >
                  <option value="30">30 XP - Beginner Certificate</option>
                  <option value="50">50 XP - Intermediate Certificate</option>
                  <option value="60">60 XP - Advanced Certificate</option>
                </Select>
              ) : null}

              {/* <Textarea
                mt="20px"
                placeholder="Add Comments"
                comments={xp}
                onChange={(e) => setComments(e.target.value)}
              /> */}
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
