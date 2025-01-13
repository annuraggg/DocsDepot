import { Box, Flex, Heading, Select, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { House, PointTotals } from "@/types/dashboard";

interface Props {
  houses: House[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  points: PointTotals;
}

interface ChartDataEntry {
  name: string;
  points: number;
  color: string;
}

const MotionBox = motion(Box);

export const HouseLeaderboard = ({ houses, selectedMonth, onMonthChange, points }: Props) => {
  const data: ChartDataEntry[] = houses.map((house) => ({
    name: house.name,
    points: points.totalInternal + points.totalExternal + points.totalEvents,
    color: house.color,
  }));

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg="white"
      p={6}
      borderRadius="xl"
      boxShadow="sm"
      height="100%"
    >
      <Flex justifyContent="space-between" mb={4}>
        <Box>
          <Heading fontSize="xl" mb={1}>House Leaderboard</Heading>
          <Text fontSize="sm" color="gray.600">
            See your house's rank in the points race
          </Text>
        </Box>
        <Select
          width="150px"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          size="sm"
        >
          <option value="all">All Time</option>
          {["January", "February", "March", "April", "May", "June", 
            "July", "August", "September", "October", "November", "December"
          ].map((month) => (
            <option key={month} value={month.toLowerCase()}>{month}</option>
          ))}
        </Select>
      </Flex>
      
      <Box height="300px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar
              dataKey="points"
              fill={data[0]?.color || "#000"}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </MotionBox>
  );
};