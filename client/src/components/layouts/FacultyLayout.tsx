import { Outlet } from "react-router";
import { useEffect } from "react";
import Cookies from "js-cookie";
import FacultyNavbar from "../navbars/FacultyNavbar";
import useUser from "@/config/user";
import { useNavigate } from "react-router";

const FacultyLayout = () => {
  // check if cookie exists, if not redirect to login with redirect to current page
  const navigate = useNavigate();
  useEffect(() => {
    const cookie = Cookies.get("token");
    if (!cookie) {
      navigate("/auth?redirect=" + window.location.pathname);
    }

    const user = useUser();

    if (user?.role !== "F") {
      navigate("/auth");
    }
  }, []);

  return (
    <div>
      <FacultyNavbar />
      <Outlet />
    </div>
  );
};

export default FacultyLayout;
