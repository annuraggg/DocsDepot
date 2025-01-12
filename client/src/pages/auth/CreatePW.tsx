import React from "react";
import { Input, Text, Box } from "@chakra-ui/react";
import { InputGroup } from "@/components/ui/input-group";
import { toaster } from "@/components/ui/toaster";
import useAxios from "@/config/axios";

import { Button } from "@/components/ui/button";

import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";

interface CreatePWProps {
  mid: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreatePW = ({ open, setOpen, mid }: CreatePWProps) => {
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

  const submitPW = () => {
    setLoading(true);

    if (!isPasswordValid(pw)) {
      toaster.error({
        title: "Error",
        description:
          "Password must be at least 9 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
      setLoading(false);
      return;
    }

    if (pw !== pw2) {
      toaster.error({
        title: "Error",
        description: "Passwords do not match.",
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
          toaster.success({
            title: "Password Created",
            description: "You may now log in!",
          });
          setOpen(false);
        } else {
          toaster.error({
            title: "Error",
          });
        }
      });
  };

  return (
    <>
      <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
        <DialogContent>
          <DialogHeader
            fontSize="lg"
            fontWeight="bold"
            className="CreatePWHeader"
          >
            Create a New, Secure Password
          </DialogHeader>

          <DialogBody className="">
            <Box className="flex flex-col">
              <Text className="mb-5">
                As You Are Logging In For the First Time, You Need To Create a
                New Password
              </Text>

              <InputGroup
                endElement={
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                }
                className="mb-3"
              >
                <Input
                  pr="4.5rem"
                  type={show ? "text" : "password"}
                  placeholder="Enter Your New, Secure Password"
                  onChange={(e) => setPW(e.target.value)}
                />
              </InputGroup>

              <InputGroup
                endElement={
                  <Button h="1.75rem" size="sm" onClick={handleClick2}>
                    {show2 ? "Hide" : "Show"}
                  </Button>
                }
              >
                <Input
                  pr="4.5rem"
                  type={show2 ? "text" : "password"}
                  placeholder="Confirm Your Password"
                  onChange={(e) => setPW2(e.target.value)}
                />
              </InputGroup>
            </Box>
          </DialogBody>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              colorScheme="green"
              onClick={submitPW}
              ml={3}
              loading={loading}
            >
              Create Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default CreatePW;
