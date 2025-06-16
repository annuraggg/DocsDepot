import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  useDisclosure,
  useToast,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Flex,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  Container,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Code,
  List,
  ListItem,
  ListIcon,
  useBreakpointValue,
  ScaleFade,
  Fade,
  Spinner,
  Progress,
} from "@chakra-ui/react";
import {
  Printer,
  CopyIcon,
  Download,
  ExternalLink,
  Shield,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Hash,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import Loader from "@/components/Loader";
import useAxios from "@/config/axios";
import useUser from "@/config/user";
import type { ExtendedCertificate as ICertificate } from "@/types/ExtendedCertificate";
import { Comment } from "@shared-types/Certificate";
import { User } from "@shared-types/User";
import GreenTheme from "./GreenTheme";
import ClassicTheme from "./ClassicTheme";
import CommentSection from "./CommentSection";
import DeleteCertificateModal from "./DeleteCertificateModal";
import EditCertificateModal from "./EditCertificateModal";
import generatePDF, { usePDF } from "react-to-pdf";

// Enhanced interfaces
interface ExtendedComment extends Omit<Comment, "user"> {
  user: User | string;
}

interface CertificatePageState {
  certificate: ICertificate | null;
  loading: boolean;
  buttonLoading: {
    approve: boolean;
    reject: boolean;
    download: boolean;
    print: boolean;
  };
  editPrivilege: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  error: string | null;
  retryCount: number;
}

interface CertificateAction {
  type:
    | "LOADING"
    | "SUCCESS"
    | "ERROR"
    | "SET_BUTTON_LOADING"
    | "SET_EDIT_PRIVILEGE"
    | "SET_MODAL_STATE"
    | "UPDATE_CERTIFICATE";
  payload?: any;
}

// Constants
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

// State reducer for better state management
const certificateReducer = (
  state: CertificatePageState,
  action: CertificateAction
): CertificatePageState => {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: action.payload, error: null };
    case "SUCCESS":
      return {
        ...state,
        certificate: action.payload,
        loading: false,
        error: null,
        retryCount: 0,
      };
    case "ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        retryCount: state.retryCount + 1,
      };
    case "SET_BUTTON_LOADING":
      return {
        ...state,
        buttonLoading: { ...state.buttonLoading, ...action.payload },
      };
    case "SET_EDIT_PRIVILEGE":
      return { ...state, editPrivilege: action.payload };
    case "SET_MODAL_STATE":
      return { ...state, ...action.payload };
    case "UPDATE_CERTIFICATE":
      return { ...state, certificate: action.payload };
    default:
      return state;
  }
};

