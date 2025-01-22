import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Check, X } from "lucide-react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Select,
  Checkbox,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
}

export const UploadModal = ({
  isOpen,
  onClose,
  onUpload,
}: UploadModalProps) => {
  const toast = useToast();
  const [uploadLoading, setUploadLoading] = useState(false);
  
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

  const year = new Date().getFullYear();
  
  const handleUpload = async () => {
    if (!validateForm()) return;
    
    setUploadLoading(true);
    const formData = new FormData();

    formData.append("certificateName", certificateName);
    formData.append("issuingOrg", issuingOrg);
    formData.append("issueMonth", issueMonth);
    formData.append("issueYear", issueYear);
    formData.append("expires", expiry.toString());
    formData.append("expiryMonth", expiryMonth);
    formData.append("expiryYear", expiryYear);
    formData.append("certificateType", certificateType);
    formData.append("certificateLevel", certificateLevel);
    formData.append("certificateURL", certificateUrl);
    if (file) formData.append("certificate", file);

    try {
      await onUpload(formData);
      toast({
        title: "Success",
        description: "Certificate submitted for approval",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload certificate",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!certificateName || !issuingOrg || !issueMonth || !issueYear || !certificateType || !certificateLevel) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    
    if (expiry && (!expiryMonth || !expiryYear)) {
      toast({
        title: "Error",
        description: "Please select both expiry month and year",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!file && !certificateUrl) {
      toast({
        title: "Error",
        description: "Please provide either a file or URL",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setFile(file);
    setCertificateUrl("");
  };

  const MotionModalContent = motion(ModalContent);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay className="backdrop-blur-sm backdrop-brightness-75" />
      <MotionModalContent
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-lg shadow-xl"
      >
        <ModalHeader className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <Upload className="h-5 w-5" />
          <span>Upload Certificate</span>
        </ModalHeader>
        <ModalCloseButton className="hover:bg-gray-100 rounded-full p-2 transition-colors" />
        
        <ModalBody className="py-6">
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <p className="text-blue-700 text-sm">
                Your Certificate will be verified and approved by the Admin
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormControl isRequired>
                <FormLabel>Certificate Name</FormLabel>
                <Input
                  placeholder="Enter certificate name"
                  value={certificateName}
                  onChange={(e) => setCertificateName(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Issuing Organization</FormLabel>
                <Input
                  placeholder="Enter organization name"
                  value={issuingOrg}
                  onChange={(e) => setIssuingOrg(e.target.value)}
                />
              </FormControl>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormControl isRequired>
                <FormLabel>Issue Date</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    placeholder="Select Month"
                    value={issueMonth}
                    onChange={(e) => setIssueMonth(e.target.value)}
                  >
                    {["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"].map((month) => (
                      <option key={month} value={month.toLowerCase().slice(0, 3)}>
                        {month}
                      </option>
                    ))}
                  </Select>
                  <Select
                    placeholder="Select Year"
                    value={issueYear}
                    onChange={(e) => setIssueYear(e.target.value)}
                  >
                    {[year-3, year-2, year-1, year].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Select>
                </div>
              </FormControl>

              <FormControl>
                <div className="flex items-center gap-4 h-full pt-8">
                  <Checkbox
                    isChecked={expiry}
                    onChange={(e) => setExpiry(e.target.checked)}
                    colorScheme="green"
                  >
                    Certificate Expires?
                  </Checkbox>
                  
                  {expiry && (
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <Select
                        placeholder="Expiry Month"
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                      >
                        {["January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"].map((month) => (
                          <option key={month} value={month.toLowerCase().slice(0, 3)}>
                            {month}
                          </option>
                        ))}
                      </Select>
                      <Select
                        placeholder="Expiry Year"
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                      >
                        {[year, year+1, year+2, year+3].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </Select>
                    </div>
                  )}
                </div>
              </FormControl>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormControl isRequired>
                <FormLabel>Certificate Type</FormLabel>
                <Select
                  placeholder="Select Type"
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                >
                  <option value="internal">Internal Certification</option>
                  <option value="external">External Certification</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Certificate Level</FormLabel>
                <Select
                  placeholder="Select Level"
                  value={certificateLevel}
                  onChange={(e) => setCertificateLevel(e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </FormControl>
            </div>

            <div className="space-y-4">
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

              <div className="text-center font-medium text-gray-500">OR</div>

              <FormControl>
                <FormLabel>Upload Certificate</FormLabel>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 transition-colors hover:border-blue-500">
                  <input
                    type="file"
                    id="certificate-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label
                    htmlFor="certificate-upload"
                    className="cursor-pointer block text-center"
                  >
                    <div className="space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="font-medium">
                        {fileName === "No File Selected" ? (
                          <span>
                            Drop your file here or{" "}
                            <span className="text-blue-500">browse</span>
                          </span>
                        ) : (
                          fileName
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Supports: PDF, JPG, PNG, WEBP
                      </p>
                    </div>
                  </label>
                </div>
              </FormControl>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-gray-100 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="mr-3"
            leftIcon={<X className="h-4 w-4" />}
          >
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleUpload}
            isLoading={uploadLoading}
            leftIcon={<Check className="h-4 w-4" />}
          >
            Submit for Approval
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  );
};

export default UploadModal;