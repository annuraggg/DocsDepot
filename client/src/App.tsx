import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Maintainance from "./pages/maintainance-mode/Maintainance";
import FourZeroFour from "./pages/four-zero-four/FourZeroFour";
import Feedback from "./pages/feedback/Feedback";
import Auth from "./pages/auth/Auth";

import StudentLayout from "./components/layouts/StudentLayout";
import useAxios from "./config/axios";
import StudentHome from "./pages/student/home/Home";
import StudentCertificates from "./pages/student/certificates/Certificates";
import StudentProfile from "./pages/student/profile/Profile";
import Certificate from "./pages/certificate/Certificate";
import Events from "./pages/events/Events";
import Event from "./pages/events/event/Event";
import StudentSettings from "./pages/student/settings/Settings";
import Houses from "./pages/houses/Houses";
import House from "./pages/houses/house/House";

import AdminHome from "./pages/admin/home/Home.js";
import AdminStudents from "./pages/admin/student/Students";
import AdminStudentsImport from "./pages/admin/student/import/StudentImport";
import AdminFacultyImport from "./pages/admin/faculty/import/FacultyImport";
import AdminFaculty from "./pages/admin/faculty/Faculty";
import AdminSettings from "./pages/admin/settings/Settings";
import AdminLogs from "./pages/admin/logs/Logs";
import AdminStudentCertificates from "./pages/admin/student/certificates/Certificates";
import AdminFeedback from "./pages/admin/feedback/Feedback";
import AdminFacultyCertificates from "./pages/admin/faculty/certificates/Certificates";
import AdminLayout from "./components/layouts/AdminLayout.js";
import SelectiveLayout from "./components/layouts/SelectiveLayout.js";

function App() {
  const studentRoutes = [
    { path: "", element: <StudentHome /> },
    { path: "profile", element: <StudentProfile /> },
    { path: "certificates", element: <StudentCertificates /> },
    { path: "settings", element: <StudentSettings /> },
  ];

  const adminRoutes = [
    { path: "", element: <AdminHome /> },
    { path: "students", element: <AdminStudents /> },
    { path: "students/add", element: <AdminStudentsImport /> },
    { path: "faculty/add", element: <AdminFacultyImport /> },
    { path: "faculty", element: <AdminFaculty /> },
    { path: "settings", element: <AdminSettings /> },
    { path: "logs", element: <AdminLogs /> },
    { path: "certificates", element: <AdminStudentCertificates /> },
    { path: "feedback", element: <AdminFeedback /> },
    { path: "faculty/certificates", element: <AdminFacultyCertificates /> },
  ];

  const selectiveRoutes = [
    { path: "/certificates/:id", element: <Certificate /> },
    { path: "/events", element: <Events /> },
    { path: "/events/:id", element: <Event /> },
    { path: "/profile/:id", element: <StudentProfile /> },
    { path: "/houses", element: <Houses /> },
    { path: "/houses/:id", element: <House /> },
  ];

  const router = createBrowserRouter([
    { path: "*", element: <FourZeroFour /> },
    { path: "/feedback", element: <Feedback /> },
    { path: "/auth", element: <Auth /> },

    { path: "/", element: <SelectiveLayout />, children: selectiveRoutes },
    { path: "/student", element: <StudentLayout />, children: studentRoutes },
    { path: "/admin", element: <AdminLayout />, children: adminRoutes },
    // { path: "/profile/:id/generate/report", element: <Report /> },
    // { path: "/profile/faculty/:id", element },
  ]);

  const maintainanceModeRouter = createBrowserRouter([
    { path: "*", element: <Maintainance /> },
    { path: "/auth", element: <Auth /> },
    { path: "/admin", element: <AdminLayout />, children: adminRoutes },
  ]);

  const [maintainenaceMode, setMaintainenaceMode] = useState(false);

  useEffect(() => {
    const axios = useAxios();
    console.log("Checking maintainance mode");

    axios
      .get("/maintainance")
      .then((d) => {
        console.log("Maintainance mode is off");
        console.log(d);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 503) {
          setMaintainenaceMode(true);
          return;
        }
        console.log(err);
      });
  }, []);

  return (
    <RouterProvider
      router={maintainenaceMode ? maintainanceModeRouter : router}
    />
  );
}

export default App;
