import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import { useColorMode } from "@chakra-ui/react";

// Pages
import Maintainance from "./pages/maintainance-mode/Maintainance";
import FourZeroFour from "./pages/four-zero-four/FourZeroFour";
import Feedback from "./pages/feedback/Feedback";
import Auth from "./pages/auth/Auth";
import ErrorPage from "./components/Error";
import StudentLayout from "./components/layouts/StudentLayout";
import useAxios from "./config/axios";
import StudentHome from "./pages/student/home/Home";
import StudentCertificates from "./pages/student/certificates/Certificates";
import StudentProfile from "./pages/profile/Profile";
import Certificate from "./pages/certificate/Certificate";
import Events from "./pages/events/Events";
import Event from "./pages/events/event/Event";
import StudentSettings from "./pages/student/settings/Settings";
import Houses from "./pages/houses/Houses";
import House from "./pages/houses/house/House";
import AdminHome from "./pages/admin/home/Home";
import AdminStudents from "./pages/admin/student/Students";
import AdminStudentsImport from "./pages/admin/student/import/StudentImport";
import AdminFacultyImport from "./pages/admin/faculty/import/FacultyImport";
import AdminFaculty from "./pages/admin/faculty/Faculty";
import AdminSettings from "./pages/admin/settings/Settings";
import AdminLogs from "./pages/admin/logs/Logs";
import AdminStudentCertificates from "./pages/admin/student/certificates/Certificates";
import AdminFeedback from "./pages/admin/feedback/Feedback";
import AdminFacultyCertificates from "./pages/admin/faculty/certificates/Certificates";
import AdminLayout from "./components/layouts/AdminLayout";
import SelectiveLayout from "./components/layouts/SelectiveLayout";
import FacultyHome from "./pages/faculty/home/Home";
import Certificates from "./pages/faculty/certificates/Certificates";
import Enrollments from "./pages/faculty/enrollments/Enrollments";
import FacultySettings from "./pages/faculty/settings/Settings";
import FacultyStudent from "./pages/faculty/student/Students";
import FacultyStudentAdd from "./pages/faculty/student/import/StudentImport";
import FacultyCertifications from "./pages/faculty/certifications/Certificates";
import FacultyLayout from "./components/layouts/FacultyLayout";
import About from "./pages/about/About";
import Lander from "./pages/lander/Lander";

function App() {
  const studentRoutes = [
    { path: "", element: <StudentHome /> },
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

  const facultyRoutes = [
    { path: "", element: <FacultyHome /> },
    { path: "certificates", element: <Certificates /> },
    { path: "enrollments", element: <Enrollments /> },
    { path: "settings", element: <FacultySettings /> },
    { path: "students", element: <FacultyStudent /> },
    { path: "students/add", element: <FacultyStudentAdd /> },
    { path: "certifications", element: <FacultyCertifications /> },
  ];

  const selectiveRoutes = [
    { path: "/certificates/:id", element: <Certificate /> },
    { path: "/events", element: <Events /> },
    { path: "/events/:id", element: <Event /> },
    { path: "/profile/:id", element: <StudentProfile /> },
    { path: "/houses", element: <Houses /> },
    { path: "/houses/:id", element: <House /> },
  ];

  const router = createBrowserRouter(
    [
      {
        path: "*",
        element: (
          <ErrorBoundary FallbackComponent={ErrorPage}>
            <FourZeroFour />
          </ErrorBoundary>
        ),
      },
      {
        path: "/feedback",
        element: (
          <ErrorBoundary FallbackComponent={ErrorPage}>
            <Feedback />
          </ErrorBoundary>
        ),
      },
      {
        path: "/auth",
        element: (
          <ErrorBoundary FallbackComponent={ErrorPage}>
            <Auth />
          </ErrorBoundary>
        ),
      },
      {
        path: "/",
        element: (
          <ErrorBoundary FallbackComponent={ErrorPage}>
            <Lander />
          </ErrorBoundary>
        ),
      },
      {
        path: "/",
        element: (
          <ErrorBoundary FallbackComponent={ErrorPage}>
            <SelectiveLayout />
          </ErrorBoundary>
        ),
        children: selectiveRoutes,
      },
      {
        path: "/student",
        element: (
          <ErrorBoundary FallbackComponent={ErrorPage}>
            <StudentLayout />
          </ErrorBoundary>
        ),
        children: studentRoutes,
      },
      {
        path: "/admin",
        element: (
          <ErrorBoundary FallbackComponent={ErrorPage}>
            <AdminLayout />
          </ErrorBoundary>
        ),
        children: adminRoutes,
      },
      {
        path: "/faculty",
        element: (
          <ErrorBoundary FallbackComponent={ErrorPage}>
            <FacultyLayout />
          </ErrorBoundary>
        ),
        children: facultyRoutes,
      },
      {
        path: "/about",
        element: (
          <ErrorBoundary FallbackComponent={ErrorPage}>
            <About />
          </ErrorBoundary>
        ),
      },
    ],
    { basename: import.meta.env.VITE_BASENAME || "/" }
  );

  const maintainanceModeRouter = createBrowserRouter(
    [
      { path: "*", element: <Maintainance /> },
      { path: "/auth", element: <Auth /> },
      { path: "/admin", element: <AdminLayout />, children: adminRoutes },
      { path: "/about", element: <About /> },
    ],
    { basename: import.meta.env.VITE_BASENAME || "/" }
  );

  const [maintainenaceMode, setMaintainenaceMode] = useState(false);

  useEffect(() => {
    const axios = useAxios();

    axios.get("/maintainance").catch((err) => {
      if (err.response?.status === 503) {
        setMaintainenaceMode(true);
        return;
      }
      console.error(err);
    });
  }, []);

  const { colorMode } = useColorMode();
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (colorMode === "dark") {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }, [colorMode]);

  return (
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <RouterProvider
        router={maintainenaceMode ? maintainanceModeRouter : router}
      />
    </ErrorBoundary>
  );
}

export default App;
