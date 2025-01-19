import { Outlet } from "react-router";
import AdminNavbar from "../navbars/AdminNavbar";
import { useEffect, useState } from "react";
import useUser from "@/config/user";
import GuestNavbar from "../navbars/GuestNavbar";
import StudentNavbar from "../navbars/StudentNavbar";
import FacultyNavbar from "../navbars/FacultyNavbar";

const SelectiveLayout = () => {
  const [role, setRole] = useState("G");
  const user = useUser();

  useEffect(() => {
    if (user) setRole(user.role);
  }, []);

  return (
    <div>
      {role === "A" && <AdminNavbar />}
      {role === "S" && <StudentNavbar />}
      {role === "F" && <FacultyNavbar />}
      {role === "G" && <GuestNavbar />}

      <Outlet />
    </div>
  );
};

export default SelectiveLayout;
