import { Outlet } from "react-router";
import StudentNavbar from "../navbars/StudentNavbar";

const StudentLayout = () => {
  return (
    <div>
      <StudentNavbar />
      <Outlet />
    </div>
  );
};

export default StudentLayout;
