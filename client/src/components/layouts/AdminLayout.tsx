import { Outlet } from "react-router";
import AdminNavbar from "../navbars/AdminNavbar";
import { useEffect } from "react";
import Cookies from "js-cookie";
import useUser from "@/config/user";

const AdminLayout = () => {
  // check if cookie exists, if not redirect to login with redirect to current page
  useEffect(() => {
    const cookie = Cookies.get("token");
    if (!cookie) {
      window.location.href = "/auth?redirect=" + window.location.pathname;
    }

    const user = useUser();

    if (user?.role !== "A") {
      window.location.href = "/auth";
    }
  }, []);

  return (
    <div>
      <AdminNavbar />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
