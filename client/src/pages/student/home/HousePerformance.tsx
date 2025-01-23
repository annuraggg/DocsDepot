import { Box, Flex, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { House } from "@/types/dashboard";

interface Props {
  house: House;
  currentYear: number;
}

interface MonthData {
  name: string;
  points: number;
}

const MotionBox = motion(Box);

export const HousePerformance = ({ house, currentYear }: Props) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const data: MonthData[] = months.map((month) => {
    const monthData = house?.points[currentYear]?.[month.toLowerCase()];
    const total = (monthData?.internal || 0) + (monthData?.external || 0) + (monthData?.events || 0);
    return {
      name: month,
      points: total,
    };
  });

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      bg="white"
      p={6}
      borderRadius="xl"
      boxShadow="sm"
      height="100%"
    >
      <Flex justify="space-between" mb={4}>
        <Heading fontSize="xl">{house?.name} House Performance</Heading>
      </Flex>

      <Box height="300px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="points"
              stroke={house?.color}
              strokeWidth={2}
              dot={{ fill: house?.color }}
              fill={`${house?.color}20`}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </MotionBox>
  );
};