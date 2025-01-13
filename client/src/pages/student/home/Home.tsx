import { useEffect, useState } from "react";
import { Box, Grid, useToast, VStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import useAxios from "@/config/axios";
import useUser from "@/config/user";
import { HouseLeaderboard } from "./HouseLeaderboard";
import { HousePerformance } from "./HousePerformance";
import { CertificationsTable } from "./CertificationsTable";
import { ContributionChart } from "./ContributionChart";
import { calculatePoints } from "@/utils/pointsCalculator";
import { DashboardData } from "@/types/dashboard";
import IntroModal from "./IntroModal";
import Loader from "@/components/Loader";
import { dashboardStyles } from "@/styles/Dashboard";

const MotionGrid = motion(Grid);
const MotionBox = motion(Box);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const localUser = useUser();
  const toast = useToast();
  const axios = useAxios();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.post("/student", {
        mid: localUser?.mid?.toString(),
      });
      setData(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <Loader />;

  const { user, allHouses, userHouse, certifications } = data;
  const housePoints = calculatePoints(allHouses, selectedMonth);
  const userPoints = calculatePoints([userHouse], selectedMonth, user._id);

  return (
    <AnimatePresence>
      <MotionGrid
        templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
        gap={8}
        p={8}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={dashboardStyles.container}
      >
        <VStack spacing={8}>
          <MotionBox
            variants={itemVariants}
            sx={dashboardStyles.glassCard}
            width="100%"
          >
            <HouseLeaderboard
              houses={allHouses}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              points={housePoints}
            />
          </MotionBox>

          <MotionBox
            variants={itemVariants}
            sx={dashboardStyles.card}
            width="100%"
          >
            <CertificationsTable certifications={certifications} />
          </MotionBox>
        </VStack>

        <VStack spacing={8}>
          <MotionBox
            variants={itemVariants}
            sx={dashboardStyles.glassCard}
            width="100%"
          >
            <HousePerformance
              house={userHouse}
              currentYear={new Date().getFullYear()}
            />
          </MotionBox>

          <MotionBox
            variants={itemVariants}
            sx={dashboardStyles.card}
            width="100%"
          >
            <ContributionChart
              userPoints={userPoints}
              housePoints={housePoints}
            />
          </MotionBox>
        </VStack>

        {user.firstTime && <IntroModal />}
      </MotionGrid>
    </AnimatePresence>
  );
};

export default Dashboard;