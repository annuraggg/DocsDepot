import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  BookUser,
  TrophyIcon,
  CheckCircle2,
  Award,
  Building2,
  Calendar,
} from "lucide-react";
import useAxios from "@/config/axios";
import { Certificate as ICertificate } from "@shared-types/Certificate";
import { House as IHouse } from "@shared-types/House";
import { User as IUser } from "@shared-types/User";
import Loader from "@/components/Loader";

interface DashboardData {
  houses: IHouse[];
  user: IUser;
  certificates: ICertificate[];
}

const FacultyDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [activeTab, setActiveTab] = useState<
    "internal" | "events" | "external"
  >("internal");

  const axios = useAxios();
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("/dashboard/admin");
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateHousePoints = (house: IHouse) => {
    return house.points.reduce((total, point) => total + point.points, 0);
  };

  const getHouseChartData = () => {
    return (
      data?.houses.map((house) => ({
        name: house.name,
        points: calculateHousePoints(house),
        color: house.color || "#8884d8",
      })) || []
    );
  };

  const getMonthlyPerformanceData = () => {
    if (!data?.certificates) return [];

    const monthlyData = new Array(12).fill(0).map((_, index) => ({
      month: new Date(2024, index).toLocaleString("default", {
        month: "short",
      }),
      points: 0,
    }));

    data.certificates.forEach((cert) => {
      const monthIndex = new Date(cert.issueDate.year, 0).getMonth();
      monthlyData[monthIndex].points += cert.earnedXp;
    });

    return monthlyData;
  };

  const filterCertificatesByType = (
    type: "internal" | "events" | "external"
  ) => {
    return (
      data?.certificates.filter((cert) =>
        type === "events" ? cert.type === "event" : cert.type === type
      ) || []
    );
  };

  const getLevelProps = (level: string) => {
    switch (level) {
      case "beginner":
        return { className: "bg-emerald-100 text-emerald-800" };
      case "intermediate":
        return { className: "bg-orange-100 text-orange-800" };
      case "advanced":
        return { className: "bg-red-100 text-red-800" };
      default:
        return { className: "bg-gray-100 text-gray-800" };
    }
  };

  const getStatusProps = (status: string) => {
    switch (status) {
      case "approved":
        return { className: "bg-green-100 text-green-800" };
      case "pending":
        return { className: "bg-yellow-100 text-yellow-800" };
      case "rejected":
        return { className: "bg-red-100 text-red-800" };
      default:
        return { className: "bg-gray-100 text-gray-800" };
    }
  };

  const getFullForm = (permission: string) => {
    switch (permission) {
      case "UFC":
        return "Upload Certificates";
      case "RSP":
        return "Reset Student Passwords";
      case "AES":
        return "Add/Edit Student";
      case "SND":
        return "Send Notifications";
      case "MHI":
        return "Manage House Events";
      default:
        return permission;
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 space-y-4 md:space-y-6"
        >
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-lg md:text-xl font-semibold flex items-center">
                <TrophyIcon className="mr-2 w-5 h-5" /> House Points
                Distribution
              </h2>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-40 p-2 border rounded"
              >
                <option value="all">All Months</option>
                {Array.from({ length: 12 }, (_, i) =>
                  new Date(2024, i).toLocaleString("default", { month: "long" })
                ).map((month) => (
                  <option key={month} value={month.toLowerCase()}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            {getHouseChartData().length > 0 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getHouseChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="points" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No data available for house points.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex space-x-4 mb-4">
              {(["internal", "events", "external"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeTab === type
                      ? "bg-blue-100 text-blue-800"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {filterCertificatesByType(activeTab).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Certificate
                      </th>
                      <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        XP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterCertificatesByType(activeTab).map((cert, index) => (
                      <motion.tr
                        key={cert._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 transition-colors border-b"
                      >
                        <td className="p-2 md:p-4">
                          <div className="flex items-center space-x-2">
                            <Award className="text-green-500 w-4 h-4 md:w-5 md:h-5" />
                            <span className="text-xs md:text-sm font-medium text-gray-900">
                              {cert.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 md:p-4">
                          <div className="flex items-center space-x-2">
                            <Building2 className="text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                            <span className="text-xs md:text-sm text-gray-600">
                              {cert.issuingOrganization}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 md:p-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="text-blue-400 w-4 h-4 md:w-5 md:h-5" />
                            <span className="text-xs md:text-sm text-gray-600">
                              {`${cert.issueDate.month} ${cert.issueDate.year}`}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 md:p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              getLevelProps(cert.level).className
                            }`}
                          >
                            {cert.level.charAt(0).toUpperCase() +
                              cert.level.slice(1)}
                          </span>
                        </td>
                        <td className="p-2 md:p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              getStatusProps(cert.status).className
                            }`}
                          >
                            {cert.status.charAt(0).toUpperCase() +
                              cert.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-2 md:p-4 text-xs md:text-sm font-medium text-gray-900">
                          {cert.earnedXp}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No certificates available for this category.
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 md:space-y-6"
        >
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
              <BookUser className="mr-2 w-5 h-5" /> Monthly Performance (Your
              House)
            </h2>
            {getMonthlyPerformanceData().length > 0 ? (
              <div className="h-52 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getMonthlyPerformanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="points"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No performance data available for your house.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
              <CheckCircle2 className="mr-2 w-5 h-5" /> Your Permissions
            </h2>
            {data?.user?.permissions?.length ?? 0 > 0 ? (
              <div className="space-y-2">
                {data?.user.permissions.map((permission, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center text-xs md:text-sm text-gray-700"
                  >
                    <Award className="mr-2 text-blue-500 w-4 h-4" />
                    {getFullForm(permission)}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                You have no permissions assigned.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
