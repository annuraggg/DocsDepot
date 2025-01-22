import { Outlet } from "react-router";
import { useEffect } from "react";
import Cookies from "js-cookie";
import FacultyNavbar from "../navbars/FacultyNavbar";

const FacultyLayout = () => {
  // check if cookie exists, if not redirect to login with redirect to current page
  useEffect(() => {
    const Cookie = Cookies.get("token");
    if (!Cookie) {
      window.location.href = "/auth?redirect=" + window.location.pathname;
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
