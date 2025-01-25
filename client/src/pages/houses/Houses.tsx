import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useToast } from "@chakra-ui/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy, TrendingUp, History, Calendar, Award } from "lucide-react";
import useAxios from "@/config/axios";
import { House, Point } from "@shared-types/House";
import Loader from "@/components/Loader";

const Houses = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, _setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, _setCurrentYear] = useState<number>(new Date().getFullYear());
  const [prevMonth, _setPrevMonth] = useState<number>(new Date().getMonth());

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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
        <Loader />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200"
        >
          <p className="font-bold text-lg text-gray-800">{payload[0].payload.name}</p>
          <p className="text-gray-600 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            Points: {payload[0].value}
          </p>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-8">
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {houses.map((house) => (
            <motion.div
              key={house._id}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer transform transition-all duration-300"
              onClick={() => navigate(`/houses/${house._id}`)}
            >
              <div
                className="rounded-2xl p-6 shadow-xl relative overflow-hidden"
                style={{ 
                  backgroundColor: house.color,
                  backgroundImage: `linear-gradient(to bottom right, ${house.color}, ${house.color}CC)`
                }}
              >
                <div className="absolute top-0 right-0 opacity-20">
                  <Trophy className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{house.name}</h3>
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <p className="mt-4 text-2xl font-bold text-white drop-shadow-md">
                    {calculateTotalPoints(house).totalYearly} 
                    <span className="text-base ml-2">Points</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Monthly Leaderboard</h3>
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
                  <Bar dataKey="points" fill="#4F46E5" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-purple-100 p-3 rounded-full">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Previous Month</h3>
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
                  <Bar dataKey="points" fill="#9333EA" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Yearly Leaderboard</h3>
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
                  <Bar dataKey="points" fill="#10B981" radius={[10, 10, 0, 0]} />
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