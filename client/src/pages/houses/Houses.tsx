import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useToast } from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trophy, TrendingUp, History, Calendar, Award } from "lucide-react";
import useAxios from "@/config/axios";
import { House, Point } from "@shared-types/House";
import Loader from "@/components/Loader";

const Houses = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, _setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [currentYear, _setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
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

    const totalMonthlyPoints = calculatePoints(
      filterPointsByDate(selectedMonth)
    );
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
    return <Loader />;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200"
        >
          <p className="font-bold text-lg text-gray-800">
            {payload[0].payload.name}
          </p>
          <p className="text-gray-600 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            Points: {payload[0].value}
          </p>
        </motion.div>
      );
    }
    return null;
  };

  const NoDataMessage = () => (
    <div className="flex items-center justify-center h-full text-gray-500">
      No data available
    </div>
  );

  const renderChart = (type: "monthly" | "previous" | "yearly") => {
    const chartData = prepareChartData(type);
    const dataExists = chartData.some((item) => item.points > 0);

    const barProps = {
      monthly: {
        fill: "#4F46E5",
        icon: Calendar,
        title: "Monthly Leaderboard",
      },
      previous: { fill: "#9333EA", icon: History, title: "Previous Month" },
      yearly: {
        fill: "#10B981",
        icon: TrendingUp,
        title: "Yearly Leaderboard",
      },
    }[type];

    return (
      <motion.div
        initial={{
          opacity: 0,
          x: type === "monthly" ? -20 : type === "yearly" ? 20 : 0,
        }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full"
      >
        <div className="flex items-center gap-2 mb-6">
          <barProps.icon className="w-6 h-6" style={{ color: barProps.fill }} />
          <h3 className="text-xl font-semibold">{barProps.title}</h3>
        </div>
        <div className="h-[300px] w-full">
          {dataExists ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
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
                <Bar
                  dataKey="points"
                  fill={barProps.fill}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-8">
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* House Cards */}
        {houses.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            No houses found. Create a house to start tracking points.
          </div>
        ) : (
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
                  style={{ backgroundColor: house.color || "#4F46E5" }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      {house.name || "Untitled House"}
                    </h3>
                    <Trophy className="w-6 h-6 text-white opacity-80" />
                  </div>
                  <p className="mt-2 text-white opacity-90">
                    {calculateTotalPoints(house).totalYearly} Points
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderChart("monthly")}
          {renderChart("previous")}
          {renderChart("yearly")}
        </div>
      </motion.div>
    </div>
  );
};

export default Houses;
