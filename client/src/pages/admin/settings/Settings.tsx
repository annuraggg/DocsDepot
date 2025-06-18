import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Card,
  CardBody,
  Switch,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  RadioGroup,
  Radio,
  Progress,
  VStack,
  HStack,
  useBreakpointValue,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  Heading,
  useToast,
  useColorModeValue,
  Badge,
  Flex,
  Image,
  Skeleton,
  SkeletonText,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import {
  Eye,
  EyeOff,
  Save,
  Shield,
  Settings2,
  Server,
  Database,
  PaintRoller,
  Lock,
  Download,
  AlertTriangle,
  Wrench,
  Palette,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router";
import useAxios from "@/config/axios";
import ClassicCert from "@/assets/img/classic-cert.png";
import GreenCert from "@/assets/img/green-cert.png";
import Cookies from "js-cookie";

// Enhanced interfaces and types
interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

interface BackupProgress {
  progress: number;
  status: "idle" | "started" | "processing" | "completed" | "error";
  message?: string;
  fileName?: string;
  fileData?: string;
  error?: string;
}

// Configuration constants
const CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 9,
    REQUIREMENTS: {
      UPPERCASE: /[A-Z]/,
      LOWERCASE: /[a-z]/,
      NUMBER: /\d/,
      SPECIAL: /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/,
    },
  },
  TOAST: {
    DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
      WARNING: 4000,
    },
    POSITION: "top-right" as const,
  },
  ANIMATION: {
    DURATION: 0.3,
    SPRING: { type: "spring", stiffness: 300, damping: 30 },
  },
} as const;

// Enhanced utility functions
const validatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= CONFIG.PASSWORD.MIN_LENGTH) {
    score += 1;
  } else {
    feedback.push(`Must be at least ${CONFIG.PASSWORD.MIN_LENGTH} characters`);
  }

  if (CONFIG.PASSWORD.REQUIREMENTS.UPPERCASE.test(password)) {
    score += 1;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (CONFIG.PASSWORD.REQUIREMENTS.LOWERCASE.test(password)) {
    score += 1;
  } else {
    feedback.push("Add lowercase letters");
  }

  if (CONFIG.PASSWORD.REQUIREMENTS.NUMBER.test(password)) {
    score += 1;
  } else {
    feedback.push("Add numbers");
  }

  if (CONFIG.PASSWORD.REQUIREMENTS.SPECIAL.test(password)) {
    score += 1;
  } else {
    feedback.push("Add special characters");
  }

  const strengthLevels = [
    { score: 0, label: "Very Weak", color: "red" },
    { score: 1, label: "Weak", color: "red" },
    { score: 2, label: "Fair", color: "orange" },
    { score: 3, label: "Good", color: "yellow" },
    { score: 4, label: "Strong", color: "green" },
    { score: 5, label: "Very Strong", color: "green" },
  ];

  const strength = strengthLevels[score] || strengthLevels[0];

  return {
    score,
    feedback,
    color: strength.color,
    label: strength.label,
  };
};

// Enhanced PasswordInput component
interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showStrength?: boolean;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder,
  showStrength = false,
  error,
}) => {
  const [show, setShow] = useState(false);
  const strength = useMemo(() => validatePasswordStrength(value), [value]);

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const focusBorderColor = error ? "red.500" : "blue.500";

  return (
    <VStack spacing={2} align="stretch">
      <InputGroup size="lg">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          borderColor={error ? "red.500" : borderColor}
          _focus={{
            borderColor: focusBorderColor,
            boxShadow: `0 0 0 1px ${focusBorderColor}`,
          }}
          _hover={{
            borderColor: error ? "red.500" : "gray.300",
          }}
          borderRadius="xl"
          fontSize="md"
        />
        <InputRightElement>
          <IconButton
            aria-label={show ? "Hide password" : "Show password"}
            icon={show ? <EyeOff size={18} /> : <Eye size={18} />}
            onClick={() => setShow(!show)}
            variant="ghost"
            size="sm"
            borderRadius="lg"
          />
        </InputRightElement>
      </InputGroup>

      {showStrength && value && (
        <VStack spacing={2} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">
              Password Strength
            </Text>
            <Badge
              colorScheme={strength.color}
              variant="subtle"
              borderRadius="full"
            >
              {strength.label}
            </Badge>
          </HStack>
          <Progress
            value={(strength.score / 5) * 100}
            colorScheme={strength.color}
            size="sm"
            borderRadius="full"
            bg={useColorModeValue("gray.100", "gray.700")}
          />
          {strength.feedback.length > 0 && (
            <VStack spacing={1} align="start">
              {strength.feedback.map((item, index) => (
                <Text key={index} fontSize="xs" color="gray.500">
                  • {item}
                </Text>
              ))}
            </VStack>
          )}
        </VStack>
      )}

      {error && (
        <Text color="red.500" fontSize="sm">
          {error}
        </Text>
      )}
    </VStack>
  );
};

