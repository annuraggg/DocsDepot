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
  HStack,
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

    // Add basic certificate information
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
    // Handle expiration data
    formData.append("expires", expiry ? "true" : "false");
    if (expiry) {
      formData.append("expirationDate", JSON.stringify(expiry));
    } else {
      formData.append("expirationDate", JSON.stringify({}));
    }

    // Add other certificate details
    formData.append("type", certificateType);
    formData.append("level", certificateLevel);
    formData.append("uploadType", certificateUrl ? "url" : "file");

    // Add optional fields
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
      size="6xl"
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={Upload} />
            <Text>Upload Certificate</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6}>
            <Alert status="info" variant="left-accent" borderRadius="md">
              <AlertIcon />
              <Text>
                Your certificate will be verified and approved by the house
                coordinator.
              </Text>
            </Alert>

            <HStack width="full" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Certificate Name</FormLabel>
                <Input
                  placeholder="Enter certificate name"
                  value={certificateName}
                  onChange={(e) => setCertificateName(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Issuing Organization</FormLabel>
                <Input
                  placeholder="Enter organization name"
                  value={issuingOrg}
                  onChange={(e) => setIssuingOrg(e.target.value)}
                  size="lg"
                />
              </FormControl>
            </HStack>

            <HStack width="full" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Issue Date</FormLabel>
                <HStack spacing={4}>
                  <Select
                    value={issueMonth}
                    onChange={(e) => setIssueMonth(e.target.value)}
                    placeholder="Select Month"
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
                  >
                    {getYearRange(-3, 0).map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormControl>
            </HStack>

            <FormControl>
              <HStack spacing={4} align="flex-start">
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
                >
                  Certificate Expires?
                </Checkbox>

                {expiry && (
                  <HStack spacing={4} flex={1}>
                    <Select
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      placeholder="Expiry Month"
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
                    >
                      {getYearRange(0, 10).map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                )}
              </HStack>
            </FormControl>

            <HStack width="full" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Certificate Type</FormLabel>
                <Select
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                  placeholder="Select Type"
                >
                  <option value="internal">Internal Certification</option>
                  <option value="external">External Certification</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Certificate Level</FormLabel>
                <Select
                  value={certificateLevel}
                  onChange={(e) => setCertificateLevel(e.target.value)}
                  placeholder="Select Level"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </FormControl>
            </HStack>

            <VStack width="full" spacing={4}>
              <FormControl>
                <FormLabel>Certificate URL</FormLabel>
                <Input
                  placeholder="Enter certificate URL"
                  value={certificateUrl}
                  onChange={(e) => {
                    setCertificateUrl(e.target.value);
                    setFile(null);
                    setFileName("No File Selected");
                  }}
                />
              </FormControl>

              <Text fontWeight="medium" alignSelf="center">
                OR
              </Text>

              <FormControl>
                <FormLabel>Upload Certificate</FormLabel>
                <Box
                  border="2px dashed"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={6}
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
                      <Icon as={Upload} boxSize={8} color="gray.400" />
                      <Text fontWeight="medium">
                        {fileName === "No File Selected" ? (
                          <>
                            Drop your file here or{" "}
                            <span className="text-blue-500">browse</span>
                          </>
                        ) : (
                          fileName
                        )}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Supports: PDF, JPG, PNG, WEBP
                      </Text>
                    </VStack>
                  </label>
                </Box>
              </FormControl>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleUpload}
            isLoading={btnLoading}
            leftIcon={<Check />}
          >
            Submit for Approval
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadModal;
