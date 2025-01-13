import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PointTotals } from "@/types/dashboard";

interface Props {
  userPoints: PointTotals;
  housePoints: PointTotals;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const MotionBox = motion(Box);

export const ContributionChart = ({ userPoints, housePoints }: Props) => {
  const totalUserPoints = userPoints.totalInternal + userPoints.totalExternal + userPoints.totalEvents;
  const totalHousePoints = housePoints.totalInternal + housePoints.totalExternal + housePoints.totalEvents;

  const data: ChartData[] = [
    { 
      name: "House Points", 
      value: totalHousePoints - totalUserPoints,
      color: "#3e95cd"
    },
    { 
      name: "Internal Points", 
      value: userPoints.totalInternal,
      color: "#ffb6c1"
    },
    { 
      name: "External Points", 
      value: userPoints.totalExternal,
      color: "#9370db"
    },
    { 
      name: "Events Points", 
      value: userPoints.totalEvents,
      color: "#87ceeb"
    },
  ];

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      bg="white"
      p={6}
      borderRadius="xl"
      boxShadow="sm"
      height="100%"
    >
      <Heading fontSize="xl" mb={1}>Your Contribution</Heading>
      <Text fontSize="sm" color="gray.600" mb={4}>
        Understand your role in your house's achievements
      </Text>

      <Flex align="center" justify="space-between" height="calc(100% - 80px)">
        <Box width="60%" height="100%">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((item, index) => (
                  <Cell key={`cell-${index}`} fill={item.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Box width="35%">
          {data.map((item) => (
            <Flex key={item.name} align="center" mb={2}>
              <Box
                w={3}
                h={3}
                borderRadius="full"
                bg={item.color}
                mr={2}
              />
              <Text fontSize="sm">{item.name}: <b>{item.value}</b></Text>
            </Flex>
          ))}
        </Box>
      </Flex>
    </MotionBox>
  );
};