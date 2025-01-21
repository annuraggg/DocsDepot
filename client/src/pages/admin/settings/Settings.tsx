import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  useColorMode,
  useToast,
  Card,
  CardBody,
  Container,
  Switch,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Divider,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import {
  Moon,
  Sun,
  Eye,
  EyeOff,
  Save,
  Shield,
  Settings2,
  Server,
  Database,
  PaintRoller,
} from "lucide-react";
import Loader from "../../../components/Loader";
import { useNavigate } from "react-router";
import useAxios from "@/config/axios";
import ClassicCert from "@/assets/img/classic-cert.png";
import GreenCert from "@/assets/img/green-cert.png";
import Cookies from "js-cookie";

const Settings = () => {
  const [toastDispatched, setToastDispatched] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [backupIsLoading, setBackupIsLoading] = React.useState(false);
  const [certificateTheme, setCertificateTheme] = React.useState("classic");
  const toast = useToast();
  const navigate = useNavigate();

  const [show1, setShow1] = React.useState(false);
  const [show2, setShow2] = React.useState(false);
  const [show3, setShow3] = React.useState(false);

  const [oldPass, setOldPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [err, setErr] = React.useState("");
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const axios = useAxios();

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

  const generateBackup = () => {
    setBackupIsLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/admin/backups`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (res.status === 200) {
          const blob = await res.blob();
          const element = document.createElement("a");
          element.href = URL.createObjectURL(blob);
          const date = new Date();
          const dateString = `${date.getFullYear()}-${
            date.getMonth() + 1
          }-${date.getDate()}`;
          const timeString = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
          element.download = `Backup-${dateString}-${timeString}.zip`;
          document.body.appendChild(element);
          element.click();
          setBackupIsLoading(false);
          toast({
            title: "Backup Generated Successfully!",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          throw new Error("Backup generation failed");
        }
      })
      .catch(() => {
        setBackupIsLoading(false);
        toast({
          title: "Backup Generation Failed!",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const toggleMaintenanceMode = (mode: boolean) => {
    axios
      .post("/maintainance", { mode })
      .then((res) => {
        setMaintenanceMode(mode);
        toast({
          title: res.data.message || "Maintenance Mode Toggled!",
          status: res.status === 200 ? "success" : "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        toast({
          title:
            err?.response?.data.message || "Maintenance Mode Toggle Failed!",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const setDark = () => {
    toggleColorMode();

    axios
      .post("/auth/profile/theme", {
        colorMode: colorMode === "dark" ? "light" : "dark",
      })
      .then((res) => {
        const token = res.data.data;
        if (!token) return;

        Cookies.set("token", token);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    setLoading(false);
    axios
      .get("/maintainance")
      .then((res) => {
        setMaintenanceMode(false);
      })
      .catch((err) => {
        if (err.response.status === 503) {
          setMaintenanceMode(true);
          return;
        }
      });
  }, []);

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

            <Tabs variant="enclosed" className="mt-6">
              <TabList className="mb-4">
                <Tab className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Settings
                </Tab>
                <Tab className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Server Settings
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
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
                            <img
                              src={GreenCert}
                              alt="Green Theme"
                              className="mb-2"
                            />
                            <Radio value="green">Green Theme</Radio>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="space-y-6">
                    <Button
                      leftIcon={<Server className="w-5 h-5" />}
                      colorScheme="blue"
                      onClick={() => navigate("/admin/logs")}
                      className="w-full"
                    >
                      Check Server Logs
                    </Button>

                    <Button
                      leftIcon={<Database className="w-5 h-5" />}
                      colorScheme="green"
                      onClick={generateBackup}
                      isLoading={backupIsLoading}
                      className="w-full"
                    >
                      Generate Backup
                    </Button>
                    <Divider />

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="maintenance-mode" mb="0">
                        Maintenance Mode
                      </FormLabel>
                      <Switch
                        id="maintenance-mode"
                        isChecked={maintenanceMode}
                        onChange={(e) =>
                          toggleMaintenanceMode(e.target.checked)
                        }
                      />
                    </FormControl>

                    <Alert status="error" className="mt-4">
                      <AlertIcon />
                      <div className="flex flex-col">
                        <span className="font-medium">Warning!</span>
                        <span className="text-sm">
                          Enabling maintenance mode will make the site
                          inaccessible to regular users. Only use this during
                          system maintenance or updates.
                        </span>
                      </div>
                    </Alert>
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Settings;
