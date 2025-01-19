import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Toast,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  Bell,
  Home,
  Users,
  Calendar,
  UserCheck,
  Briefcase,
  Building,
  Award,
  Lock,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router";
import Logo from "@/assets/img/logo.png";
import useUser from "@/config/user";
import { Link } from "react-router";
import Cookies from "js-cookie";
import { Notification } from "@shared-types/Notification";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import useAxios from "@/config/axios";

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isResetOpen,
    onOpen: onResetOpen,
    onClose: onResetClose,
  } = useDisclosure();
  const [notifications, _setNotifications] = useState<Notification[]>([]);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMoodleId, setResetMoodleId] = useState("");

  const navigate = useNavigate();
  const user = useUser();
  const toast = useToast();
  const axios = useAxios();

  const logout = () => {
    localStorage.removeItem("chakra-ui-color-mode");
    Cookies.remove("token", {
      path: "/",
      domain: import.meta.env.VITE_COOKIE_DOMAIN,
    });
    Cookies.remove("token", {
      path: "/",
      domain: import.meta.env.VITE_COOKIE_DOMAIN2,
    });
    window.location.href = "/auth";
  };

  const resetPassword = () => {
    setResetLoading(true);
    axios
      .post("/user/reset", {
        mid: resetMoodleId,
      })
      .then(() => {
        toast({
          title: "Success",
          description: "Password Reset Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setResetMoodleId("");
        onResetClose();
      })
      .catch((err) => {
        console.error(err);
        Toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setResetLoading(false);
      });
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="w-full px-5 mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Left section with logo and nav links */}
          <div className="flex items-center">
            <div
              className="cursor-pointer"
              onClick={() => {
                navigate("/student");
              }}
            >
              <img src={Logo} className="w-24" alt="Logo" />
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-8">
              <NavLink
                icon={<Home className="w-4 h-4" />}
                text="Dashboard"
                to="/admin"
              />
              <NavLink
                icon={<Users className="w-4 h-4" />}
                text="Houses"
                to="/houses"
              />
              <NavLink
                icon={<Calendar className="w-4 h-4" />}
                text="Events"
                to="/events"
              />
              <NavLink
                icon={<UserCheck className="w-4 h-4" />}
                text="Students"
                to="/admin/students"
              />
              <NavLink
                icon={<Briefcase className="w-4 h-4" />}
                text="Faculty"
                to="/admin/faculty"
              />

              {/* Certificates Dropdown */}
              <Menu>
                <MenuButton
                  as="button"
                  className="flex flex-row items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <div className="flex items-center">
                    <Award className="w-4 h-4" />
                    <span className="ml-2">Certificates</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </div>
                </MenuButton>
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      navigate("/admin/certificates");
                    }}
                  >
                    Student Certificates
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate("/admin/faculty/certificates");
                    }}
                  >
                    Faculty Certificates
                  </MenuItem>
                </MenuList>
              </Menu>

              <NavLink
                icon={<Lock className="w-4 h-4" />}
                text="Reset Password"
                onclick={onResetOpen}
              />

              <NavLink
                icon={<Building className="w-4 h-4" />}
                text="Platform Feedback"
                to="/admin/feedback"
              />
            </div>
          </div>

          {/* Right section with notifications and profile */}
          <div className="flex items-center space-x-4">
            {/* Profile Section */}
            <Menu>
              <Box className="flex items-center gap-5">
                <Bell
                  size={20}
                  className="cursor-pointer"
                  onClick={() => onOpen()}
                />
                <Box className="flex items-center justify-end bg-gray-100 rounded-xl rounded-r-2xl">
                  <Text className=" text-text px-3 py-1 rounded-full h-8 flex items-center text-sm">
                    {user?.fname + " " + user?.lname}
                  </Text>
                  {user?.profilePicture ? (
                    <MenuButton value="profile">
                      <Avatar
                        size="sm"
                        src={
                          import.meta.env.VITE_API_URL +
                          "/static/profile/" +
                          user?._id +
                          "." +
                          user?.profilePicture
                        }
                        className="border border-gray-300"
                      />
                    </MenuButton>
                  ) : (
                    <MenuButton value="profile">
                      <Avatar
                        size="sm"
                        className="border border-gray-300"
                      ></Avatar>
                    </MenuButton>
                  )}
                </Box>
              </Box>
              <MenuList>
                <Link to="/admin/settings">
                  <MenuItem value="settings">Settings</MenuItem>
                </Link>
                <Link to="/profile">
                  <MenuItem value="profile">Profile</MenuItem>
                </Link>
                <Link to="/feedback">
                  <MenuItem value="feedback">Feedback</MenuItem>
                </Link>
                <MenuDivider />
                <MenuItem value="logout" onClick={logout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
        </div>
      </div>

      <Drawer isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Notifications</DrawerHeader>
          <DrawerBody>
            {notifications?.length === 0 ? (
              <Alert>No Notifications</Alert>
            ) : (
              notifications?.map((notification) => (
                <Alert
                  status={notification.scope ? "info" : "warning"}
                  key={notification._id}
                  className="mb-2"
                >
                  {notification.body}
                </Alert>
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isResetOpen} onClose={onResetClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reset Member Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Member Moodle ID"
              value={resetMoodleId}
              onChange={(e) => setResetMoodleId(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onResetClose}>
              Close
            </Button>
            <Button isLoading={resetLoading} onClick={resetPassword}>
              Reset
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

// Helper component for navigation links
interface NavLinkProps {
  icon: React.ReactNode;
  text: string;
  to?: string;
  onclick?: () => void;
}

const NavLink = ({ icon, text, to, onclick }: NavLinkProps) => {
  const navigate = useNavigate();
  return (
    <a
      className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
      onClick={() => {
        to ? navigate(to) : onclick && onclick();
      }}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </a>
  );
};

export default Navbar;
