import { Box, Flex, Text } from "@chakra-ui/react";
import Chart from "chart.js/auto";
import { useEffect, useRef } from "react";
import { House } from "@shared-types/House";

interface ChartsProps {
  userHouse?: House;
  houses?: House[];
  loading: boolean;
}

export const Charts: React.FC<ChartsProps> = ({
  userHouse,
  houses,
  loading,
}) => {
  const contributionChartRef = useRef<Chart | null>(null);
  const graphChartRef = useRef<Chart | null>(null);
  const contributionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const hexToRgba = (hex: string, opacity: number) => {
    hex = hex.replace(/^#/, "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const calculateTotalPoints = (data: House) => {
    let totalPoints = 0;
    if (data && data.points) {
      totalPoints = data.points.reduce((acc, point) => {
        if (typeof point.points === "number") {
          return acc + point.points;
        }
        return acc;
      }, 0);
    }
    return {
      totalInternal: totalPoints,
      totalExternal: 0,
      totalEvents: 0,
    };
  };

  useEffect(() => {
    return () => {
      if (contributionChartRef.current) {
        contributionChartRef.current.destroy();
      }
      if (graphChartRef.current) {
        graphChartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!loading && userHouse && contributionCanvasRef.current) {
      if (contributionChartRef.current) {
        contributionChartRef.current.destroy();
      }

      const sepPoints = calculateTotalPoints(userHouse);
      const totalPoints =
        sepPoints.totalInternal + sepPoints.totalExternal + sepPoints.totalEvents;

      const sephousePoints = calculateTotalPoints(userHouse);
      const housePoints =
        sephousePoints.totalInternal +
        sephousePoints.totalExternal +
        sephousePoints.totalEvents;

      const chartColors = ["#3e95cd", "#ffb6c1", "#9370db", "#87ceeb"];
      const chartLabels = [
        "Your House",
        "Internal Certification Points",
        "External Certification Points",
        "Events Certification Points",
      ];

      contributionChartRef.current = new Chart(contributionCanvasRef.current, {
        type: "doughnut",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Points",
              data: [
                housePoints - totalPoints,
                sepPoints.totalInternal,
                sepPoints.totalExternal,
                sepPoints.totalEvents,
              ],
              backgroundColor: chartColors,
              borderColor: chartColors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'left',
              labels: {
                padding: 16,
                usePointStyle: true,
                pointStyle: 'rectRounded'
              }
            }
          }
        },
      });
    }
  }, [loading, userHouse]);

  useEffect(() => {
    if (!loading && userHouse && userHouse.points && graphCanvasRef.current) {
      if (graphChartRef.current) {
        graphChartRef.current.destroy();
      }

      const currentYear = new Date().getFullYear().toString();
      const yearPoints = (userHouse.points[0]?.points as any)?.[currentYear] || {};

      const getMonthlyTotal = (month: string): number => {
        const monthData = yearPoints[month];
        if (!monthData) return 0;
        return (
          (monthData.internal ?? 0) +
          (monthData.external ?? 0) +
          (monthData.events ?? 0)
        );
      };

      const monthlyTotals = {
        jan: getMonthlyTotal("january"),
        feb: getMonthlyTotal("february"),
        mar: getMonthlyTotal("march"),
        apr: getMonthlyTotal("april"),
        may: getMonthlyTotal("may"),
        jun: getMonthlyTotal("june"),
        jul: getMonthlyTotal("july"),
        aug: getMonthlyTotal("august"),
        sep: getMonthlyTotal("september"),
        oct: getMonthlyTotal("october"),
        nov: getMonthlyTotal("november"),
        dec: getMonthlyTotal("december"),
      };

      graphChartRef.current = new Chart(graphCanvasRef.current, {
        type: "line",
        data: {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Points",
              data: Object.values(monthlyTotals),
              tension: 0.3,
              borderColor: houses?.[0]?.color || "#000000",
              fill: true,
              backgroundColor: hexToRgba(houses?.[1]?.color || "#000000", 0.25),
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: { color: "#f2f2f2", display: false },
            },
            y: {
              grid: { color: "#f2f2f2", display: false },
              ticks: {
                display: false,
              },
              border: {
                display: false,
              },
            },
          },
        },
      });
    }
  }, [loading, userHouse, houses]);

  return (
    <Box height="fit-content" className="space-y-3">
      <Flex width="65vw" gap="5" className="graphs">
        <Box className="bg-white rounded-xl shadow-lg p-6 w-[50%] h-[41.5vh]">
          <Text className="text-xl font-semibold mb-7">
            House Contribution
          </Text>
          <Flex
            align="center"
            justify="center"
            height="60%"
            gap="5"
            direction="column"
          >
            <canvas ref={contributionCanvasRef}></canvas>
          </Flex>
        </Box>

        <Box className="bg-white rounded-xl shadow-lg p-6 w-[50%] h-[41.5vh]">
          <Text className="text-xl font-semibold mb-8">
            Contribution Graph
          </Text>
          <Flex
            align="center"
            justify="center"
            height="70%"
            gap="5"
            direction="column"
          >
            <canvas ref={graphCanvasRef}></canvas>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};