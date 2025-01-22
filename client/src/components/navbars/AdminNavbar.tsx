import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Box,
  Text,
  MenuItem,
  Menu,
  MenuButton,
  MenuList,
  MenuDivider,
  Alert,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Avatar,
  useDisclosure,
  useToast,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  Home,
  Users,
  Calendar,
  Building,
  Award,
  Lock,
  Settings,
  UserCircle,
  MessageSquare,
  ChevronDown,
  User,
} from "lucide-react";
import { Notification } from "@shared-types/Notification";
import useUser from "@/config/user";
import useAxios from "@/config/axios";
import Cookies from "js-cookie";
import Logo from "@/assets/img/logo.png";

// Helper component for navigation links
interface NavLinkProps {
  icon: React.ReactNode;
  text: string;
  to?: string;
  onClick?: () => void;
}

const NavLink = ({ icon, text, to, onClick }: NavLinkProps) => {
  const navigate = useNavigate();
  return (
    <a
      className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
      onClick={() => {
        to ? navigate(to) : onClick?.();
      }}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </a>
  );
};

interface AdminNavbarProps {
  notifications?: Notification[];
}

const AdminNavbar = ({ notifications = [] }: AdminNavbarProps) => {
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMoodleId, setResetMoodleId] = useState("");

  const navigate = useNavigate();
  const user = useUser();
  const toast = useToast();
  const axios = useAxios();

  const { isOpen: isNotificationOpen, onClose: onNotificationClose } =
    useDisclosure();

  const {
    isOpen: isResetOpen,
    onOpen: onResetOpen,
    onClose: onResetClose,
  } = useDisclosure();

  const logout = () => {
    localStorage.removeItem("chakra-ui-color-mode");
    [
      import.meta.env.VITE_COOKIE_DOMAIN,
      import.meta.env.VITE_COOKIE_DOMAIN2,
    ].forEach((domain) => {
      Cookies.remove("token", { path: "/", domain });
    });
    window.location.href = "/auth";
  };

  const resetPassword = async () => {
    setResetLoading(true);
    try {
      await axios.post("/user/reset", { mid: resetMoodleId });
      toast({
        title: "Success",
        description: "Password Reset Successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setResetMoodleId("");
      onResetClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="w-full px-5 mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Left section with logo and nav links */}
          <div className="flex items-center">
            <div className="cursor-pointer" onClick={() => navigate("/admin")}>
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

              <Menu>
                <MenuButton
                  as="button"
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <div className="flex items-center justify-center">
                    <User className="w-4 h-4" />
                    <span className="mx-2">Members</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => navigate("/admin/students")}>
                    Students
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/admin/faculty")}>
                    Faculty
                  </MenuItem>
                </MenuList>
              </Menu>

              {/* Certificates Dropdown */}
              <Menu>
                <MenuButton
                  as="button"
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <div className="flex items-center justify-center">
                    <Award className="w-4 h-4" />
                    <span className="mx-2">Certificates</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => navigate("/admin/certificates")}>
                    Student Certificates
                  </MenuItem>
                  <MenuItem
                    onClick={() => navigate("/admin/faculty/certificates")}
                  >
                    Faculty Certificates
                  </MenuItem>
                </MenuList>
              </Menu>

              <NavLink
                icon={<Lock className="w-4 h-4" />}
                text="Reset Password"
                onClick={onResetOpen}
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
            <Menu>
              <Box className="flex items-center gap-5">
                {/* <Bell
                  size={20}
                  className="cursor-pointer"
                  onClick={onNotificationOpen}
                /> */}
                <Box className="flex items-center justify-end bg-gray-100 rounded-xl rounded-r-2xl">
                  <Text className="text-text px-3 py-1 rounded-full h-8 flex items-center text-sm">
                    {user?.fname} {user?.lname}
                  </Text>
                  <MenuButton value="profile">
                    <Avatar
                      size="sm"
                      src={
                        user?.profilePicture
                          ? `${import.meta.env.VITE_API_URL}/static/profile/${
                              user._id
                            }.${user.profilePicture}`
                          : undefined
                      }
                      className="border border-gray-300"
                    />
                  </MenuButton>
                </Box>
              </Box>

              <MenuList>
                <Link to="/admin/settings">
                  <MenuItem value="settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </MenuItem>
                </Link>
                <Link to="/profile">
                  <MenuItem value="profile">
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile
                  </MenuItem>
                </Link>
                <Link to="/feedback">
                  <MenuItem value="feedback">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Feedback
                  </MenuItem>
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

      {/* Notifications Drawer */}
      <Drawer isOpen={isNotificationOpen} onClose={onNotificationClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Notifications</DrawerHeader>
          <DrawerBody>
            {notifications.length === 0 ? (
              <Alert>No Notifications</Alert>
            ) : (
              notifications.map((notification) => (
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

      {/* Reset Password Modal */}
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

export default AdminNavbar;
