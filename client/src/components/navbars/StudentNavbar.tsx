import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import Logo from "../../assets/img/logo.png";
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
  useDisclosure,
  Avatar,
  useToast,
} from "@chakra-ui/react";
import { Bell } from "lucide-react";
import { Notification } from "@shared-types/Notification";
import { Token } from "@shared-types/Token";
import useUser from "@/config/user";

const Navbar = ({ notifications }: { notifications?: Notification[] }) => {
  const token = Cookies.get("token") || "";
  const [fname, setFname] = React.useState("");
  const [lname, setLname] = React.useState("");
  const user = useUser();
  const navigate = useNavigate();
  const toaster = useToast();

  useEffect(() => {
    let dec: Token;
    try {
      dec = jwtDecode(token);
      setFname(dec.fname);
      setLname(dec.lname);
    } catch (error) {
      console.error(error);
      toaster({
        title: "An error occurred.",
        description: "Please try again later.",
        status: "error",
      });
      setFname("John");
      setLname("Doe");
    }
  }, []);

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

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div className="flex items-center justify-between px-12 py-3 bg-bg text-gray-600">
      <div className="flex items-center gap-5">
        <div
          className="cursor-pointer"
          onClick={() => {
            navigate("/student");
          }}
        >
          <img src={Logo} className="w-24" alt="Logo" />
        </div>
        <div className="hidden sm:block md:hidden">
          <Menu>
            <MenuButton>Pages</MenuButton>
            <MenuList>
              <Link to="/student/certificates">
                <MenuItem value="certificates">Certificates</MenuItem>
              </Link>
              <Link to="/houses">
                <MenuItem value="houses">Houses</MenuItem>
              </Link>
              <Link to="/events">
                <MenuItem value="events">Events</MenuItem>
              </Link>
            </MenuList>
          </Menu>
        </div>
        <div className="hidden sm:flex gap-5">
          <a
            onClick={() => navigate("/student/certificates")}
            className="transition-colors duration-200 hover:text-accent-color cursor-pointer"
          >
            Certificates
          </a>
          <a
            onClick={() => navigate("/houses")}
            className="transition-colors duration-200 hover:text-accent-color cursor-pointer"
          >
            Houses
          </a>
          <a
            onClick={() => navigate("/events")}
            className="transition-colors duration-200 hover:text-accent-color cursor-pointer"
          >
            Events
          </a>
        </div>
      </div>

      <Menu>
        <Box className="flex items-center gap-5">
          <Bell size={20} className="cursor-pointer" onClick={() => onOpen()} />

          <Box className="flex items-center justify-end bg-gray-100 rounded-xl rounded-r-2xl">
            <Text className=" text-text px-3 py-1 rounded-full h-8 flex items-center text-sm">
              {fname + " " + lname}
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
                <Avatar size="sm" className="border border-gray-300"></Avatar>
              </MenuButton>
            )}
          </Box>
        </Box>

        <MenuList>
          <Link to="/student/settings">
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
    </div>
  );
};

export default Navbar;
