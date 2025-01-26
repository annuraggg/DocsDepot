import { Outlet } from "react-router";
import { useEffect } from "react";
import Cookies from "js-cookie";
import FacultyNavbar from "../navbars/FacultyNavbar";
import useUser from "@/config/user";

const FacultyLayout = () => {
  // check if cookie exists, if not redirect to login with redirect to current page
  useEffect(() => {
    const cookie = Cookies.get("token");
    if (!cookie) {
      window.location.href = "/auth?redirect=" + window.location.pathname;
    }

    const user = useUser();

    if (user?.role !== "F") {
      window.location.href = "/auth";
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
