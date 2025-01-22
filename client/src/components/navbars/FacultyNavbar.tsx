import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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
  DrawerFooter,
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
  Textarea,
  FormLabel,
} from "@chakra-ui/react";
import {
  Users,
  Calendar,
  Award,
  Lock,
  Settings,
  UserCircle,
  MessageSquare,
  FileText,
  UserCheck,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import useUser from "@/config/user";
import useAxios from "@/config/axios";
import { Notification } from "@shared-types/Notification";
import { Token } from "@shared-types/Token";

// Helper component for navigation links
interface NavLinkProps {
  icon: React.ReactNode;
  text: string;
  to?: string;
  onClick?: () => void;
  show?: boolean;
}

const NavLink = ({ icon, text, to, onClick, show = true }: NavLinkProps) => {
  const navigate = useNavigate();
  if (!show) return null;

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

const FacultyNavbar = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationExpiry, setNotificationExpiry] = useState("");
  const [resetMoodleId, setResetMoodleId] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [update, setUpdate] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const axios = useAxios();
  const user = useUser();

  const {
    isOpen: isNotificationOpen,
    onClose: onNotificationClose,
  } = useDisclosure();

  const {
    isOpen: isAddNotificationOpen,
    onOpen: onAddNotificationOpen,
    onClose: onAddNotificationClose,
  } = useDisclosure();

  const {
    isOpen: isResetOpen,
    onOpen: onResetOpen,
    onClose: onResetClose,
  } = useDisclosure();

  const token = Cookies.get("token");
  if (!token) {
    window.location.href = "/auth";
    return null;
  }

  const decoded = jwtDecode(token) as Token;
  const hasHouseCoordinatorPerms = decoded?.perms?.some((perm) =>
    ["HCO0", "HCO1", "HCO2", "HCO3"].includes(perm)
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_ADDRESS
          }/faculty/notifications/receive`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error Fetching Notifications",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchNotifications();
  }, [update]);

  const logout = () => {
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
      console.error("Error resetting password:", error);
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

  const addNotification = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/faculty/notifications/add`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationBody, notificationExpiry }),
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        toast({
          title: "Notification Added",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setUpdate(!update);
        onAddNotificationClose();
      } else {
        throw new Error("Failed to add notification");
      }
    } catch (error) {
      console.error("Error adding notification:", error);
      toast({
        title: "Error Adding Notification",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="w-full px-5 mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Left section with logo and nav links */}
          <div className="flex items-center">
            <div
              className="cursor-pointer"
              onClick={() => navigate("/faculty")}
            >
              <img
                src={import.meta.env.VITE_API_URL + "/static/logo.png"}
                className="w-24"
                alt="Logo"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-8">
              <NavLink
                icon={<FileText className="w-4 h-4" />}
                text="My Certifications"
                to="/faculty/certifications"
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
                icon={<Award className="w-4 h-4" />}
                text="Manage Certificates"
                to="/faculty/certificates"
                show={hasHouseCoordinatorPerms}
              />
              <NavLink
                icon={<UserCheck className="w-4 h-4" />}
                text="Enrollment Requests"
                to="/faculty/enrollments"
                show={hasHouseCoordinatorPerms}
              />
              <NavLink
                icon={<Lock className="w-4 h-4" />}
                text="Reset Student Password"
                onClick={onResetOpen}
                show={decoded?.perms?.includes("RSP")}
              />
              <NavLink
                icon={<Users className="w-4 h-4" />}
                text="Manage Students"
                to="/faculty/students"
                show={decoded?.perms?.includes("AES")}
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
                    {decoded.fname} {decoded.lname}
                  </Text>
                  <MenuButton>
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
                <MenuItem onClick={() => navigate("/faculty/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </MenuItem>
                <MenuItem onClick={() => navigate("/profile")}>
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </MenuItem>
                <MenuItem onClick={() => navigate("/feedback")}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Feedback
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={logout}>Logout</MenuItem>
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
                <Alert key={notification._id} className="mb-2">
                  {notification.body}
                </Alert>
              ))
            )}
          </DrawerBody>
          <DrawerFooter>
            {hasHouseCoordinatorPerms && (
              <Button colorScheme="blue" onClick={onAddNotificationOpen}>
                Add House Wide Notification
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Add Notification Modal */}
      <Modal isOpen={isAddNotificationOpen} onClose={onAddNotificationClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add House Wide Notification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box className="space-y-4">
              <Textarea
                placeholder="Enter Notification Here"
                resize="none"
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
              />
              <Box>
                <FormLabel fontSize="sm">Expiry</FormLabel>
                <Input
                  type="date"
                  value={notificationExpiry}
                  onChange={(e) => setNotificationExpiry(e.target.value)}
                />
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddNotificationClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={addNotification}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={isResetOpen} onClose={onResetClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reset Student Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Student Moodle ID"
              value={resetMoodleId}
              onChange={(e) => setResetMoodleId(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onResetClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              isLoading={resetLoading}
              onClick={resetPassword}
            >
              Reset
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default FacultyNavbar;
