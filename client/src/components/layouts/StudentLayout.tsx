import { Outlet } from "react-router";
import StudentNavbar from "../navbars/StudentNavbar";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { Token } from "@shared-types/Token";
import useUser from "@/config/user";
import { useNavigate } from "react-router";

const StudentLayout = () => {
  const navigate = useNavigate();
  // check if cookie exists, if not redirect to login with redirect to current page
  useEffect(() => {
    const cookie = Cookies.get("token") as Token | undefined;
    if (!cookie) {
      navigate("/auth?redirect=" + window.location.pathname);
    }

    const user = useUser();

    if (user?.role !== "S") {
      navigate("/auth");
    }
  }, []);

  return (
    <div className="max-h-screen">
      <StudentNavbar />
      <div className="h-[calc(100vh-4rem)]">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;