const Certificate: React.FC = () => {
  // Hooks
  const axios = useAxios();
  const user = useUser();
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    isOpen: isHashModalOpen,
    onOpen: onHashModalOpen,
    onClose: onHashModalClose,
  } = useDisclosure();
  const { targetRef } = usePDF({ filename: `certificate-${id}.pdf` });

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const cardDirection = useBreakpointValue({ base: "column", xl: "row" }) as
    | "column"
    | "row";

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // State management with reducer
  const [state, dispatch] = React.useReducer(certificateReducer, {
    certificate: null,
    loading: true,
    buttonLoading: {
      approve: false,
      reject: false,
      download: false,
      print: false,
    },
    editPrivilege: false,
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    error: null,
    retryCount: 0,
  });

  // Memoized values
  const canEdit = useMemo(() => {
    return state.editPrivilege && state.certificate?.status !== "approved";
  }, [state.editPrivilege, state.certificate?.status]);

  const canApprove = useMemo(() => {
    if (!user || !state.certificate || state.certificate.status !== "pending")
      return false;

    // Admin can approve faculty certificates
    if (user.role === "A" && state.certificate.user?.role === "F") return true;

    // Faculty can approve student certificates from same house
    if (
      user.role === "F" &&
      state.certificate.user?.role === "S" &&
      user.house === state.certificate.user?.house
    )
      return true;

    return false;
  }, [user, state.certificate]);

  const statusConfig = useMemo(() => {
    const config = {
      pending: {
        color: "yellow",
        icon: Clock,
        text: "Pending Approval",
        description: "This certificate is awaiting approval",
      },
      approved: {
        color: "green",
        icon: CheckCircle,
        text: "Approved",
        description:
          state.certificate?.user?.role === "S"
            ? `House earned ${state.certificate?.earnedXp} XP from this certificate`
            : "This certificate has been approved",
      },
      rejected: {
        color: "red",
        icon: XCircle,
        text: "Rejected",
        description: "This certificate has been rejected",
      },
    };
    return state.certificate?.status
      ? config[state.certificate.status]
      : config.pending;
  }, [
    state.certificate?.status,
    state.certificate?.earnedXp,
    state.certificate?.user?.role,
  ]);

  // Enhanced certificate fetching with retry logic
  const fetchCertificate = useCallback(
    async (retryAttempt = 0) => {
      if (!id) {
        dispatch({ type: "ERROR", payload: "Certificate ID is required" });
        return;
      }

      dispatch({ type: "LOADING", payload: true });

      try {
        const response = await axios.get(`/certificates/${id}`);
        const certificateData = response.data.data;

        dispatch({ type: "SUCCESS", payload: certificateData });
        dispatch({
          type: "SET_EDIT_PRIVILEGE",
          payload: user?._id === certificateData.user?._id,
        });
      } catch (error: any) {
        console.error("Error fetching certificate:", error);

        const errorMessage =
          error.response?.data?.message ||
          (error.response?.status === 404
            ? "Certificate not found"
            : "Failed to load certificate");

        if (
          retryAttempt < MAX_RETRY_ATTEMPTS &&
          error.response?.status !== 404
        ) {
          toast({
            title: "Connection Issue",
            description: `Retrying... (${
              retryAttempt + 1
            }/${MAX_RETRY_ATTEMPTS})`,
            status: "warning",
            duration: 2000,
            isClosable: true,
          });

          setTimeout(() => {
            fetchCertificate(retryAttempt + 1);
          }, RETRY_DELAY);
        } else {
          dispatch({ type: "ERROR", payload: errorMessage });

          if (error.response?.status === 404) {
            toast({
              title: "Certificate Not Found",
              description: "The requested certificate could not be found.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }
      }
    },
    [id, axios, user?._id, toast]
  );

  // Initial load
  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  // Enhanced handlers
  const handleCopy = useCallback(
    async (text: string, label = "Text") => {
      try {
        await navigator.clipboard.writeText(text);
        toast({
          title: `${label} copied!`,
          description: "Successfully copied to clipboard",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        toast({
          title: `${label} copied!`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  const handleDownload = useCallback(async () => {
    if (!state.certificate) return;

    dispatch({ type: "SET_BUTTON_LOADING", payload: { download: true } });

    try {
      const response = await axios.get(
        `/certificates/${state.certificate._id}/download`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${state.certificate.name}.${state.certificate.extension}`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Successful",
        description: "Certificate downloaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Error downloading certificate:", error);
      toast({
        title: "Download Failed",
        description:
          error.response?.data?.message || "Failed to download certificate",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: "SET_BUTTON_LOADING", payload: { download: false } });
    }
  }, [state.certificate, axios, toast]);

  const handlePrint = useCallback(async () => {
    if (!state.certificate) return;

    dispatch({ type: "SET_BUTTON_LOADING", payload: { print: true } });

    try {
      await generatePDF(targetRef, {
        method: "open",
        page: {
          format: "letter",
          orientation: "landscape",
        },
        filename: `${state.certificate.name}-certificate.pdf`,
      });

      toast({
        title: "PDF Generated",
        description: "Certificate PDF opened in new tab",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Print Failed",
        description: "Failed to generate PDF",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: "SET_BUTTON_LOADING", payload: { print: false } });
    }
  }, [state.certificate, targetRef, toast]);

  const handleStatusChange = useCallback(
    async (action: "approve" | "reject") => {
      if (!state.certificate) return;

      const actionKey = action === "approve" ? "approve" : "reject";
      dispatch({ type: "SET_BUTTON_LOADING", payload: { [actionKey]: true } });

      try {
        const endpoint = action === "approve" ? "accept" : "reject";
        await axios.put(`/certificates/${state.certificate._id}/${endpoint}`);

        const newStatus = action === "approve" ? "approved" : "rejected";
        const updatedCertificate = {
          ...state.certificate,
          status: newStatus,
          earnedXp: action === "reject" ? 10 : state.certificate.earnedXp,
        };

        dispatch({ type: "UPDATE_CERTIFICATE", payload: updatedCertificate });

        toast({
          title: `Certificate ${
            action === "approve" ? "Approved" : "Rejected"
          }`,
          description: `Successfully ${action}d the certificate`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error: any) {
        console.error(`Error ${action}ing certificate:`, error);
        toast({
          title: `${action === "approve" ? "Approval" : "Rejection"} Failed`,
          description:
            error.response?.data?.message || `Failed to ${action} certificate`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        dispatch({
          type: "SET_BUTTON_LOADING",
          payload: { [actionKey]: false },
        });
      }
    },
    [state.certificate, axios, toast]
  );

  const addComment = useCallback(
    async (comment: ExtendedComment) => {
      if (!state.certificate) return;

      try {
        await axios.post(`/certificates/${state.certificate._id}/comment`, {
          comment: comment,
        });

        toast({
          title: "Comment Posted",
          description: "Your comment has been added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Refresh certificate data to get updated comments
        fetchCertificate();
      } catch (error: any) {
        console.error("Error posting comment:", error);
        toast({
          title: "Comment Failed",
          description:
            error.response?.data?.message || "Failed to post comment",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [state.certificate, axios, toast, fetchCertificate]
  );

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <Container maxW="8xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Skeleton height="40px" />
        <Flex direction={cardDirection} gap={8}>
          <Box flex="2">
            <Skeleton height="600px" borderRadius="lg" />
          </Box>
          <Box flex="1">
            <VStack spacing={4} align="stretch">
              <Skeleton height="50px" />
              <Skeleton height="50px" />
              <Skeleton height="50px" />
              <SkeletonText noOfLines={4} spacing="4" />
            </VStack>
          </Box>
        </Flex>
      </VStack>
    </Container>
  );

  // Error state
  const renderErrorState = () => (
    <Container maxW="4xl" py={8}>
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="lg"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {state.error?.includes("not found")
            ? "Certificate Not Found"
            : "Loading Failed"}
        </AlertTitle>
        <AlertDescription maxWidth="sm">{state.error}</AlertDescription>
        <HStack mt={4} spacing={3}>
          <Button
            colorScheme="blue"
            onClick={() => fetchCertificate()}
            leftIcon={<AlertCircle size={16} />}
            size="sm"
          >
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/certificates")}
            leftIcon={<ArrowLeft size={16} />}
            size="sm"
          >
            Back to Certificates
          </Button>
        </HStack>
      </Alert>
    </Container>
  );

  // Main render
  if (state.loading) return renderLoadingSkeleton();
  if (state.error) return renderErrorState();
  if (!state.certificate) return null;

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="8xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
            <HStack spacing={4}>
              <IconButton
                aria-label="Back to certificates"
                icon={<ArrowLeft size={20} />}
                variant="ghost"
                onClick={() => navigate("/certificates")}
              />
              <Box>
                <Heading size="lg" color="gray.700">
                  {state.certificate.name}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  Certificate Details
                </Text>
              </Box>
            </HStack>

            <HStack spacing={2}>
              <Badge
                colorScheme={statusConfig.color}
                variant="subtle"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                <HStack spacing={1}>
                  <statusConfig.icon size={14} />
                  <Text>{statusConfig.text}</Text>
                </HStack>
              </Badge>
            </HStack>
          </Flex>

          {/* Main Content */}
          <Flex direction={cardDirection} gap={8} align="flex-start">
            {/* Certificate Preview */}
            <Card flex="2" bg={cardBg} borderColor={borderColor} shadow="lg">
              <CardBody p={0}>
                <Box
                  id="certificate-print-area"
                  position="relative"
                  overflow="hidden"
                  borderRadius="lg"
                >
                  {user?.certificateTheme === "classic" ? (
                    <ClassicTheme
                      certificate={state.certificate}
                      ref={targetRef}
                    />
                  ) : (
                    <GreenTheme
                      certificate={state.certificate}
                      ref={targetRef}
                    />
                  )}
                </Box>
              </CardBody>
            </Card>

            {/* Actions Panel */}
            <Card flex="1" bg={cardBg} borderColor={borderColor} shadow="lg">
              <CardHeader>
                <Heading size="md">Actions</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Print/Download */}
                  <Button
                    leftIcon={<Printer size={18} />}
                    colorScheme="green"
                    size="lg"
                    onClick={handlePrint}
                    isLoading={state.buttonLoading.print}
                    loadingText="Generating PDF..."
                    _hover={{ transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                  >
                    Print / Download PDF
                  </Button>

                  {/* View Certificate (URL) */}
                  {state.certificate.uploadType === "url" && (
                    <Button
                      leftIcon={<ExternalLink size={18} />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => {
                        const url = import.meta.env.VITE_BASENAME
                          ? import.meta.env.VITE_BASENAME +
                            state.certificate?.url
                          : state.certificate?.url;
                        window.open(url, "_blank");
                      }}
                    >
                      View Original Certificate
                    </Button>
                  )}

                  {/* Download Original (File) */}
                  {state.certificate.uploadType === "file" && (
                    <Button
                      leftIcon={<Download size={18} />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={handleDownload}
                      isLoading={state.buttonLoading.download}
                      loadingText="Downloading..."
                    >
                      Download Original
                    </Button>
                  )}

                  {/* Verify Hashes */}
                  {(state.certificate.hashes?.sha256 ||
                    state.certificate.hashes?.md5) && (
                    <Button
                      leftIcon={<Hash size={18} />}
                      colorScheme="teal"
                      variant="outline"
                      onClick={onHashModalOpen}
                    >
                      Verify Integrity
                    </Button>
                  )}

                  <Divider />

                  {/* Status Information */}
                  <Alert status={statusConfig.color as any} borderRadius="md">
                    <AlertIcon as={statusConfig.icon} />
                    <Box>
                      <AlertTitle fontSize="sm">{statusConfig.text}</AlertTitle>
                      <AlertDescription fontSize="xs">
                        {statusConfig.description}
                      </AlertDescription>
                    </Box>
                  </Alert>

                  {/* Admin/Faculty Controls */}
                  {canApprove && (
                    <ScaleFade initialScale={0.9} in={true}>
                      <Card variant="outline" borderColor="red.200">
                        <CardHeader pb={2}>
                          <Text fontSize="sm" fontWeight="bold" color="red.600">
                            {user?.role === "A"
                              ? "Admin Controls"
                              : "House Coordinator Controls"}
                          </Text>
                        </CardHeader>
                        <CardBody pt={0}>
                          <HStack spacing={3}>
                            <Button
                              leftIcon={<CheckCircle size={16} />}
                              colorScheme="green"
                              size="sm"
                              flex="1"
                              onClick={() => handleStatusChange("approve")}
                              isLoading={state.buttonLoading.approve}
                              loadingText="Approving..."
                            >
                              Approve
                            </Button>
                            <Button
                              leftIcon={<XCircle size={16} />}
                              colorScheme="red"
                              size="sm"
                              flex="1"
                              onClick={() => handleStatusChange("reject")}
                              isLoading={state.buttonLoading.reject}
                              loadingText="Rejecting..."
                            >
                              Reject
                            </Button>
                          </HStack>
                        </CardBody>
                      </Card>
                    </ScaleFade>
                  )}

                  {/* Edit Controls */}
                  {state.editPrivilege && (
                    <ScaleFade initialScale={0.9} in={true}>
                      <Card variant="outline" borderColor="blue.200">
                        <CardHeader pb={2}>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="blue.600"
                          >
                            Certificate Controls
                          </Text>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack spacing={3}>
                            <Button
                              leftIcon={<Edit size={16} />}
                              colorScheme="blue"
                              variant="outline"
                              size="sm"
                              w="full"
                              isDisabled={!canEdit}
                              onClick={() =>
                                dispatch({
                                  type: "SET_MODAL_STATE",
                                  payload: { isEditModalOpen: true },
                                })
                              }
                            >
                              Edit Certificate
                            </Button>
                            <Button
                              leftIcon={<Trash2 size={16} />}
                              colorScheme="red"
                              variant="outline"
                              size="sm"
                              w="full"
                              isDisabled={!canEdit}
                              onClick={() =>
                                dispatch({
                                  type: "SET_MODAL_STATE",
                                  payload: { isDeleteModalOpen: true },
                                })
                              }
                            >
                              Delete Certificate
                            </Button>
                            {!canEdit && (
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                textAlign="center"
                              >
                                Approved certificates cannot be modified
                              </Text>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </ScaleFade>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </Flex>

          {/* Comments Section */}
          <Fade in={true} style={{ transitionDelay: "0.3s" }}>
            <CommentSection
              certificate={state.certificate}
              onCommentAdd={addComment}
            />
          </Fade>
        </VStack>
      </Container>

      {/* Hash Verification Modal */}
      <Modal isOpen={isHashModalOpen} onClose={onHashModalClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Shield size={24} />
              <Text>Certificate Integrity Verification</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">
                    What is hash verification?
                  </AlertTitle>
                  <AlertDescription fontSize="xs">
                    Hash verification ensures the certificate file hasn't been
                    tampered with or corrupted.
                  </AlertDescription>
                </Box>
              </Alert>

              {/* Hash Values */}
              <VStack spacing={4} align="stretch">
                {state.certificate.hashes?.md5 && (
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      MD5 Hash:
                    </Text>
                    <HStack>
                      <Code flex="1" p={3} borderRadius="md" fontSize="sm">
                        {state.certificate.hashes.md5}
                      </Code>
                      <Tooltip label="Copy MD5 hash">
                        <IconButton
                          aria-label="Copy MD5"
                          icon={<CopyIcon size={16} />}
                          size="sm"
                          onClick={() =>
                            handleCopy(
                              state.certificate?.hashes?.md5 || "",
                              "MD5 hash"
                            )
                          }
                        />
                      </Tooltip>
                    </HStack>
                  </Box>
                )}

                {state.certificate.hashes?.sha256 && (
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      SHA256 Hash:
                    </Text>
                    <HStack>
                      <Code flex="1" p={3} borderRadius="md" fontSize="sm">
                        {state.certificate.hashes.sha256}
                      </Code>
                      <Tooltip label="Copy SHA256 hash">
                        <IconButton
                          aria-label="Copy SHA256"
                          icon={<CopyIcon size={16} />}
                          size="sm"
                          onClick={() =>
                            handleCopy(
                              state.certificate?.hashes?.sha256 || "",
                              "SHA256 hash"
                            )
                          }
                        />
                      </Tooltip>
                    </HStack>
                  </Box>
                )}
              </VStack>

              <Divider />

              {/* Verification Instructions */}
              <Box>
                <Text fontWeight="semibold" mb={3}>
                  Verification Instructions:
                </Text>

                <List spacing={4}>
                  <ListItem>
                    <Text fontWeight="medium" mb={2}>
                      Windows:
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {state.certificate.hashes?.md5 && (
                        <HStack>
                          <Code flex="1" p={2} fontSize="xs">
                            certutil -hashfile "certificate.pdf" MD5
                          </Code>
                          <IconButton
                            aria-label="Copy Windows MD5 command"
                            icon={<CopyIcon size={14} />}
                            size="xs"
                            onClick={() =>
                              handleCopy(
                                'certutil -hashfile "certificate.pdf" MD5',
                                "Windows MD5 command"
                              )
                            }
                          />
                        </HStack>
                      )}
                      {state.certificate.hashes?.sha256 && (
                        <HStack>
                          <Code flex="1" p={2} fontSize="xs">
                            certutil -hashfile "certificate.pdf" SHA256
                          </Code>
                          <IconButton
                            aria-label="Copy Windows SHA256 command"
                            icon={<CopyIcon size={14} />}
                            size="xs"
                            onClick={() =>
                              handleCopy(
                                'certutil -hashfile "certificate.pdf" SHA256',
                                "Windows SHA256 command"
                              )
                            }
                          />
                        </HStack>
                      )}
                    </VStack>
                  </ListItem>

                  <ListItem>
                    <Text fontWeight="medium" mb={2}>
                      macOS/Linux:
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {state.certificate.hashes?.md5 && (
                        <HStack>
                          <Code flex="1" p={2} fontSize="xs">
                            md5 certificate.pdf
                          </Code>
                          <IconButton
                            aria-label="Copy macOS MD5 command"
                            icon={<CopyIcon size={14} />}
                            size="xs"
                            onClick={() =>
                              handleCopy(
                                "md5 certificate.pdf",
                                "macOS MD5 command"
                              )
                            }
                          />
                        </HStack>
                      )}
                      {state.certificate.hashes?.sha256 && (
                        <HStack>
                          <Code flex="1" p={2} fontSize="xs">
                            sha256sum certificate.pdf
                          </Code>
                          <IconButton
                            aria-label="Copy Linux SHA256 command"
                            icon={<CopyIcon size={14} />}
                            size="xs"
                            onClick={() =>
                              handleCopy(
                                "sha256sum certificate.pdf",
                                "Linux SHA256 command"
                              )
                            }
                          />
                        </HStack>
                      )}
                    </VStack>
                  </ListItem>
                </List>
              </Box>

              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Verification Success</AlertTitle>
                  <AlertDescription fontSize="xs">
                    If the generated hash matches the one shown above, your
                    certificate is authentic and unmodified.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onHashModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <EditCertificateModal
        isOpen={state.isEditModalOpen}
        onClose={() =>
          dispatch({
            type: "SET_MODAL_STATE",
            payload: { isEditModalOpen: false },
          })
        }
        certificate={state.certificate}
        onUpdate={(updatedCertificate) => {
          dispatch({ type: "UPDATE_CERTIFICATE", payload: updatedCertificate });
        }}
      />

      {/* Delete Modal */}
      <DeleteCertificateModal
        isOpen={state.isDeleteModalOpen}
        onClose={() =>
          dispatch({
            type: "SET_MODAL_STATE",
            payload: { isDeleteModalOpen: false },
          })
        }
        certificate={state.certificate}
        onDelete={() => {
          navigate("/certificates");
        }}
      />
    </Box>
  );
};

export default Certificate;
