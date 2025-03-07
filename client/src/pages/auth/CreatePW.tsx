import React from "react";
import {
  Input,
  Text,
  Box,
  InputGroup,
  Button,
  useToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  InputRightAddon,
  ModalFooter,
  ModalOverlay,
} from "@chakra-ui/react";
import useAxios from "@/config/axios";

interface CreatePWProps {
  mid: string;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const CreatePW = ({ isOpen, onClose, onOpen, mid }: CreatePWProps) => {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  const [pw, setPW] = React.useState("");
  const [pw2, setPW2] = React.useState("");

  const [show2, setShow2] = React.useState(false);
  const handleClick2 = () => setShow2(!show2);

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const toaster = useToast();

  const validatePassword = (password: string): string | null => {
    if (password.length < 9) {
      return "Password must be at least 9 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) {
      return "Password must contain at least one special character";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const submitPW = async () => {
    try {
      setLoading(true);
      setError("");

      // Validate password
      const validationError = validatePassword(pw);
      if (validationError) {
        toaster({
          title: "Invalid Password",
          description: validationError,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Check password match
      if (pw !== pw2) {
        toaster({
          title: "Error",
          description: "Passwords do not match",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const axios = useAxios();
      const res = await axios.post("/auth/firsttime", {
        mid,
        password: pw.trim(),
        password2: pw2.trim(),
      });

      if (res.status === 200) {
        toaster({
          title: "Success",
          description: "Password created successfully! You may now log in.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Clear form
        setPW("");
        setPW2("");
        onClose();
      } else {
        throw new Error("Failed to create password");
      }
    } catch (err: any) {
      console.error("Error creating password:", err);
      const errorMessage = err.response?.data?.message || "Failed to create password. Please try again.";

      toaster({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            Create a New, Secure Password
          </ModalHeader>

          <ModalBody>
            <Box className="flex flex-col">
              <Text className="mb-5">
                As You Are Logging In For the First Time, You Need To Create a
                New Password
              </Text>

              <InputGroup className="mb-3">
                <Input
                  pr="4.5rem"
                  type={show ? "text" : "password"}
                  placeholder="Enter Your New, Secure Password"
                  onChange={(e) => setPW(e.target.value)}
                  value={pw}
                  isInvalid={!!error}
                />
                <InputRightAddon>
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightAddon>
              </InputGroup>

              <InputGroup>
                <Input
                  pr="4.5rem"
                  type={show2 ? "text" : "password"}
                  placeholder="Confirm Your Password"
                  onChange={(e) => setPW2(e.target.value)}
                  value={pw2}
                  isInvalid={!!error}
                />
                <InputRightAddon>
                  <Button h="1.75rem" size="sm" onClick={handleClick2}>
                    {show2 ? "Hide" : "Show"}
                  </Button>
                </InputRightAddon>
              </InputGroup>

              {error && (
                <Text color="red.500" fontSize="sm" mt={2}>
                  {error}
                </Text>
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              onClick={onOpen}
              isDisabled={loading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={submitPW}
              ml={3}
              isLoading={loading}
              loadingText="Creating..."
            >
              Create Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePW;
