import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useToast } from "@chakra-ui/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy, TrendingUp, History, Calendar } from "lucide-react";
import useAxios from "@/config/axios";
import { House, Point } from "@shared-types/House";

const Houses = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // January = 1
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [prevMonth, setPrevMonth] = useState<number>(new Date().getMonth());

  const calculateTotalPoints = (data: House) => {
    const filterPointsByDate = (month?: number) =>
      data.points.filter((point: Point) => {
        const date = new Date(point.createdAt);
        return (
          date.getFullYear() === currentYear &&
          (month ? date.getMonth() + 1 === month : true)
        );
      });

    const calculatePoints = (filteredPoints: Point[]) =>
      filteredPoints.reduce((total, point) => total + point.points, 0);

    const totalMonthlyPoints = calculatePoints(filterPointsByDate(selectedMonth));
    const totalPrevMonthPoints = calculatePoints(filterPointsByDate(prevMonth));
    const totalYearlyPoints = calculatePoints(filterPointsByDate());

    return {
      totalMonthly: totalMonthlyPoints,
      totalPreviousMonth: totalPrevMonthPoints,
      totalYearly: totalYearlyPoints,
    };
  };

  const prepareChartData = (type: "monthly" | "previous" | "yearly") => {
    if (!houses.length) return [];

    return houses.map((house) => {
      const totals = calculateTotalPoints(house);
      let points = 0;

      if (type === "monthly") points = totals.totalMonthly;
      else if (type === "previous") points = totals.totalPreviousMonth;
      else if (type === "yearly") points = totals.totalYearly;

      return {
        name: house.name,
        points,
        color: house.color,
      };
    });
  };

  const axios = useAxios();

  useEffect(() => {
    axios
      .get("/houses")
      .then((res) => {
        setHouses(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-gray-600">Points: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* House Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {houses.map((house) => (
            <motion.div
              key={house._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
              onClick={() => navigate(`/houses/${house._id}`)}
            >
              <div
                className="rounded-xl p-6 shadow-lg"
                style={{ backgroundColor: house.color }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{house.name}</h3>
                  <Trophy className="w-6 h-6 text-white opacity-80" />
                </div>
                <p className="mt-2 text-white opacity-90">
                  {calculateTotalPoints(house).totalYearly} Points
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold">Monthly Leaderboard</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareChartData("monthly")}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 12 }}
                    height={60}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="points" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Previous Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full"
          >
            <div className="flex items-center gap-2 mb-6">
              <History className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-semibold">Previous Month</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareChartData("previous")}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 12 }}
                    height={60}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="points" fill="#9333EA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Yearly Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold">Yearly Leaderboard</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareChartData("yearly")}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 12 }}
                    height={60}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="points" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Houses;
