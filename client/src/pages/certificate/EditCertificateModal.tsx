import React, { useState, useEffect } from "react";
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
  useToast,
} from "@chakra-ui/react";
import { Edit, Upload } from "lucide-react";
import { months, getYearRange } from "../../utils/dateUtils";
import useAxios from "@/config/axios";
import { ExtendedCertificate } from "@/types/ExtendedCertificate";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: ExtendedCertificate;
  onUpdate: (updatedCertificate: ExtendedCertificate) => void;
}

export const EditCertificateModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  certificate,
  onUpdate,
}) => {
  const axios = useAxios();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form states with initial values from existing certificate
  const [certificateName, setCertificateName] = useState(certificate.name);
  const [issuingOrg, setIssuingOrg] = useState(certificate.issuingOrganization);
  const [issueMonth, setIssueMonth] = useState(
    certificate.issueDate?.month || ""
  );
  const [issueYear, setIssueYear] = useState(
    certificate.issueDate?.year.toString() || ""
  );
  const [expiry, setExpiry] = useState(certificate.expires);
  const [expiryMonth, setExpiryMonth] = useState(
    certificate.expirationDate?.month || ""
  );
  const [expiryYear, setExpiryYear] = useState(
    certificate.expirationDate?.year?.toString() || ""
  );
  const [certificateType, setCertificateType] = useState(certificate.type);
  const [certificateLevel, setCertificateLevel] = useState(certificate.level);
  const [certificateUrl, setCertificateUrl] = useState(certificate.url || "");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(
    certificate.url ? "Existing File" : "No File Selected"
  );

  // Reset form and errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormErrors({});
      setCertificateName(certificate.name);
      setIssuingOrg(certificate.issuingOrganization);
      setIssueMonth(certificate.issueDate?.month || "");
      setIssueYear(certificate.issueDate?.year.toString() || "");
      setExpiry(certificate.expires);
      setExpiryMonth(certificate.expirationDate?.month || "");
      setExpiryYear(certificate.expirationDate?.year?.toString() || "");
      setCertificateType(certificate.type);
      setCertificateLevel(certificate.level);
      setCertificateUrl(certificate.url || "");
      setFileName(certificate.url ? "Existing File" : "No File Selected");
      setFile(null);
    }
  }, [isOpen, certificate]);

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

  const handleUpdate = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setIsUpdating(true);

    const formData = new FormData();

    try {
      const issue = {
        month: issueMonth,
        year: parseInt(issueYear),
      };

      const expirationDate = expiry ? {
        month: expiryMonth,
        year: parseInt(expiryYear),
      } : null;

      formData.append("name", certificateName.trim());
      formData.append("issuingOrganization", issuingOrg.trim());
      formData.append("issueDate", JSON.stringify(issue));
      formData.append("expires", expiry ? "true" : "false");
      formData.append("expirationDate", JSON.stringify(expirationDate));
      formData.append("type", certificateType);
      formData.append("level", certificateLevel);
      formData.append("uploadType", certificateUrl ? "url" : "file");

      if (certificateUrl) formData.append("url", certificateUrl.trim());
      if (file) formData.append("certificate", file);

      const response = await axios.put(
        `/certificates/${certificate._id}`,
        formData
      );

      console.log('Certificate updated successfully:', response.data);

      onUpdate(response.data.data);
      toast({
        title: "Certificate Updated",
        description: response.data?.message || "Certificate updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      onClose();
    } catch (err: any) {
      console.error('Error updating certificate:', err);

      toast({
        title: "Update Failed",
        description: err.response?.data?.message ||
          "Failed to update certificate. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFile = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setFileName(file.name);
    setFile(file);
    setCertificateUrl("");
    setFormErrors((prev) => ({ ...prev, upload: "" }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      motionPreset="slideInBottom"
      closeOnOverlayClick={!isUpdating}
      closeOnEsc={!isUpdating}
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={Edit} />
            <Text>Edit Certificate</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton disabled={isUpdating} />

        <ModalBody>
          <VStack spacing={6}>
            <HStack width="full" spacing={4}>
              <FormControl isRequired isInvalid={!!formErrors.name}>
                <FormLabel>Certificate Name</FormLabel>
                <Input
                  placeholder="Enter certificate name"
                  value={certificateName}
                  onChange={(e) => {
                    setCertificateName(e.target.value);
                    setFormErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  size="lg"
                  disabled={isUpdating}
                />
                {formErrors.name && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.name}
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!formErrors.org}>
                <FormLabel>Issuing Organization</FormLabel>
                <Input
                  placeholder="Enter organization name"
                  value={issuingOrg}
                  onChange={(e) => {
                    setIssuingOrg(e.target.value);
                    setFormErrors((prev) => ({ ...prev, org: "" }));
                  }}
                  size="lg"
                  disabled={isUpdating}
                />
                {formErrors.org && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.org}
                  </Text>
                )}
              </FormControl>
            </HStack>

            <HStack width="full" spacing={4}>
              <FormControl isRequired isInvalid={!!formErrors.issueMonth || !!formErrors.issueYear}>
                <FormLabel>Issue Date</FormLabel>
                <HStack spacing={4}>
                  <Select
                    value={issueMonth}
                    onChange={(e) => {
                      setIssueMonth(e.target.value);
                      setFormErrors((prev) => ({ ...prev, issueMonth: "" }));
                    }}
                    placeholder="Select Month"
                    disabled={isUpdating}
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
                    onChange={(e) => {
                      setIssueYear(e.target.value);
                      setFormErrors((prev) => ({ ...prev, issueYear: "" }));
                    }}
                    placeholder="Select Year"
                    disabled={isUpdating}
                  >
                    {getYearRange(-3, 0).map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </HStack>
                {(formErrors.issueMonth || formErrors.issueYear) && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.issueMonth || formErrors.issueYear}
                  </Text>
                )}
              </FormControl>
            </HStack>

            <FormControl isInvalid={!!formErrors.expiryMonth || !!formErrors.expiryYear}>
              <HStack spacing={4} align="flex-start">
                <Checkbox
                  isChecked={expiry}
                  onChange={(e) => {
                    setExpiry(e.target.checked);
                    if (!e.target.checked) {
                      setExpiryMonth("");
                      setExpiryYear("");
                      setFormErrors((prev) => ({
                        ...prev,
                        expiryMonth: "",
                        expiryYear: "",
                      }));
                    }
                  }}
                  colorScheme="green"
                  disabled={isUpdating}
                >
                  Certificate Expires?
                </Checkbox>

                {expiry && (
                  <HStack spacing={4} flex={1}>
                    <Select
                      value={expiryMonth}
                      onChange={(e) => {
                        setExpiryMonth(e.target.value);
                        setFormErrors((prev) => ({ ...prev, expiryMonth: "" }));
                      }}
                      placeholder="Expiry Month"
                      disabled={isUpdating}
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
                      onChange={(e) => {
                        setExpiryYear(e.target.value);
                        setFormErrors((prev) => ({ ...prev, expiryYear: "" }));
                      }}
                      placeholder="Expiry Year"
                      disabled={isUpdating}
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
              {(formErrors.expiryMonth || formErrors.expiryYear) && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {formErrors.expiryMonth || formErrors.expiryYear}
                </Text>
              )}
            </FormControl>

            <HStack width="full" spacing={4}>
              <FormControl isRequired isInvalid={!!formErrors.type}>
                <FormLabel>Certificate Type</FormLabel>
                <Select
                  value={certificateType}
                  onChange={(e) => {
                    setCertificateType(e.target.value as "external" | "internal" | "event");
                    setFormErrors((prev) => ({ ...prev, type: "" }));
                  }}
                  placeholder="Select Type"
                  disabled={isUpdating}
                >
                  <option value="internal">Internal Certification</option>
                  <option value="external">External Certification</option>
                </Select>
                {formErrors.type && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.type}
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!formErrors.level}>
                <FormLabel>Certificate Level</FormLabel>
                <Select
                  value={certificateLevel}
                  onChange={(e) => {
                    setCertificateLevel(e.target.value as "beginner" | "intermediate" | "advanced" | "department");
                    setFormErrors((prev) => ({ ...prev, level: "" }));
                  }}
                  placeholder="Select Level"
                  disabled={isUpdating}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
                {formErrors.level && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.level}
                  </Text>
                )}
              </FormControl>
            </HStack>

            <VStack width="full" spacing={4}>
              <FormControl isInvalid={!!formErrors.upload}>
                <FormLabel>Certificate URL</FormLabel>
                <Input
                  placeholder="Enter certificate URL"
                  value={certificateUrl}
                  onChange={(e) => {
                    setCertificateUrl(e.target.value);
                    setFile(null);
                    setFileName("No File Selected");
                    setFormErrors((prev) => ({ ...prev, upload: "" }));
                  }}
                  disabled={isUpdating}
                />
              </FormControl>

              <Text fontWeight="medium" alignSelf="center">
                OR
              </Text>

              <FormControl isInvalid={!!formErrors.upload}>
                <FormLabel>Upload Certificate</FormLabel>
                <Box
                  border="2px dashed"
                  borderColor={formErrors.upload ? "red.500" : "gray.200"}
                  borderRadius="md"
                  p={6}
                  textAlign="center"
                  _hover={{ borderColor: formErrors.upload ? "red.600" : "blue.500" }}
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
                    disabled={isUpdating}
                  />
                  <label
                    htmlFor="certificate-upload"
                    style={{ cursor: isUpdating ? "not-allowed" : "pointer" }}
                  >
                    <VStack spacing={2}>
                      <Icon as={Upload} boxSize={8} color={formErrors.upload ? "red.500" : "gray.400"} />
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
                        Supports: PDF, JPG, PNG, WEBP (Max 5MB)
                      </Text>
                    </VStack>
                  </label>
                </Box>
                {formErrors.upload && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.upload}
                  </Text>
                )}
              </FormControl>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            isDisabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleUpdate}
            isLoading={isUpdating}
            loadingText="Updating..."
            leftIcon={<Edit />}
          >
            Update Certificate
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditCertificateModal;
