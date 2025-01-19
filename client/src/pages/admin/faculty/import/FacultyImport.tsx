import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Alert,
  AlertIcon,
  AlertDescription,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import Papa from "papaparse";
import FacultyAdd from "./FacultyAdd";
import { House } from "@shared-types/House";
import useAxios from "@/config/axios";

const FacultyImport = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [adding, setAdding] = useState(false);
  const [addIndividual, setAddIndividual] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);
  const toast = useToast();
  const axios = useAxios();

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setTableData(result.data as string[][]);
        },
      });
    }
  };

  const handleModal = (value: boolean | ((prevState: boolean) => boolean)) => {
    setAddIndividual(value);
  };

  useEffect(() => {
    axios
      .get("/houses")
      .then((res) => {
        setHouses(res.data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const startImport = () => {
    setAdding(true);

    axios.post("/user/faculty/bulk", { tableData }).then((res) => {
      console.error(res);
      setAdding(false);
      if (res.status === 200) {
        toast({
          title: "Faculty Imported",
          description: "Staff has been successfully imported",
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
          description: "Error in importing faculty",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    });
  };

  return (
    <>
      <Box className="FacultyImport">
        <Box className="main">
          <Box className="btn">
            <Button
              colorScheme="blue"
              onClick={() => {
                setAddIndividual(true);
              }}
            >
              Add Individual
            </Button>
            <label htmlFor="file-upload" className="custom-file-upload">
              Upload .CSV
            </label>
          </Box>
          <Alert status="warning">
            <AlertIcon className="hide" />

            <AlertDescription>
              Please Upload a .CSV file with the following columns in the same
              order as shown below. Please make sure that the first row of the
              .CSV file DOES NOT contain the column names. No Blank Rows are to
              be present in the .CSV file.
            </AlertDescription>
          </Alert>

          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />

          <Box className="table">
            <Table variant="striped">
              <Thead>
                <Tr
                  position="sticky"
                  top={0}
                  zIndex="sticky"
                  backgroundColor="#F7F6FA"
                >
                  <Th>Moodle ID</Th>
                  <Th>First Name</Th>
                  <Th>Last Name</Th>
                  <Th>Gender</Th>
                  <Th>Email</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tableData.map((row, index) => (
                  <Tr key={index}>
                    {row.map((cell, index) => (
                      <Td key={index}>{cell}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Box className="footer">
            <Button
              colorScheme="green"
              onClick={startImport}
              isLoading={adding}
            >
              Import
            </Button>
          </Box>
        </Box>
      </Box>

      {addIndividual ? (
        <FacultyAdd setModal={handleModal} h={{ houses }} />
      ) : (
        <></>
      )}
    </>
  );
};

export default FacultyImport;
