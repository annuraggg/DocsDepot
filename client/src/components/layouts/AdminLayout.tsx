import { Outlet } from "react-router";
import StudentNavbar from "../navbars/StudentNavbar";
import { useEffect } from "react";
import Cookies from "js-cookie";

const AdminLayout = () => {
  // check if cookie exists, if not redirect to login with redirect to current page
  useEffect(() => {
    const Cookie = Cookies.get("token");
    if (!Cookie) {
      window.location.href = "/auth?redirect=" + window.location.pathname;
    }
  }, []);

  return (
    <div>
      <StudentNavbar />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
