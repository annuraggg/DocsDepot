import { useNavigate } from "react-router";
import Logo from "../../assets/img/logo.png";
import { Box, Button } from "@chakra-ui/react";

const GuestGuestNavbar = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-12 py-3 bg-bg text-gray-600">
      <div className="flex items-center gap-5">
        <div
          className="cursor-pointer"
          onClick={() => {
            navigate("/");
          }}
        >
          <img src={Logo} className="w-24" alt="Logo" />
        </div>
      </div>

      <Box className="flex items-center gap-5">
        <Button
          colorScheme="green"
          variant="link"
          onClick={() => navigate("/auth")}
        >
          Login
        </Button>
      </Box>
    </div>
  );
};

export default GuestGuestNavbar;
