import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Box,
  Text,
  Icon,
  Alert,
  AlertIcon,
  useToast,
  useBreakpointValue,
  Stack,
} from "@chakra-ui/react";
import { Upload, Check } from "lucide-react";
import { months, getYearRange } from "../../../utils/dateUtils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const toast = useToast();
  const [btnLoading, setBtnLoading] = useState(false);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Form states
  const [certificateName, setCertificateName] = useState("");
  const [issuingOrg, setIssuingOrg] = useState("");
  const [issueMonth, setIssueMonth] = useState("");
  const [issueYear, setIssueYear] = useState("");
  const [expiry, setExpiry] = useState(false);
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [certificateLevel, setCertificateLevel] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("No File Selected");

  const resetForm = () => {
    setCertificateName("");
    setIssuingOrg("");
    setIssueMonth("");
    setIssueYear("");
    setExpiry(false);
    setExpiryMonth("");
    setExpiryYear("");
    setCertificateType("");
    setCertificateLevel("");
    setCertificateUrl("");
    setFile(null);
    setFileName("No File Selected");
    setBtnLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (
      !certificateName ||
      !issuingOrg ||
      !issueMonth ||
      !issueYear ||
      !certificateType ||
      !certificateLevel
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return false;
    }

    if (expiry && (!expiryMonth || !expiryYear)) {
      toast({
        title: "Error",
        description: "Please select both expiry month and year",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return false;
    }

    if (!file && !certificateUrl) {
      toast({
        title: "Error",
        description: "Please provide either a file or URL",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return false;
    }

    if (file && certificateUrl) {
      toast({
        title: "Error",
        description: "Please provide either a file or URL, not both",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    setBtnLoading(true);

    if (!validateForm()) {
      setBtnLoading(false);
      return;
    }

    const formData = new FormData();
    const issue = {
      month: issueMonth,
      year: parseInt(issueYear),
    };
    const expiry = {
      month: expiryMonth,
      year: parseInt(expiryYear),
    };

    formData.append("name", certificateName);
    formData.append("issuingOrganization", issuingOrg);
    formData.append("issueDate", JSON.stringify(issue));
    formData.append("expires", expiry ? "true" : "false");
    if (expiry) {
      formData.append("expirationDate", JSON.stringify(expiry));
    } else {
      formData.append("expirationDate", JSON.stringify({}));
    }

    formData.append("type", certificateType);
    formData.append("level", certificateLevel);
    formData.append("uploadType", certificateUrl ? "url" : "file");

    if (certificateUrl) formData.append("url", certificateUrl);
    if (file) formData.append("certificate", file);

    try {
      await onUpload(formData);
      toast({
        title: "Success",
        description: "Certificate uploaded successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload certificate",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setFile(file);
    setCertificateUrl("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: "full", lg: "6xl" }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent mx={{ base: 0, lg: 4 }} my={{ base: 0, lg: 16 }}>
        <ModalHeader px={{ base: 4, lg: 6 }} pt={4}>
          <Stack direction="row" align="center">
            <Icon as={Upload} boxSize={6} />
            <Text fontSize={{ base: "xl", lg: "2xl" }}>Upload Certificate</Text>
          </Stack>
        </ModalHeader>
        <ModalCloseButton size="lg" />

        <ModalBody px={{ base: 4, lg: 6 }} pb={4}>
          <VStack spacing={{ base: 4, lg: 6 }}>
            <Alert status="info" variant="left-accent" borderRadius="md">
              <AlertIcon boxSize={5} />
              <Text fontSize={{ base: "sm", lg: "md" }}>
                Your certificate will be verified and approved by the house
                coordinator.
              </Text>
            </Alert>

            <Stack
              w="full"
              direction={{ base: "column", lg: "row" }}
              spacing={{ base: 4, lg: 6 }}
            >
              <FormControl isRequired flex={1}>
                <FormLabel fontSize={{ base: "sm", lg: "md" }}>
                  Certificate Name
                </FormLabel>
                <Input
                  placeholder="Enter certificate name"
                  value={certificateName}
                  onChange={(e) => setCertificateName(e.target.value)}
                  size={{ base: "md", lg: "lg" }}
                />
              </FormControl>

              <FormControl isRequired flex={1}>
                <FormLabel fontSize={{ base: "sm", lg: "md" }}>
                  Issuing Organization
                </FormLabel>
                <Input
                  placeholder="Enter organization name"
                  value={issuingOrg}
                  onChange={(e) => setIssuingOrg(e.target.value)}
                  size={{ base: "md", lg: "lg" }}
                />
              </FormControl>
            </Stack>

            <FormControl isRequired w="full">
              <FormLabel fontSize={{ base: "sm", lg: "md" }}>
                Issue Date
              </FormLabel>
              <Stack
                direction={{ base: "column", lg: "row" }}
                spacing={{ base: 2, lg: 4 }}
                w="full"
              >
                <Select
                  value={issueMonth}
                  onChange={(e) => setIssueMonth(e.target.value)}
                  placeholder="Select Month"
                  size={{ base: "md", lg: "lg" }}
                >
                  {months.map((month) => (
                    <option
                      key={month.toLowerCase().slice(0, 3)}
                      value={month.toLowerCase().slice(0, 3)}
                    >
                      {month}
                    </option>
                  ))}
                </Select>

                <Select
                  value={issueYear}
                  onChange={(e) => setIssueYear(e.target.value)}
                  placeholder="Select Year"
                  size={{ base: "md", lg: "lg" }}
                >
                  {getYearRange(-3, 0).map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </Select>
              </Stack>
            </FormControl>

            <FormControl w="full">
              <Stack
                direction={{ base: "column", lg: "row" }}
                align={{ base: "start", lg: "center" }}
                spacing={{ base: 2, lg: 4 }}
              >
                <Checkbox
                  isChecked={expiry}
                  onChange={(e) => {
                    setExpiry(e.target.checked);
                    if (!e.target.checked) {
                      setExpiryMonth("");
                      setExpiryYear("");
                    }
                  }}
                  colorScheme="green"
                  fontSize={{ base: "sm", lg: "md" }}
                >
                  Certificate Expires?
                </Checkbox>

                {expiry && (
                  <Stack
                    direction={{ base: "column", lg: "row" }}
                    spacing={{ base: 2, lg: 4 }}
                    w={{ base: "full", lg: "auto" }}
                  >
                    <Select
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      placeholder="Expiry Month"
                      size={{ base: "md", lg: "lg" }}
                    >
                      {months.map((month) => (
                        <option
                          key={month.toLowerCase().slice(0, 3)}
                          value={month.toLowerCase().slice(0, 3)}
                        >
                          {month}
                        </option>
                      ))}
                    </Select>

                    <Select
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                      placeholder="Expiry Year"
                      size={{ base: "md", lg: "lg" }}
                    >
                      {getYearRange(0, 10).map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </Select>
                  </Stack>
                )}
              </Stack>
            </FormControl>

            <Stack
              w="full"
              direction={{ base: "column", lg: "row" }}
              spacing={{ base: 4, lg: 6 }}
            >
              <FormControl isRequired flex={1}>
                <FormLabel fontSize={{ base: "sm", lg: "md" }}>
                  Certificate Type
                </FormLabel>
                <Select
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                  placeholder="Select Type"
                  size={{ base: "md", lg: "lg" }}
                >
                  <option value="internal">Internal Certification</option>
                  <option value="external">External Certification</option>
                </Select>
              </FormControl>

              <FormControl isRequired flex={1}>
                <FormLabel fontSize={{ base: "sm", lg: "md" }}>
                  Certificate Level
                </FormLabel>
                <Select
                  value={certificateLevel}
                  onChange={(e) => setCertificateLevel(e.target.value)}
                  placeholder="Select Level"
                  size={{ base: "md", lg: "lg" }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </FormControl>
            </Stack>

            <VStack width="full" spacing={{ base: 4, lg: 6 }}>
              <FormControl w="full">
                <FormLabel fontSize={{ base: "sm", lg: "md" }}>
                  Certificate URL
                </FormLabel>
                <Input
                  placeholder="Enter certificate URL"
                  value={certificateUrl}
                  onChange={(e) => {
                    setCertificateUrl(e.target.value);
                    setFile(null);
                    setFileName("No File Selected");
                  }}
                  size={{ base: "md", lg: "lg" }}
                />
              </FormControl>

              <Text fontSize={{ base: "sm", lg: "md" }} fontWeight="medium">
                OR
              </Text>

              <FormControl w="full">
                <FormLabel fontSize={{ base: "sm", lg: "md" }}>
                  Upload Certificate
                </FormLabel>
                <Box
                  border="2px dashed"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={{ base: 4, lg: 6 }}
                  textAlign="center"
                  _hover={{ borderColor: "blue.500" }}
                  transition="all 0.2s"
                >
                  <Input
                    type="file"
                    id="certificate-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                    display="none"
                  />
                  <label
                    htmlFor="certificate-upload"
                    style={{ cursor: "pointer" }}
                  >
                    <VStack spacing={2}>
                      <Icon as={Upload} boxSize={6} color="gray.400" />
                      <Text
                        fontWeight="medium"
                        fontSize={{ base: "sm", lg: "md" }}
                      >
                        {fileName === "No File Selected" ? (
                          <>
                            Drop your file here or{" "}
                            <span className="text-blue-500">browse</span>
                          </>
                        ) : (
                          fileName
                        )}
                      </Text>
                      <Text fontSize={{ base: "xs", lg: "sm" }} color="gray.500">
                        Supports: PDF, JPG, PNG, WEBP
                      </Text>
                    </VStack>
                  </label>
                </Box>
              </FormControl>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter
          px={{ base: 4, lg: 6 }}
          pb={{ base: 4, lg: 6 }}
          pt={{ base: 2, lg: 4 }}
        >
          <Stack
            w="full"
            direction={{ base: "column-reverse", lg: "row" }}
            spacing={{ base: 2, lg: 4 }}
            justifyContent="flex-end"
          >
            <Button
              variant="ghost"
              onClick={handleClose}
              w={{ base: "full", lg: "auto" }}
              size={{ base: "md", lg: "lg" }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleUpload}
              isLoading={btnLoading}
              leftIcon={<Check />}
              w={{ base: "full", lg: "auto" }}
              size={{ base: "md", lg: "lg" }}
            >
              Submit for Approval
            </Button>
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadModal;