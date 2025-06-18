import React from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@chakra-ui/react";
import { Doughnut } from "react-chartjs-2";

interface HouseStatsProps {
  totalPoints: number;
  internalPoints: number;
  externalPoints: number;
  eventPoints: number;
}

export const HouseStats: React.FC<HouseStatsProps> = ({
  totalPoints,
  internalPoints,
  externalPoints,
  eventPoints,
}) => {
  const data = {
    labels: ["Internal Points", "External Points", "Event Points"],
    datasets: [
      {
        data: [internalPoints, externalPoints, eventPoints],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
    },
  };

  return (
    <Card className="w-full shadow-lg">
      <CardBody>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="aspect-square"
        >
          <Doughnut data={data} options={options} />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4"
        >
          <p className="text-2xl font-bold">{totalPoints}</p>
          <p className="text-gray-500">Total Points</p>
        </motion.div>
      </CardBody>
    </Card>
  );
};
