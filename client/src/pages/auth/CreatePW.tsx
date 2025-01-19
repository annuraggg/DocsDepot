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

  function isPasswordValid(password: string) {
    if (password.length < 9) {
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      return false;
    }
    if (!/[a-z]/.test(password)) {
      return false;
    }
    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) {
      return false;
    }
    if (!/\d/.test(password)) {
      return false;
    }
    return true;
  }

  const [loading, setLoading] = React.useState(false);
  const toaster = useToast();

  const submitPW = () => {
    setLoading(true);

    if (!isPasswordValid(pw)) {
      toaster({
        title: "Error",
        description:
          "Password must be at least 9 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        status: "error",
      });
      setLoading(false);
      return;
    }

    if (pw !== pw2) {
      toaster({
        title: "Error",
        description: "Passwords do not match.",
        status: "error",
      });
      return;
    }

    const axios = useAxios();
    axios
      .post("/auth/firsttime", {
        mid,
        password: pw.trim(),
        password2: pw2.trim(),
      })
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          toaster({
            title: "Password Created",
            description: "You may now log in!",
            status: "success",
          });
          onClose();
        } else {
          toaster({
            title: "Error",
            description: "An error occurred. Please try again later.",
            status: "error",
          });
        }
      });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader
            fontSize="lg"
            fontWeight="bold"
            className="CreatePWHeader"
          >
            Create a New, Secure Password
          </ModalHeader>

          <ModalBody className="">
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
                />
                <InputRightAddon>
                  {" "}
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
                />
                <InputRightAddon>
                  {" "}
                  {
                    <Button h="1.75rem" size="sm" onClick={handleClick2}>
                      {show2 ? "Hide" : "Show"}
                    </Button>
                  }
                </InputRightAddon>
              </InputGroup>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onOpen}>Cancel</Button>
            <Button
              colorScheme="green"
              onClick={submitPW}
              ml={3}
              isLoading={loading}
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
