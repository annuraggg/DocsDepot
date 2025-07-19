import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  useColorMode,
  useToast,
  Card,
  CardBody,
  Container,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import {
  Eye,
  EyeOff,
  Save,
  Shield,
  PaintRoller,
} from "lucide-react";
import Loader from "../../../components/Loader";
import useAxios from "@/config/axios";

import ClassicCert from "@/assets/img/classic-cert.png";
import GreenCert from "@/assets/img/green-cert.png";
import Cookies from "js-cookie";
import useUser from "@/config/user";

const Settings = () => {
  const [toastDispatched, setToastDispatched] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const toast = useToast();
  const user = useUser();

  const [show1, setShow1] = React.useState(false);
  const [show2, setShow2] = React.useState(false);
  const [show3, setShow3] = React.useState(false);

  const [oldPass, setOldPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [err, setErr] = React.useState("");
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [certificateTheme, setCertificateTheme] = React.useState("classic");

  const axios = useAxios();
  const { colorMode } = useColorMode();

  // Rest of the validation and password change logic remains exactly the same
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

      function isPasswordValid(password: string) {
        if (password.length < 9) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) return false;
        if (!/\d/.test(password)) return false;
        return true;
      }

      if (!isPasswordValid(newPass)) {
        setErr(
          "Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character and must be at least 9 characters long"
        );
        setToastDispatched(false);
        setIsButtonLoading(false);
        return;
      }

      axios
        .post("/auth/profile/password", {
          oldPass: oldPass.toString(),
          newPass: newPass.toString(),
        })
        .then(() => {
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
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: err?.response?.data.message || "Password Change Failed!",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        })
        .finally(() => {
          setIsButtonLoading(false);
        });
    }
  };

  useEffect(() => {
    setCertificateTheme(user?.certificateTheme || "classic");
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

  const updateCertificateTheme = (theme: string) => {
    setCertificateTheme(theme);
    axios
      .post("/auth/profile/certificate-theme", {
        certificateTheme: theme,
      })
      .then((res) => {
        const token = res.data.data;
        if (!token) return;

        Cookies.set("token", token);
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: err?.response?.data.message || "Theme Change Failed!",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  if (!loading) {
    return (
      <Container maxW="container.md" py={8}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="w-full shadow-xl rounded-xl"
            style={{
              backgroundColor: colorMode === "dark" ? "#1a202c" : "#ffffff",
            }}
          >
            <CardBody className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h1
                  className="text-3xl font-bold"
                  style={{
                    color: colorMode === "dark" ? "#ffffff" : "#1a202c",
                  }}
                >
                  Settings
                </h1>
              </div>

              <div className="space-y-6">
                <div
                  className={`border-t pt-6 ${
                    colorMode === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <h2
                      className="text-xl font-semibold"
                      style={{
                        color: colorMode === "dark" ? "#ffffff" : "#1a202c",
                      }}
                    >
                      Change Password
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type={show1 ? "text" : "password"}
                        placeholder="Enter Old Password"
                        onChange={(e) => setOldPass(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          colorMode === "dark"
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500"
                        }`}
                      />
                      <button
                        onClick={() => setShow1(!show1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {show1 ? (
                          <EyeOff
                            className={`w-5 h-5 ${
                              colorMode === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          />
                        ) : (
                          <Eye
                            className={`w-5 h-5 ${
                              colorMode === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={show2 ? "text" : "password"}
                        placeholder="Enter New Password"
                        onChange={(e) => setNewPass(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          colorMode === "dark"
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500"
                        }`}
                      />
                      <button
                        onClick={() => setShow2(!show2)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {show2 ? (
                          <EyeOff
                            className={`w-5 h-5 ${
                              colorMode === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          />
                        ) : (
                          <Eye
                            className={`w-5 h-5 ${
                              colorMode === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={show3 ? "text" : "password"}
                        placeholder="Confirm New Password"
                        onChange={(e) => validatePassMatch(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          colorMode === "dark"
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500"
                        }`}
                      />
                      <button
                        onClick={() => setShow3(!show3)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {show3 ? (
                          <EyeOff
                            className={`w-5 h-5 ${
                              colorMode === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          />
                        ) : (
                          <Eye
                            className={`w-5 h-5 ${
                              colorMode === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          />
                        )}
                      </button>
                    </div>

                    {err && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-sm mt-2"
                      >
                        {err}
                      </motion.p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!toastDispatched || isButtonLoading}
                  onClick={sendNewPass}
                  className={`flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium transition-all duration-200
                    ${
                      isButtonLoading || !toastDispatched
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-600"
                    }`}
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
              <div className="py-3 mt-5">
                <div className="flex items-center gap-3 mb-6">
                  <PaintRoller className="w-5 h-5 text-blue-500" />
                  <h2
                    className="text-xl font-semibold"
                    style={{
                      color: colorMode === "dark" ? "#ffffff" : "#1a202c",
                    }}
                  >
                    Certificate Theme
                  </h2>
                </div>
                <div className="flex justify-between items-center">
                  <RadioGroup
                    className="flex gap-4"
                    onChange={updateCertificateTheme}
                    value={certificateTheme}
                  >
                    <div className="flex flex-col items-center">
                      <img
                        src={ClassicCert}
                        alt="Classic Theme"
                        className="mb-2"
                      />
                      <Radio value="classic">Classic Theme</Radio>
                    </div>
                    <div className="flex flex-col items-center">
                      <img src={GreenCert} alt="Green Theme" className="mb-2" />
                      <Radio value="green">Green Theme</Radio>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </Container>
    );
  } else {
    return <Loader />;
  }
};

export default Settings;