// Enhanced BackupProgress component
interface BackupProgressProps {
  progress: BackupProgress;
  isVisible: boolean;
}

const BackupProgress: React.FC<BackupProgressProps> = ({
  progress,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={CONFIG.ANIMATION.SPRING}
    >
      <Card variant="outline" borderRadius="xl">
        <CardBody p={6}>
          <VStack spacing={4}>
            <HStack spacing={3} w="full" justify="space-between">
              <HStack spacing={2}>
                <Box
                  color={progress.status === "error" ? "red.500" : "blue.500"}
                >
                  {progress.status === "error" ? (
                    <AlertTriangle size={20} />
                  ) : (
                    <Database size={20} />
                  )}
                </Box>
                <Text fontWeight="600">
                  {progress.status === "error"
                    ? "Backup Failed"
                    : "Creating Backup"}
                </Text>
              </HStack>
              <CircularProgress
                value={progress.progress}
                color={progress.status === "error" ? "red.500" : "blue.500"}
                size="40px"
                thickness="8px"
              >
                <CircularProgressLabel fontSize="xs" fontWeight="600">
                  {progress.progress}%
                </CircularProgressLabel>
              </CircularProgress>
            </HStack>

            <Progress
              value={progress.progress}
              colorScheme={progress.status === "error" ? "red" : "blue"}
              size="lg"
              borderRadius="full"
              bg={useColorModeValue("gray.100", "gray.700")}
              w="full"
            />

            {progress.message && (
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {progress.message}
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// Main Settings Component
const Settings: React.FC = () => {
  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [certificateTheme, setCertificateTheme] = useState<string>("classic");

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string>("");
  const [isPasswordLoading, setIsPasswordLoading] = useState<boolean>(false);

  // Backup state
  const [backupProgress, setBackupProgress] = useState<BackupProgress>({
    progress: 0,
    status: "idle",
  });

  // Hooks
  const toast = useToast();
  const navigate = useNavigate();
  const axios = useAxios();
  // const { colorMode, toggleColorMode } = useColorMode();
  const {
    isOpen: isMaintenanceModalOpen,
    onOpen: onMaintenanceModalOpen,
    onClose: onMaintenanceModalClose,
  } = useDisclosure();

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("gray.50", "gray.900");

  // Memoized password validation
  const passwordValidation = useMemo(() => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return { isValid: false, error: "" };
    }

    if (newPassword === oldPassword) {
      return {
        isValid: false,
        error: "New password cannot be the same as current password",
      };
    }

    if (newPassword !== confirmPassword) {
      return { isValid: false, error: "Passwords do not match" };
    }

    const strength = validatePasswordStrength(newPassword);
    if (strength.score < 3) {
      return { isValid: false, error: "Password is too weak" };
    }

    return { isValid: true, error: "" };
  }, [passwordForm]);

  // API functions
  const fetchMaintenanceStatus = useCallback(async () => {
    try {
      await axios.get("/maintainance");
      setMaintenanceMode(false);
    } catch (err: any) {
      if (err.response?.status === 503) {
        setMaintenanceMode(true);
      }
    }
  }, [axios]);

  const updatePassword = useCallback(async () => {
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      return;
    }

    setIsPasswordLoading(true);
    setPasswordError("");

    try {
      await axios.post("/auth/profile/password", {
        oldPass: passwordForm.oldPassword,
        newPass: passwordForm.newPassword,
      });

      toast({
        title: "Password Updated Successfully",
        description: "Your password has been changed",
        status: "success",
        duration: CONFIG.TOAST.DURATION.SUCCESS,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update password";
      setPasswordError(errorMessage);

      toast({
        title: "Password Update Failed",
        description: errorMessage,
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });
    } finally {
      setIsPasswordLoading(false);
    }
  }, [passwordForm, passwordValidation, axios, toast]);

  const generateBackup = useCallback(async () => {
    try {
      setBackupProgress({ progress: 0, status: "started" });

      if ("EventSource" in window) {
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const url = `${
          import.meta.env.VITE_API_URL
        }/backup/backup-with-progress/${encodeURIComponent(token)}`;
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);

          setBackupProgress({
            progress: data.progress,
            status: data.status,
            message: data.message,
            fileName: data.fileName,
            fileData: data.fileData,
            error: data.error,
          });

          switch (data.status) {
            case "started":
              toast({
                title: "Backup Started",
                description: "Creating your backup file...",
                status: "info",
                duration: CONFIG.TOAST.DURATION.SUCCESS,
                isClosable: true,
                position: CONFIG.TOAST.POSITION,
              });
              break;

            case "completed":
              eventSource.close();

              if (data.fileData && data.fileName) {
                try {
                  const binaryData = atob(data.fileData);
                  const bytes = new Uint8Array(binaryData.length);
                  for (let i = 0; i < binaryData.length; i++) {
                    bytes[i] = binaryData.charCodeAt(i);
                  }
                  const blob = new Blob([bytes], { type: "application/zip" });

                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = data.fileName;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);

                  toast({
                    title: "Backup Complete",
                    description: "Your backup has been downloaded successfully",
                    status: "success",
                    duration: CONFIG.TOAST.DURATION.SUCCESS,
                    isClosable: true,
                    position: CONFIG.TOAST.POSITION,
                  });
                } catch (downloadError) {
                  console.error("Download error:", downloadError);
                  toast({
                    title: "Download Failed",
                    description: "Failed to download the backup file",
                    status: "error",
                    duration: CONFIG.TOAST.DURATION.ERROR,
                    isClosable: true,
                    position: CONFIG.TOAST.POSITION,
                  });
                }
              }

              setTimeout(() => {
                setBackupProgress({ progress: 0, status: "idle" });
              }, 2000);
              break;

            case "error":
              eventSource.close();
              const errorMessage = data.error || "Backup creation failed";

              toast({
                title: "Backup Failed",
                description: errorMessage,
                status: "error",
                duration: CONFIG.TOAST.DURATION.ERROR,
                isClosable: true,
                position: CONFIG.TOAST.POSITION,
              });

              setTimeout(() => {
                setBackupProgress({ progress: 0, status: "idle" });
              }, 2000);
              break;
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          toast({
            title: "Connection Error",
            description: "Failed to connect to backup service",
            status: "error",
            duration: CONFIG.TOAST.DURATION.ERROR,
            isClosable: true,
            position: CONFIG.TOAST.POSITION,
          });

          setBackupProgress({ progress: 0, status: "idle" });
        };
      } else {
        throw new Error(
          "Your browser doesn't support automatic progress tracking"
        );
      }
    } catch (error: any) {
      toast({
        title: "Backup Failed",
        description:
          error.message || "An error occurred while creating the backup",
        status: "error",
        duration: CONFIG.TOAST.DURATION.ERROR,
        isClosable: true,
        position: CONFIG.TOAST.POSITION,
      });

      setBackupProgress({ progress: 0, status: "idle" });
    }
  }, [toast]);

  const toggleMaintenanceMode = useCallback(
    async (mode: boolean) => {
      try {
        const response = await axios.post("/maintainance", { mode });

        setMaintenanceMode(mode);

        toast({
          title: mode
            ? "Maintenance Mode Enabled"
            : "Maintenance Mode Disabled",
          description:
            response.data.message || "Maintenance mode status updated",
          status: "success",
          duration: CONFIG.TOAST.DURATION.SUCCESS,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });

        onMaintenanceModalClose();
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to toggle maintenance mode";

        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: CONFIG.TOAST.DURATION.ERROR,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });
      }
    },
    [axios, toast, onMaintenanceModalClose]
  );

  // const toggleTheme = useCallback(async () => {
  //   const newColorMode = colorMode === "dark" ? "light" : "dark";

  //   toggleColorMode();

  //   try {
  //     const response = await axios.post("/auth/profile/theme", {
  //       colorMode: newColorMode,
  //     });

  //     const token = response.data.data;
  //     if (token) {
  //       Cookies.set("token", token);
  //     }
  //   } catch (err: any) {
  //     console.error(
  //       "Theme toggle error:",
  //       err.response?.data?.message || "Failed to update theme"
  //     );
  //   }
  // }, [colorMode, toggleColorMode, axios]);

  const updateCertificateTheme = useCallback(
    async (theme: string) => {
      const previousTheme = certificateTheme;
      setCertificateTheme(theme);

      try {
        const response = await axios.post("/auth/profile/certificate-theme", {
          certificateTheme: theme,
        });

        const token = response.data.data;
        if (token) {
          Cookies.set("token", token);
        }

        toast({
          title: "Certificate Theme Updated",
          description: `Switched to ${theme} theme`,
          status: "success",
          duration: CONFIG.TOAST.DURATION.SUCCESS,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });
      } catch (err: any) {
        // Revert on error
        setCertificateTheme(previousTheme);

        const errorMessage =
          err.response?.data?.message || "Failed to update certificate theme";

        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: CONFIG.TOAST.DURATION.ERROR,
          isClosable: true,
          position: CONFIG.TOAST.POSITION,
        });
      }
    },
    [certificateTheme, axios, toast]
  );

  const handleViewLogs = useCallback(() => {
    navigate("/admin/logs");
  }, [navigate]);

  // Effects
  useEffect(() => {
    const initializeSettings = async () => {
      setLoading(true);
      await fetchMaintenanceStatus();
      setLoading(false);
    };

    initializeSettings();
  }, []);

  // Update password error when form changes
  useEffect(() => {
    setPasswordError(passwordValidation.error);
  }, [passwordValidation.error]);

  // Loading state
  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" p={8}>
        <Card
          bg={cardBg}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
        >
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={2}>
                  <Skeleton height="32px" width="200px" />
                  <Skeleton height="20px" width="300px" />
                </VStack>
                <Skeleton height="40px" width="40px" borderRadius="lg" />
              </HStack>
              <Divider />
              <VStack spacing={4} align="stretch">
                <Skeleton height="24px" width="150px" />
                <SkeletonText noOfLines={3} spacing="4" />
                <Skeleton height="40px" width="200px" />
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" p={8}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={6} align="stretch" maxW="4xl" mx="auto">
          {/* Header */}
          <Card
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <CardBody p={6}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <HStack spacing={3}>
                  <Box color="blue.500">
                    <Settings2 size={24} />
                  </Box>
                  <Heading size="lg">Settings</Heading>
                </HStack>

                {/* <HStack spacing={3}>
                  <IconButton
                    aria-label="Toggle color mode"
                    icon={
                      colorMode === "dark" ? (
                        <Sun size={20} />
                      ) : (
                        <Moon size={20} />
                      )
                    }
                    onClick={toggleTheme}
                    variant="outline"
                    borderRadius="xl"
                    colorScheme={colorMode === "dark" ? "yellow" : "gray"}
                  />

                  {maintenanceMode && (
                    <Badge
                      colorScheme="orange"
                      variant="solid"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      <HStack spacing={1}>
                        <Wrench size={12} />
                        <Text fontSize="xs">Maintenance</Text>
                      </HStack>
                    </Badge>
                  )}
                </HStack> */}
              </Flex>
            </CardBody>
          </Card>

          {/* Main Settings */}
          <Card
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <CardBody p={6}>
              <Tabs
                variant="soft-rounded"
                colorScheme="blue"
                isFitted={isMobile}
              >
                <TabList
                  mb={6}
                  bg={useColorModeValue("gray.50", "gray.700")}
                  p={2}
                  borderRadius="xl"
                >
                  <Tab borderRadius="lg" fontSize={{ base: "sm", md: "md" }}>
                    <HStack spacing={2}>
                      <Shield size={16} />
                      <Text display={{ base: "none", md: "block" }}>
                        Security
                      </Text>
                    </HStack>
                  </Tab>
                  <Tab borderRadius="lg" fontSize={{ base: "sm", md: "md" }}>
                    <HStack spacing={2}>
                      <Palette size={16} />
                      <Text display={{ base: "none", md: "block" }}>
                        Appearance
                      </Text>
                    </HStack>
                  </Tab>
                  <Tab borderRadius="lg" fontSize={{ base: "sm", md: "md" }}>
                    <HStack spacing={2}>
                      <Server size={16} />
                      <Text display={{ base: "none", md: "block" }}>
                        System
                      </Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Security Tab */}
                  <TabPanel p={0}>
                    <VStack spacing={8} align="stretch">
                      {/* Change Password Section */}
                      <VStack spacing={6} align="stretch">
                        <HStack spacing={3}>
                          <Box color="blue.500">
                            <Lock size={20} />
                          </Box>
                          <Heading size="md">Change Password</Heading>
                        </HStack>

                        <VStack spacing={4} align="stretch">
                          <PasswordInput
                            value={passwordForm.oldPassword}
                            onChange={(value) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                oldPassword: value,
                              }))
                            }
                            placeholder="Current password"
                            error={
                              passwordError && passwordForm.oldPassword
                                ? passwordError
                                : undefined
                            }
                          />

                          <PasswordInput
                            value={passwordForm.newPassword}
                            onChange={(value) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                newPassword: value,
                              }))
                            }
                            placeholder="New password"
                            showStrength={true}
                          />

                          <PasswordInput
                            value={passwordForm.confirmPassword}
                            onChange={(value) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                confirmPassword: value,
                              }))
                            }
                            placeholder="Confirm new password"
                          />

                          <Button
                            leftIcon={
                              isPasswordLoading ? (
                                <Spinner size="sm" />
                              ) : (
                                <Save size={18} />
                              )
                            }
                            colorScheme="blue"
                            size="lg"
                            onClick={updatePassword}
                            isDisabled={
                              !passwordValidation.isValid || isPasswordLoading
                            }
                            isLoading={isPasswordLoading}
                            loadingText="Updating..."
                            borderRadius="xl"
                          >
                            Update Password
                          </Button>
                        </VStack>
                      </VStack>
                    </VStack>
                  </TabPanel>

                  {/* Appearance Tab */}
                  <TabPanel p={0}>
                    <VStack spacing={8} align="stretch">
                      <HStack spacing={3}>
                        <Box color="blue.500">
                          <PaintRoller size={20} />
                        </Box>
                        <Heading size="md">Certificate Theme</Heading>
                      </HStack>

                      <RadioGroup
                        onChange={updateCertificateTheme}
                        value={certificateTheme}
                      >
                        <VStack spacing={6} align="stretch">
                          <HStack spacing={6} justify="center" wrap="wrap">
                            <VStack spacing={4}>
                              <Card
                                variant="outline"
                                borderRadius="xl"
                                overflow="hidden"
                                borderColor={
                                  certificateTheme === "classic"
                                    ? "blue.500"
                                    : borderColor
                                }
                                borderWidth={
                                  certificateTheme === "classic" ? "2px" : "1px"
                                }
                                _hover={{ borderColor: "blue.300" }}
                                transition="all 0.2s"
                                cursor="pointer"
                                onClick={() =>
                                  updateCertificateTheme("classic")
                                }
                              >
                                <Image
                                  src={ClassicCert}
                                  alt="Classic Theme"
                                  w="280px"
                                  h="200px"
                                  objectFit="cover"
                                />
                              </Card>
                              <Radio
                                value="classic"
                                size="lg"
                                colorScheme="blue"
                              >
                                <Text fontWeight="600">Classic Theme</Text>
                              </Radio>
                            </VStack>

                            <VStack spacing={4}>
                              <Card
                                variant="outline"
                                borderRadius="xl"
                                overflow="hidden"
                                borderColor={
                                  certificateTheme === "green"
                                    ? "green.500"
                                    : borderColor
                                }
                                borderWidth={
                                  certificateTheme === "green" ? "2px" : "1px"
                                }
                                _hover={{ borderColor: "green.300" }}
                                transition="all 0.2s"
                                cursor="pointer"
                                onClick={() => updateCertificateTheme("green")}
                              >
                                <Image
                                  src={GreenCert}
                                  alt="Green Theme"
                                  w="280px"
                                  h="200px"
                                  objectFit="cover"
                                />
                              </Card>
                              <Radio
                                value="green"
                                size="lg"
                                colorScheme="green"
                              >
                                <Text fontWeight="600">Green Theme</Text>
                              </Radio>
                            </VStack>
                          </HStack>
                        </VStack>
                      </RadioGroup>
                    </VStack>
                  </TabPanel>

                  {/* System Tab */}
                  <TabPanel p={0}>
                    <VStack spacing={8} align="stretch">
                      {/* System Actions */}
                      <VStack spacing={6} align="stretch">
                        <HStack spacing={3}>
                          <Box color="blue.500">
                            <Server size={20} />
                          </Box>
                          <Heading size="md">System Management</Heading>
                        </HStack>

                        <VStack spacing={4} align="stretch">
                          <Button
                            leftIcon={<FileText size={18} />}
                            colorScheme="blue"
                            size="lg"
                            onClick={handleViewLogs}
                            borderRadius="xl"
                            variant="outline"
                          >
                            View Server Logs
                          </Button>

                          <Button
                            leftIcon={<Download size={18} />}
                            colorScheme="green"
                            size="lg"
                            onClick={generateBackup}
                            isDisabled={backupProgress.status !== "idle"}
                            borderRadius="xl"
                            variant="outline"
                          >
                            {backupProgress.status === "idle"
                              ? "Generate Backup"
                              : "Creating Backup..."}
                          </Button>
                        </VStack>

                        {/* Backup Progress */}
                        <BackupProgress
                          progress={backupProgress}
                          isVisible={backupProgress.status !== "idle"}
                        />
                      </VStack>

                      <Divider />

                      {/* Maintenance Mode */}
                      <VStack spacing={6} align="stretch">
                        <HStack spacing={3}>
                          <Box color="orange.500">
                            <Wrench size={20} />
                          </Box>
                          <Heading size="md">Maintenance Mode</Heading>
                        </HStack>

                        <Card
                          variant="outline"
                          borderRadius="xl"
                          borderColor="orange.200"
                        >
                          <CardBody p={6}>
                            <VStack spacing={4} align="stretch">
                              <FormControl
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <VStack align="start" spacing={1} flex={1}>
                                  <FormLabel
                                    htmlFor="maintenance-mode"
                                    mb={0}
                                    fontWeight="600"
                                  >
                                    Enable Maintenance Mode
                                  </FormLabel>
                                  <Text fontSize="sm" color="gray.600">
                                    Temporarily disable access for regular users
                                  </Text>
                                </VStack>
                                <Switch
                                  id="maintenance-mode"
                                  isChecked={maintenanceMode}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      onMaintenanceModalOpen();
                                    } else {
                                      toggleMaintenanceMode(false);
                                    }
                                  }}
                                  colorScheme="orange"
                                  size="lg"
                                />
                              </FormControl>

                              <Alert
                                status="warning"
                                borderRadius="xl"
                                variant="left-accent"
                              >
                                <AlertIcon />
                                <VStack align="start" spacing={1}>
                                  <AlertTitle fontSize="sm">
                                    Warning!
                                  </AlertTitle>
                                  <AlertDescription fontSize="sm">
                                    Enabling maintenance mode will make the site
                                    inaccessible to regular users. Only use this
                                    during system maintenance or updates.
                                  </AlertDescription>
                                </VStack>
                              </Alert>
                            </VStack>
                          </CardBody>
                        </Card>
                      </VStack>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </motion.div>

      {/* Maintenance Mode Confirmation Modal */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={onMaintenanceModalClose}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader borderBottom="1px" borderColor={borderColor}>
            <HStack spacing={3}>
              <Box color="orange.500">
                <AlertTriangle size={24} />
              </Box>
              <Text>Enable Maintenance Mode?</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <VStack spacing={4} align="start">
              <Text>
                This will temporarily disable access to the platform for all
                regular users. Only administrators will be able to access the
                system.
              </Text>

              <Alert status="warning" borderRadius="xl">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <AlertTitle fontSize="sm">Important</AlertTitle>
                  <AlertDescription fontSize="sm">
                    Make sure to communicate with your users about the scheduled
                    maintenance before enabling this mode.
                  </AlertDescription>
                </VStack>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px" borderColor={borderColor} gap={3}>
            <Button
              variant="outline"
              onClick={onMaintenanceModalClose}
              borderRadius="lg"
            >
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={() => toggleMaintenanceMode(true)}
              leftIcon={<Wrench size={16} />}
              borderRadius="lg"
            >
              Enable Maintenance Mode
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Settings;
