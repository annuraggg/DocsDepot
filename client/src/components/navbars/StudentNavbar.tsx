import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import {
  Box,
  Text,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  MenuItem,
  Menu,
  MenuButton,
  MenuList,
  MenuDivider,
  Alert,
  Drawer,
  DrawerOverlay,
  DrawerCloseButton,
  Avatar,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  Award,
  Home,
  Users,
  Calendar,
  Settings,
  UserCircle,
  MessageSquare,
} from "lucide-react";
import { Notification } from "@shared-types/Notification";
import { Token } from "@shared-types/Token";
import useUser from "@/config/user";
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

interface StudentNavbarProps {
  notifications?: Notification[];
}

const StudentNavbar = ({ notifications = [] }: StudentNavbarProps) => {
  const token = Cookies.get("token") || "";
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const user = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onClose } = useDisclosure();

  useEffect(() => {
    try {
      const decoded: Token = jwtDecode(token);
      setFname(decoded.fname);
      setLname(decoded.lname);
    } catch (error) {
      console.error(error);
      toast({
        title: "An error occurred.",
        description: "Please try again later.",
        status: "error",
      });
      setFname("John");
      setLname("Doe");
    }
  }, [token, toast]);

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

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="w-full px-5 mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Left section with logo and nav links */}
          <div className="flex items-center">
            <div
              className="cursor-pointer"
              onClick={() => navigate("/student")}
            >
              <img src={Logo} className="w-24" alt="Logo" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-8">
              <NavLink
                icon={<Home className="w-4 h-4" />}
                text="Dashboard"
                to="/student"
              />
              <NavLink
                icon={<Award className="w-4 h-4" />}
                text="Certificates"
                to="/student/certificates"
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

          {/* Right section with notifications and profile */}
          <div className="flex items-center space-x-4">
            <Menu>
              <Box className="flex items-center gap-5">
                {/* <Bell size={20} className="cursor-pointer" onClick={onOpen} /> */}
                <Box className="flex items-center justify-end bg-gray-100 rounded-xl rounded-r-2xl">
                  <Text className="text-text px-3 py-1 rounded-full h-8 flex items-center text-sm">
                    {fname} {lname}
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
                <Link to="/student/settings">
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
      <Drawer isOpen={isOpen} onClose={onClose}>
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
    </div>
  );
};

export default StudentNavbar;
