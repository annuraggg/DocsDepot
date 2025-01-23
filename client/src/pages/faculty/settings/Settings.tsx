import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  useColorMode,
  useToast,
  Card,
  CardBody,
  Container,
  Divider,
} from "@chakra-ui/react";
import {
  Moon,
  Sun,
  Eye,
  EyeOff,
  Save,
  Shield,
  Settings2,
} from "lucide-react";
import Loader from "../../../components/Loader";

const Settings = () => {
  const [toastDispatched, setToastDispatched] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const toast = useToast();

  const [show1, setShow1] = React.useState(false);
  const [show2, setShow2] = React.useState(false);
  const [show3, setShow3] = React.useState(false);

  const [oldPass, setOldPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [err, setErr] = React.useState("");
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const { colorMode, toggleColorMode } = useColorMode();

  const validatePassMatch = (pass: string) => {
    setConfirmPass(pass);
    if (pass === newPass) {
      setErr("");
      setToastDispatched(true);
    } else {
      setErr("Passwords do not match");
      setToastDispatched(false);
    }
  };

  const sendNewPass = () => {
    if (oldPass === "" || newPass === "" || confirmPass === "") {
      setErr("Please fill all the fields");
      setToastDispatched(false);
    } else if (newPass !== confirmPass) {
      setErr("Passwords do not match");
      setToastDispatched(false);
    } else if (newPass === oldPass) {
      setErr("New Password cannot be same as Old Password");
      setToastDispatched(false);
    } else {
      setErr("");
      setIsButtonLoading(true);

      fetch(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/faculty/profile/updatePW`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ oldPass, newPass }),
        }
      )
        .then(async (res) => {
          setIsButtonLoading(false);
          if (res.status === 401) {
            toast({
              title: "Password Change Failed! Old Password is Incorrect",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          } else {
            return await res.json();
          }
        })
        .then((data) => {
          if (data.success === true) {
            toast({
              title: "Password Changed Successfully!",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            setOldPass("");
            setNewPass("");
            setConfirmPass("");
            setToastDispatched(false);
          } else {
            toast({
              title: "Password Change Failed!",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toast({
            title: "Password Change Failed!",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };

  const setDark = () => {
    toggleColorMode();

    fetch(
      `${import.meta.env.VITE_BACKEND_ADDRESS}/faculty/profile/updateTheme`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: colorMode === "dark" ? "light" : "dark",
        }),
      }
    ).then(() => {});
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (toastDispatched) {
      toast({
        position: "bottom-left",
        title: "Heads up! You Have Unsaved Changes. Save to Apply!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      setToastDispatched(true);
    }
  }, [toastDispatched]);

  if (loading) return <Loader />;

  return (
    <Container maxW="container.lg" py={8}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full shadow-xl rounded-xl">
          <CardBody className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-blue-500" />
                <h1 className="text-3xl font-bold">Settings</h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={setDark}
              >
                {colorMode === "dark" ? (
                  <Sun className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Moon className="w-6 h-6 text-gray-600" />
                )}
              </motion.button>
            </div>

            <div className="space-y-6">
              <Divider />

              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Change Password
                </h2>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type={show1 ? "text" : "password"}
                      placeholder="Enter Old Password"
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      onClick={() => setShow1(!show1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {show1 ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={show2 ? "text" : "password"}
                      placeholder="Enter New Password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      onClick={() => setShow2(!show2)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {show2 ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={show3 ? "text" : "password"}
                      placeholder="Confirm New Password"
                      value={confirmPass}
                      onChange={(e) => validatePassMatch(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      onClick={() => setShow3(!show3)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {show3 ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>

                  {err && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm"
                    >
                      {err}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!toastDispatched || isButtonLoading}
                  onClick={sendNewPass}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  {isButtonLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Settings;