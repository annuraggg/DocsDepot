import { Outlet } from "react-router";
import AdminNavbar from "../navbars/AdminNavbar";
import { useEffect } from "react";
import Cookies from "js-cookie";
import useUser from "@/config/user";
import { useNavigate } from "react-router";

const AdminLayout = () => {
  const navigate = useNavigate();
  // check if cookie exists, if not redirect to login with redirect to current page
  useEffect(() => {
    const cookie = Cookies.get("token");
    if (!cookie) {
      navigate("/auth?redirect=" + window.location.pathname);
    }

    const user = useUser();

    if (user?.role !== "A") {
      navigate("/auth");
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
