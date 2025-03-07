import React, { useEffect, useState } from "react";
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
  VStack,
} from "@chakra-ui/react";
import {
  Users,
  Calendar,
  Award,
  Lock,
  Settings,
  MessageSquare,
  FileText,
  UserCheck,
  Menu as MenuIcon,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import useUser from "@/config/user";
import useAxios from "@/config/axios";
import { Notification } from "@shared-types/Notification";
import { Token } from "@shared-types/Token";
import Logo from "@/assets/img/logo.png";

interface NavLinkProps {
  icon: React.ReactNode;
  text: string;
  to?: string;
  onClick?: () => void;
  show?: boolean;
  onClose?: () => void;
}

const NavLink = ({
  icon,
  text,
  to,
  onClick,
  show = true,
  onClose,
}: NavLinkProps) => {
  const navigate = useNavigate();
  if (!show) return null;

  return (
    <a
      className="flex items-center text-sm font-medium dark:text-gray-400 text-gray-600  hover:text-gray-900 dark:hover:text-gray-100  cursor-pointer"
      onClick={() => {
        onClose?.();
        to ? navigate(to) : onClick?.();
      }}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </a>
  );
};

const FacultyNavbar = () => {
  const [notifications] = useState<Notification[]>([]);
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationExpiry, setNotificationExpiry] = useState("");
  const [resetMoodleId, setResetMoodleId] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const axios = useAxios();
  const user = useUser();

  const {
    isOpen: isMobileMenuOpen,
    onOpen: onMobileMenuOpen,
    onClose: onMobileMenuClose,
  } = useDisclosure();

  const { isOpen: isNotificationOpen, onClose: onNotificationClose } =
    useDisclosure();

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
  console.log(decoded);

  const [hasHouseCoordinatorPerms, setHasHouseCoordinatorPerms] =
    useState(false);

  useEffect(() => {
    const hasHouseCoordinatorPerms =
      (decoded?.house && decoded?.role === "F") || false;

    setHasHouseCoordinatorPerms(hasHouseCoordinatorPerms);
  }, [decoded]);

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

  return (
    <div>
      <div className="w-full px-5 mx-auto">
        <div className="flex justify-between items-center h-16">
          <div className="md:hidden flex items-center">
            <MenuIcon
              className="w-6 h-6 mr-3 cursor-pointer"
              onClick={onMobileMenuOpen}
            />
            <div
              className="cursor-pointer"
              onClick={() => navigate("/faculty")}
            >
              <img src={Logo} className="w-24" alt="Logo" />
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <div
              className="cursor-pointer"
              onClick={() => navigate("/faculty")}
            >
              <img src={Logo} className="w-24" alt="Logo" />
            </div>

            <div className="hidden md:flex ml-10 space-x-8">
              {hasHouseCoordinatorPerms && (
                <Menu>
                  <MenuButton
                    as="button"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <div className="flex items-center justify-center">
                      <Award className="w-4 h-4" />
                      <span className="mx-2">My House</span>
                    </div>
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => navigate("/faculty/certificates")}>
                      Manage Certificates
                    </MenuItem>
                    <MenuItem onClick={() => navigate("/faculty/enrollments")}>
                      Enrollment Requests
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}

              {decoded?.perms?.includes("AES") ||
              decoded?.perms?.includes("RSP") ? (
                <Menu>
                  <MenuButton
                    as="button"
                    className=" text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <div className="flex items-center justify-center">
                      <Users className="w-4 h-4" />
                      <span className="mx-2">Manage Students</span>
                    </div>
                  </MenuButton>
                  <MenuList>
                    {decoded?.perms?.includes("AES") && (
                      <MenuItem onClick={() => navigate("/faculty/students")}>
                        Manage Students
                      </MenuItem>
                    )}

                    {decoded?.perms?.includes("RSP") && (
                      <MenuItem
                        onClick={() => {
                          onResetOpen();
                        }}
                      >
                        Reset Student Password
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>
              ) : null}

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
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Menu>
              <Box className="flex items-center gap-5">
                <Box className="flex items-center justify-end bg-gray-100 dark:bg-gray-800 rounded-xl rounded-r-2xl">
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
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={onMobileMenuClose}
        placement="left"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <img
              src={Logo}
              className="w-24 mb-4"
              alt="Logo"
              onClick={() => {
                navigate("/faculty");
                onMobileMenuClose();
              }}
            />
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <NavLink
                icon={<FileText className="w-4 h-4" />}
                text="My Certifications"
                to="/faculty/certifications"
                onClose={onMobileMenuClose}
              />
              <NavLink
                icon={<Users className="w-4 h-4" />}
                text="Houses"
                to="/houses"
                onClose={onMobileMenuClose}
              />
              <NavLink
                icon={<Calendar className="w-4 h-4" />}
                text="Events"
                to="/events"
                onClose={onMobileMenuClose}
              />
              <NavLink
                icon={<Award className="w-4 h-4" />}
                text="Manage Certificates"
                to="/faculty/certificates"
                show={hasHouseCoordinatorPerms}
                onClose={onMobileMenuClose}
              />
              <NavLink
                icon={<UserCheck className="w-4 h-4" />}
                text="Enrollment Requests"
                to="/faculty/enrollments"
                show={hasHouseCoordinatorPerms}
                onClose={onMobileMenuClose}
              />
              <NavLink
                icon={<Lock className="w-4 h-4" />}
                text="Reset Student Password"
                onClick={() => {
                  onResetOpen();
                  onMobileMenuClose();
                }}
                show={decoded?.perms?.includes("RSP")}
                onClose={onMobileMenuClose}
              />
              <NavLink
                icon={<Users className="w-4 h-4" />}
                text="Manage Students"
                to="/faculty/students"
                show={decoded?.perms?.includes("AES")}
                onClose={onMobileMenuClose}
              />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
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
            <Button colorScheme="blue">Add</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
