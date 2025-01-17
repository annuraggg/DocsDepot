import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Textarea,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Modal,
  ModalOverlay,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Alert,
  Flex,
  Link,
  Code,
} from "@chakra-ui/react";
import Loader from "../../components/Loader";
import { ExtendedCertificate as ICertificate } from "@/types/ExtendedCertificate";
import { Copy } from "lucide-react";
import useUser from "@/config/user";
import useAxios from "@/config/axios";

const Certificate = () => {
  const [certificate, setCertificate] = useState<ICertificate>(
    {} as ICertificate
  );
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [certificateName, setCertificateName] = useState("");
  const [issuingOrg, setIssuingOrg] = useState("");
  const [issueDate, setissueDate] = useState("");
  const [issueYear, setIssueYear] = useState(0);
  const [type, settype] = useState("external");
  const [level, setlevel] = useState("beginner");

  const user = useUser();

  const [editPrivilege, setEditPrivilege] = useState(false);

  const [loader1, setLoader1] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [loader3, setLoader3] = useState(false);

  const [colorStatus, setColorStatus] = useState("blue");

  const [steps, setSteps] = useState([
    { title: "Step I: Upload", description: "Uploaded" },
    { title: "Step II: Review", description: "Pending" },
    { title: "Step III: Approval By Faculty", description: "Pending" },
  ]);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const {
    isOpen: isHashOpen,
    onOpen: onHashOpen,
    onClose: onHashClose,
  } = useDisclosure();

  const year = new Date().getFullYear();
  const prevYear = year - 1;
  const prevPrevYear = year - 2;
  const prevPrevPrevYear = year - 3;

  const axios = useAxios();

  useEffect(() => {
    const id = window.location.pathname.split("/")[2];

    axios
      .get(`/certificates/${id}`)
      .then((res) => {
        setCertificate(res.data.data);
        setLoading(false);
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
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (certificate?.user?._id === user?._id) {
      setEditPrivilege(true);
    }
  }, [certificate]);

  const toast = useToast();

  useEffect(() => {
    setCertificateName(certificate?.name);
    setIssuingOrg(certificate?.issuingOrganization);
    setissueDate(certificate?.issueDate.month);
    setIssueYear(certificate?.issueDate.year);
    settype(certificate?.type);
    setlevel(certificate?.level);
  }, [certificate]);

  const handleDownload = () => {
    setLoader3(true);
    if (certificate?.uploadType === "url") {
      setLoader3(false);
      if (!certificate?.url) return;
      window.open(certificate?.url, "_blank");
      return;
    }

    axios
      .get(`/certificates/download/${certificate._id}`)
      .then((res) => {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setLoader3(false);
      })
      .catch((err) => {
        setLoader3(false);
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

  const { activeStep, setActiveStep } = useSteps({
    index: 1,
    count: steps.length,
  });

  useEffect(() => {
    const updatedSteps = [...steps];

    if (certificate.status === "rejected") {
      updatedSteps[2].description = "Rejected";
      updatedSteps[1].description = "Reviewed";
      setActiveStep(2);
      setColorStatus("red");
    }

    if (certificate.status === "approved") {
      updatedSteps[2].description = "Approved";
      updatedSteps[1].description = "Reviewed";
      setActiveStep(3);
      setColorStatus("green");
    }

    if (certificate.status === "pending") {
      updatedSteps[2].description = "Pending";
      setActiveStep(0);
      setColorStatus("blue");
    }

    setSteps(updatedSteps);
  }, [certificate]);

  const handleUpdate = () => {
    setLoader2(true);

    const formData = new FormData();
    formData.append("title", certificateName);
    formData.append("issuingOrg", issuingOrg);
    formData.append("issueDate.month", issueDate);
    formData.append("issueYear", issueYear.toString());
    formData.append("type", type);
    formData.append("level", level);

    axios
      .put(`certificates/${certificate._id}`, formData)
      .then(() => {
        setLoader2(false);
        onEditClose();
        window.location.reload();
      })
      .catch((err) => {
        setLoader2(false);
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

  const handleDelete = () => {
    setLoader1(true);

    axios.delete(`certificates/${certificate._id}`).then(() => {
      setLoader1(false);
      toast({
        title: "Success",
        description: "Certificate Deleted Successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    });
  };

  const copyText = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to Clipboard",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  const calculateExpiry = () => {
    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    if (certificate?.expires) {
      if (
        certificate?.expirationDate.year &&
        certificate.expirationDate.year < currentYear
      )
        return false;
      if (
        certificate?.expirationDate.year &&
        certificate?.expirationDate.year > currentYear
      )
        return true;

      if (
        monthNames.indexOf(certificate?.expirationDate.month || "") <
        currentMonth
      )
        return false;
      if (
        monthNames.indexOf(certificate?.expirationDate.month || "") >
        currentMonth
      )
        return true;
      if (
        monthNames.indexOf(certificate?.expirationDate.month || "") ===
        currentMonth
      )
        return true;
    }

    return true;
  };

  if (!loading) {
    if (user?.role === "F") {
      return (
        <>
          <Box className="StudentCertificate">
            <Box
              className="info"
              display="flex"
              flexDir="column"
              gap="15px"
              alignItems="center"
              justifyContent="center"
              height="50vh"
            >
              <Text textAlign="center">
                {certificate?.type?.charAt(0).toUpperCase() +
                  certificate?.type?.slice(1)}{" "}
                Certification -{" "}
                {certificate?.level?.charAt(0).toUpperCase() +
                  certificate?.level?.slice(1)}{" "}
                Level
              </Text>
              <Text textAlign="center" mt="-17px">
                Uploaded By {certificate?.user?.mid}
              </Text>
              {certificate?.expires ? (
                !calculateExpiry() ? (
                  <Text color="red" textAlign="center" mt="-17px">
                    Certificate Expired On{" "}
                    {certificate?.expirationDate.month
                      ? certificate.expirationDate.month
                          .slice(0, 1)
                          .toUpperCase() +
                        certificate.expirationDate.month.slice(1)
                      : ""}{" "}
                    {certificate?.expirationDate.year}
                  </Text>
                ) : (
                  <Text color="green" textAlign="center" mt="-17px">
                    Certificate Expires On{" "}
                    {certificate?.expirationDate.month
                      ? certificate.expirationDate.month
                          .slice(0, 1)
                          .toUpperCase() +
                        certificate.expirationDate.month.slice(1)
                      : ""}{" "}
                    {certificate?.expirationDate.year}
                  </Text>
                )
              ) : null}
              <Heading textAlign="center">
                {certificate?.name?.charAt(0).toUpperCase() +
                  certificate?.name?.slice(1)}{" "}
              </Heading>
              <Text textAlign="center">
                By{" "}
                {certificate?.issuingOrganization
                  ?.charAt(0)
                  .toUpperCase() +
                  certificate?.issuingOrganization?.slice(1)}
              </Text>

              {certificate.uploadType !== "print" ? (
                <Button
                  colorScheme="green"
                  onClick={() => window.print()}
                  isLoading={loader3}
                  width="fit-content"
                  alignSelf="center"
                >
                  Print
                </Button>
              ) : null}
              {certificate.uploadType === "file" ? (
                <Link textAlign="center" color="blue.600" onClick={onHashOpen}>
                  Verify Hashes
                </Link>
              ) : null}
              <Text textAlign="center">
                Issued On{" "}
                {certificate?.issueDate?.month?.charAt(0).toUpperCase() +
                  certificate?.issueDate?.month?.slice(1)}{" "}
                {certificate?.issueDate?.month}
              </Text>
            </Box>

            <Box className="comments" mb="20px" mt="20px">
              {certificate.comments?.map((comment, index) => (
                <Textarea
                  readOnly
                  key={index}
                  resize="none"
                  value={comment.comment}
                />
              ))}
            </Box>

            <Box className="buttons">
              {certificate?.status !== "approved" && editPrivilege ? (
                <Button colorScheme="blue" onClick={onEditOpen}>
                  Edit Certificate
                </Button>
              ) : editPrivilege ? null : null}{" "}
              {editPrivilege ? (
                <Button colorScheme="red" onClick={onOpen}>
                  Delete Certificate
                </Button>
              ) : null}
            </Box>

            <AlertDialog
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Certificate?
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure? You will lose all the XP associated with this
                    certificate.
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={handleDelete}
                      ml={3}
                      isLoading={loader1}
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>

            <Modal isOpen={isEditOpen} onClose={onEditClose} size="3xl">
              <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
              <ModalContent>
                <ModalHeader>Edit Certificate</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Box className="upload-main-StudentCertificates">
                    <Alert status="info" marginBottom="20px">
                      Your Certificate will be verified and approved by the
                      house coordinator.
                    </Alert>

                    <FormControl>
                      <FormLabel>Certificate Name</FormLabel>
                      <Input
                        type="text"
                        placeholder=""
                        onChange={(e) => {
                          setCertificateName(e?.target?.value);
                        }}
                        value={certificateName}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Issuing Organization</FormLabel>
                      <Input
                        type="text"
                        placeholder=""
                        onChange={(e) => {
                          setIssuingOrg(e?.target?.value);
                        }}
                        value={issuingOrg}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Certification Date</FormLabel>
                      <Box className="flex">
                        <Select
                          placeholder="Select Month"
                          onChange={(e) => setissueDate(e?.target?.value)}
                          value={issueDate}
                        >
                          <option value="jan">January</option>
                          <option value="feb">February</option>
                          <option value="mar">March</option>
                          <option value="apr">April</option>
                          <option value="may">May</option>
                          <option value="jun">June</option>
                          <option value="jul">July</option>
                          <option value="aug">August</option>
                          <option value="sep">September</option>
                          <option value="oct">October</option>
                          <option value="nov">November</option>
                          <option value="dec">December</option>
                        </Select>

                        <Select
                          placeholder="Select Year"
                          onChange={(e) =>
                            setIssueYear(parseInt(e?.target?.value))
                          }
                          value={issueYear}
                        >
                          <option value={prevPrevPrevYear}>
                            {prevPrevPrevYear}
                          </option>
                          <option value={prevPrevYear}>{prevPrevYear}</option>
                          <option value={prevYear}>{prevYear}</option>
                          <option value={year}>{year}</option>
                        </Select>
                      </Box>
                    </FormControl>

                    <Box className="flex">
                      <Select
                        placeholder="Select Type"
                        onChange={(e) => settype(e?.target?.value)}
                        value={type}
                      >
                        <option value="internal">Internal Certification</option>
                        <option value="external">External Certification</option>
                      </Select>

                      <Select
                        placeholder="Select Level"
                        onChange={(e) => setlevel(e?.target?.value)}
                        value={level}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </Select>
                    </Box>
                  </Box>
                </ModalBody>

                <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={onEditClose}>
                    Close
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleUpdate}
                    isLoading={loader2}
                  >
                    Submit for Re-Approval
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>

          <Modal isOpen={isHashOpen} onClose={onHashClose} size="2xl">
            <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
            <ModalContent>
              <ModalHeader>Verify Hashes</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>hashes?.sha256 Hash:</Text>
                <Code>{certificate?.hashes?.sha256}</Code>
                <Copy
                  cursor="pointer"
                  onClick={() => copyText(certificate?.hashes?.sha256)}
                />
                <Text>hashes?.md5 Hash: </Text>
                <Code>{certificate?.hashes?.md5}</Code>
                <Copy
                  cursor="pointer"
                  onClick={() => copyText(certificate?.hashes?.md5)}
                />

                <Text mt="20px">
                  <b>1.</b> Go to the directory containing the file
                </Text>
                <Text>
                  <b>2.</b> Open a Terminal in that Directory
                </Text>
                <Text>
                  <b>3.</b> Type the following command
                </Text>

                <Box ml="20px">
                  {" "}
                  <Text mt="10px">On Windows</Text>
                  <Code>
                    certUtil -hashfile '
                    {certificate?.name +
                      "." +
                      certificate?.extension +
                      "' hashes?.md5"}
                  </Code>
                  <Copy
                    cursor="pointer"
                    onClick={() =>
                      copyText(
                        `certUtil -hashfile '${
                          certificate?.name +
                          "." +
                          certificate?.extension +
                          "' hashes?.md5"
                        }`
                      )
                    }
                  />
                  <Text mt="10px">On Linux</Text>
                  <Code>
                    hashes?.sha256sum '
                    {certificate?.name + "." + certificate?.extension}'
                  </Code>
                  <Copy
                    cursor="pointer"
                    onClick={() =>
                      copyText(
                        `hashes?.sha256sum '${
                          certificate?.name + "." + certificate?.extension
                        }'`
                      )
                    }
                  />
                </Box>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onHashClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      );
    } else {
      return (
        <>
          <Box className="StudentCertificate">
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignContent="center"
              height="80vh"
            >
              <Box className="info" display="flex" flexDir="column" gap="15px">
                <Text textAlign="center">
                  {certificate?.type?.charAt(0).toUpperCase() +
                    certificate?.type?.slice(1)}{" "}
                  Certification -{" "}
                  {certificate?.level?.charAt(0).toUpperCase() +
                    certificate?.level?.slice(1)}{" "}
                  Level
                </Text>
                <Text textAlign="center" mt="-17px">
                  Uploaded By {certificate.user?.mid}
                </Text>
                {certificate?.expires ? (
                  !calculateExpiry() ? (
                    <Text color="red" textAlign="center" mt="-17px">
                      Certificate Expired On{" "}
                      {certificate?.expirationDate.month
                        ? certificate.expirationDate.month
                            .slice(0, 1)
                            .toUpperCase() +
                          certificate.expirationDate.month.slice(1)
                        : ""}{" "}
                      {certificate?.expirationDate.year}
                    </Text>
                  ) : (
                    <Text color="green" textAlign="center" mt="-17px">
                      Certificate Expires On{" "}
                      {certificate?.expirationDate.month
                        ? certificate.expirationDate.month
                            .slice(0, 1)
                            .toUpperCase() +
                          certificate.expirationDate.month.slice(1)
                        : ""}{" "}
                      {certificate?.expirationDate.year}
                    </Text>
                  )
                ) : null}
                <Heading textAlign="center">
                  {certificate?.name?.charAt(0).toUpperCase() +
                    certificate?.name?.slice(1)}{" "}
                </Heading>
                <Text textAlign="center">
                  By{" "}
                  {certificate?.issuingOrganization?.charAt(0).toUpperCase() +
                    certificate?.issuingOrganization?.slice(1)}
                </Text>
                {certificate.uploadType !== "print" ? (
                  <Button
                    colorScheme="green"
                    onClick={handleDownload}
                    isLoading={loader3}
                    width="fit-content"
                    alignSelf="center"
                  >
                    Download / View Certificate
                  </Button>
                ) : (
                  <Button
                    colorScheme="green"
                    onClick={() => window.print()}
                    isLoading={loader3}
                    width="fit-content"
                    alignSelf="center"
                  >
                    Print Certificate
                  </Button>
                )}
                {certificate.uploadType === "file" ? (
                  <Link
                    textAlign="center"
                    color="blue.600"
                    onClick={onHashOpen}
                  >
                    Verify Hashes
                  </Link>
                ) : null}

                <Text textAlign="center">
                  Issued On{" "}
                  {certificate?.issueDate.month?.charAt(0).toUpperCase() +
                    certificate?.issueDate.month?.slice(1)}{" "}
                  {certificate?.issueDate.year}
                </Text>
              </Box>

              <Box className="track-wrapper">
                <Flex align="center" justify="center" mt="20px">
                  <Stepper
                    index={activeStep}
                    width="50vw"
                    alignSelf="center"
                    colorScheme={colorStatus}
                    mb="20px"
                  >
                    {steps?.map((step, index) => (
                      <Step key={index}>
                        <StepIndicator>
                          <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                          />
                        </StepIndicator>

                        <Box flexShrink="0">
                          <StepTitle>{step?.title}</StepTitle>
                          <StepDescription>{step?.description}</StepDescription>
                        </Box>

                        <StepSeparator />
                      </Step>
                    ))}
                  </Stepper>
                </Flex>
              </Box>

              <Box className="comments" mb="20px">
                {certificate.comments?.map((comment, index) => (
                  <Textarea
                    readOnly
                    key={index}
                    resize="none"
                    value={comment.comment}
                  />
                ))}
              </Box>

              <Box className="buttons">
                {certificate?.status !== "approved" && editPrivilege ? (
                  <Button colorScheme="blue" onClick={onEditOpen}>
                    Edit Certificate
                  </Button>
                ) : editPrivilege ? (
                  <>
                    <Text color="green" fontWeight="500">
                      Your House Earned{" "}
                      {/* {certificate?.xp ? certificate?.xp + " XP" : "0 XP"} from */}
                      this Certificate
                    </Text>
                  </>
                ) : (
                  <>
                    <Text color="green" fontWeight="500">
                      {certificate.user?.mid} Earned{" "}
                      {/* {certificate?.xp ? certificate?.xp + " XP" : "0 XP"} from */}
                      this Certificate
                    </Text>
                  </>
                )}{" "}
                {editPrivilege && certificate?.status !== "approved" ? (
                  <Button colorScheme="red" onClick={onOpen}>
                    Delete Certificate
                  </Button>
                ) : null}
              </Box>
            </Box>

            <AlertDialog
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Certificate?
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure? You will lose all the XP associated with this
                    certificate.
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={handleDelete}
                      ml={3}
                      isLoading={loader1}
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>

            <Modal isOpen={isEditOpen} onClose={onEditClose} size="3xl">
              <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
              <ModalContent>
                <ModalHeader>Edit Certificate</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Box className="upload-main-StudentCertificates">
                    <Alert status="info" marginBottom="20px">
                      Your Certificate will be verified and approved by the
                      house coordinator.
                    </Alert>

                    <FormControl>
                      <FormLabel>Certificate Name</FormLabel>
                      <Input
                        type="text"
                        placeholder=""
                        onChange={(e) => {
                          setCertificateName(e?.target?.value);
                        }}
                        value={certificateName}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Issuing Organization</FormLabel>
                      <Input
                        type="text"
                        placeholder=""
                        onChange={(e) => {
                          setIssuingOrg(e?.target?.value);
                        }}
                        value={issuingOrg}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Certification Date</FormLabel>
                      <Box className="flex">
                        <Select
                          placeholder="Select Month"
                          onChange={(e) => setissueDate(e?.target?.value)}
                          value={issueDate}
                        >
                          <option value="jan">January</option>
                          <option value="feb">February</option>
                          <option value="mar">March</option>
                          <option value="apr">April</option>
                          <option value="may">May</option>
                          <option value="jun">June</option>
                          <option value="jul">July</option>
                          <option value="aug">August</option>
                          <option value="sep">September</option>
                          <option value="oct">October</option>
                          <option value="nov">November</option>
                          <option value="dec">December</option>
                        </Select>

                        <Select
                          placeholder="Select Year"
                          onChange={(e) =>
                            setIssueYear(parseInt(e?.target?.value))
                          }
                          value={issueYear}
                        >
                          <option value={prevPrevPrevYear}>
                            {prevPrevPrevYear}
                          </option>
                          <option value={prevPrevYear}>{prevPrevYear}</option>
                          <option value={prevYear}>{prevYear}</option>
                          <option value={year}>{year}</option>
                        </Select>
                      </Box>
                    </FormControl>

                    <Box className="flex">
                      <Select
                        placeholder="Select Type"
                        onChange={(e) => settype(e?.target?.value)}
                        value={type}
                      >
                        <option value="internal">Internal Certification</option>
                        <option value="external">External Certification</option>
                      </Select>

                      <Select
                        placeholder="Select Level"
                        onChange={(e) => setlevel(e?.target?.value)}
                        value={level}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </Select>
                    </Box>
                  </Box>
                </ModalBody>

                <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={onEditClose}>
                    Close
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleUpdate}
                    isLoading={loader2}
                  >
                    Submit for Re-Approval
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>

          <Modal isOpen={isHashOpen} onClose={onHashClose} size="2xl">
            <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
            <ModalContent>
              <ModalHeader>Verify Hashes</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>hashes?.sha256 Hash:</Text>
                <Code>{certificate?.hashes?.sha256}</Code>
                <Copy
                  cursor="pointer"
                  onClick={() => copyText(certificate?.hashes?.sha256)}
                />
                <Text>hashes?.md5 Hash: </Text>
                <Code>{certificate?.hashes?.md5}</Code>
                <Copy
                  cursor="pointer"
                  onClick={() => copyText(certificate?.hashes?.md5)}
                />

                <Text mt="20px">
                  <b>1.</b> Go to the directory containing the file
                </Text>
                <Text>
                  <b>2.</b> Open a Terminal in that Directory
                </Text>
                <Text>
                  <b>3.</b> Type the following command
                </Text>

                <Box ml="20px">
                  {" "}
                  <Text mt="10px">On Windows</Text>
                  <Code>
                    certUtil -hashfile '
                    {certificate?.name +
                      "." +
                      certificate?.extension +
                      "' hashes?.md5"}
                  </Code>
                  <Copy
                    cursor="pointer"
                    onClick={() =>
                      copyText(
                        `certUtil -hashfile '${
                          certificate?.name +
                          "." +
                          certificate?.extension +
                          "' hashes?.md5"
                        }`
                      )
                    }
                  />
                  <Text mt="10px">On Linux</Text>
                  <Code>
                    hashes?.sha256sum '
                    {certificate?.name + "." + certificate?.extension}'
                  </Code>
                  <Copy
                    cursor="pointer"
                    onClick={() =>
                      copyText(
                        `hashes?.sha256sum '${
                          certificate?.name + "." + certificate?.extension
                        }'`
                      )
                    }
                  />
                </Box>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onHashClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      );
    }
  } else {
    return <Loader />;
  }
};

export default Certificate;
