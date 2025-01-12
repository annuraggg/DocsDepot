import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Maintainance from "./pages/maintainance-mode/Maintainance";
import FourZeroFour from "./pages/four-zero-four/FourZeroFour";
import Feedback from "./pages/feedback/Feedback";
import Auth from "./pages/auth/Auth";

import StudentLayout from "./components/layouts/StudentLayout";
import useAxios from "./config/axios";
import StudentHome from "./pages/student/home/Home";

function App() {
  const studentRoutes = [
    { path: "", element: <StudentHome /> },
    // { path: "/profile", element: <StudentProfile /> },
    // { path: "/certificates", element: <StudentCertificates /> },
    // { path: "/settings", element: <StudentSettings /> },
    // { path: "/houses", element: <StudentHouses /> },
    // { path: "/houses/:id", element: <StudentHouse /> },
    {
      path: "*",
      element: <div> Not Found or You do not have permission.</div>,
    },
  ];

  const router = createBrowserRouter([
    { path: "*", element: <FourZeroFour /> },
    { path: "/feedback", element: <Feedback /> },
    { path: "/auth", element: <Auth /> },
    { path: "/student", element: <StudentLayout />, children: studentRoutes },
  ]);

  const maintainanceModeRouter = createBrowserRouter([
    { path: "*", element: <Maintainance /> },
    { path: "/auth", element: <Auth /> },
  ]);

  const [maintainenaceMode, setMaintainenaceMode] = useState(false);

  useEffect(() => {
    const axios = useAxios();

    axios.post("/maintainance").catch((err) => {
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
