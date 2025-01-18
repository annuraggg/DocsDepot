import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Td,
  Tr,
  Th,
  Tbody,
  Thead,
  Button,
  useToast,
} from "@chakra-ui/react";

import { useNavigate } from "react-router";
import { Certificate } from "@shared-types/Certificate";
import Loader from "@/components/Loader";
import useAxios from "@/config/axios";

const Certificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const axios = useAxios();

  useEffect(() => {
    axios
      .get("/certificates/student")
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
  }, []);

  if (!loading) {
    return (
      <>
        <Box className="AdminCertificates">
          <Heading fontSize="20px">Certificates</Heading>
          <Box className="table">
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
        </Box>
      </>
    );
  } else {
    return <Loader />;
  }
};

export default Certificates;
