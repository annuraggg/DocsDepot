import { useEffect, useState } from "react";
import { Box, Card, CardBody, Flex, Text, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import Chart from "chart.js/auto";
import Loader from "../../components/Loader";
import { House } from "@shared-types/House";
import useAxios from "@/config/axios";

const Houses = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [currentYear, setCurrentYear] = useState(0);
  const [prevMonth, setPrevMonth] = useState<string>("all");

  useEffect(() => {
    const monthNames = [
      "all",
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    setSelectedMonth(monthNames[currentMonth + 1]);
    setPrevMonth(monthNames[currentMonth]);

    const currentYear = currentDate.getFullYear();
    setCurrentYear(currentYear);
  }, []);

  function calculateTotalPoints(data: House) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear(); // Get the current year

    let totalInternalPoints = 0;
    let totalExternalPoints = 0;
    let totalEventsPoints = 0;

    if (data && data.points && data.points[currentYear]) {
      const monthlyPoints = data.points[currentYear];
      for (const month in monthlyPoints) {
        if (monthlyPoints.hasOwnProperty(month)) {
          // Separate internal, external, and events points
          const { internal, external, events } = monthlyPoints[month];

          // Add them to their respective totals
          if (internal) totalInternalPoints += internal;
          else totalInternalPoints += 0;
          if (external) totalExternalPoints += external;
          else totalExternalPoints += 0;
          if (events) totalEventsPoints += events;
          else totalEventsPoints += 0;
        }
      }
    }

    return {
      totalInternal: totalInternalPoints,
      totalExternal: totalExternalPoints,
      totalEvents: totalEventsPoints,
    };
  }

  useEffect(() => {
    let hcl: Chart<"bar", any[], string>;

    if (!loading) {
      let house1, house2, house3, house4;
      if (selectedMonth === "all") {
        house1 = calculateTotalPoints(houses[0]);
        house2 = calculateTotalPoints(houses[1]);
        house3 = calculateTotalPoints(houses[2]);
        house4 = calculateTotalPoints(houses[3]);

        house1 =
          house1?.totalInternal ??
          0 + house1?.totalExternal ??
          0 + house1?.totalEvents ??
          0;
        house2 =
          house2?.totalInternal ??
          0 + house2?.totalExternal ??
          0 + house2?.totalEvents ??
          0;
        house3 =
          house3?.totalInternal ??
          0 + house3?.totalExternal ??
          0 + house3?.totalEvents ??
          0;
        house4 =
          house4?.totalInternal ??
          0 + house4?.totalExternal ??
          0 + house4?.totalEvents ??
          0;
      } else {
        house1 = houses[0]?.points[2023]
          ? houses[0]?.points[2023][selectedMonth]
          : 0;
        house2 = houses[1]?.points[2023]
          ? houses[1]?.points[2023][selectedMonth]
          : 0;
        house3 = houses[2]?.points[2023]
          ? houses[2]?.points[2023][selectedMonth]
          : 0;
        house4 = houses[3]?.points[2023]
          ? houses[3]?.points[2023][selectedMonth]
          : 0;

        house1 =
          typeof house1 === "number"
            ? house1
            : (house1?.internal ?? 0) +
              (house1?.external ?? 0) +
              (house1?.events ?? 0);
        house2 =
          typeof house2 === "number"
            ? house2
            : (house2?.internal ?? 0) +
              (house2?.external ?? 0) +
              (house2?.events ?? 0);
        house3 =
          typeof house3 === "number"
            ? house3
            : (house3?.internal ?? 0) +
              (house3?.external ?? 0) +
              (house3?.events ?? 0);
        house4 =
          typeof house4 === "number"
            ? house4
            : (house4?.internal ?? 0) +
              (house4?.external ?? 0) +
              (house4?.events ?? 0);
      }

      const houseLeaderboard = document.getElementById(
        "monthly"
      ) as HTMLCanvasElement;
      if (!houseLeaderboard) return;
      hcl = new Chart(houseLeaderboard, {
        type: "bar",
        data: {
          labels: [
            houses[0].name,
            houses[1].name,
            houses[2].name,
            houses[3].name,
          ],
          datasets: [
            {
              label: "Points",
              data: [house1, house2, house3, house4],
              backgroundColor: [
                houses[0].color,
                houses[1].color,
                houses[2].color,
                houses[3].color,
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 0,
              borderRadius: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: "#f2f2f2",
                display: false,
              },
              ticks: {
                display: true,
              },
              border: {
                display: false,
              },
            },
            y: {
              grid: {
                color: "#f2f2f2",
                display: false,
              },
            },
          },
        },
      });
    }

    return () => {
      if (hcl) {
        hcl?.destroy();
      }
    };
  }, [loading, selectedMonth]);

  useEffect(() => {
    let hcl: Chart<"bar", any[], string>;

    if (!loading) {
      let house1, house2, house3, house4;
      if (selectedMonth === "all") {
        house1 = calculateTotalPoints(houses[0]);
        house2 = calculateTotalPoints(houses[1]);
        house3 = calculateTotalPoints(houses[2]);
        house4 = calculateTotalPoints(houses[3]);

        house1 =
          house1?.totalInternal + house1?.totalExternal + house1?.totalEvents;
        house2 =
          house2?.totalInternal + house2?.totalExternal + house2?.totalEvents;
        house3 =
          house3?.totalInternal + house3?.totalExternal + house3?.totalEvents;
        house4 =
          house4?.totalInternal + house4?.totalExternal + house4?.totalEvents;
      } else {
        house1 = houses[0].points[2023] ? houses[0].points[2023][prevMonth] : 0;
        house2 = houses[1].points[2023] ? houses[1].points[2023][prevMonth] : 0;
        house3 = houses[2].points[2023] ? houses[2].points[2023][prevMonth] : 0;
        house4 = houses[3].points[2023] ? houses[3].points[2023][prevMonth] : 0;

        house1 =
          typeof house1 === "number"
            ? house1
            : (house1?.internal ?? 0) +
              (house1?.external ?? 0) +
              (house1?.events ?? 0);
        house2 =
          typeof house2 === "number"
            ? house2
            : (house2?.internal ?? 0) +
              (house2?.external ?? 0) +
              (house2?.events ?? 0);
        house3 =
          typeof house3 === "number"
            ? house3
            : (house3?.internal ?? 0) +
              (house3?.external ?? 0) +
              (house3?.events ?? 0);
        house4 =
          typeof house4 === "number"
            ? house4
            : (house4?.internal ?? 0) +
              (house4?.external ?? 0) +
              (house4?.events ?? 0);
      }

      const houseLeaderboard = document?.getElementById(
        "prev"
      ) as HTMLCanvasElement;
      if (!houseLeaderboard) return;
      hcl = new Chart(houseLeaderboard, {
        type: "bar",
        data: {
          labels: [
            houses[0].name,
            houses[1].name,
            houses[2].name,
            houses[3].name,
          ],
          datasets: [
            {
              label: "Points",
              data: [house1, house2, house3, house4],
              backgroundColor: [
                houses[0].color,
                houses[1].color,
                houses[2].color,
                houses[3].color,
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 0,
              borderRadius: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: "#f2f2f2",
                display: false,
              },
              ticks: {
                display: true,
              },
              border: {
                display: false,
              },
            },
            y: {
              grid: {
                color: "#f2f2f2",
                display: false,
              },
            },
          },
        },
      });
    }

    return () => {
      if (hcl) {
        hcl.destroy();
      }
    };
  }, [loading, selectedMonth]);

  useEffect(() => {
    let hcl: Chart<"bar", number[], string>;

    if (!loading) {
      let house1, house2, house3, house4;

      house1 = calculateTotalPoints(houses[0]);
      house2 = calculateTotalPoints(houses[1]);
      house3 = calculateTotalPoints(houses[2]);
      house4 = calculateTotalPoints(houses[3]);

      house1 =
        (house1?.totalInternal ?? 0) +
        (house1?.totalExternal ?? 0) +
        (house1?.totalEvents ?? 0);
      house2 =
        (house2?.totalInternal ?? 0) +
        (house2?.totalExternal ?? 0) +
        (house2?.totalEvents ?? 0);
      house3 =
        (house3?.totalInternal ?? 0) +
        (house3?.totalExternal ?? 0) +
        (house3?.totalEvents ?? 0);
      house4 =
        (house4?.totalInternal ?? 0) +
        (house4?.totalExternal ?? 0) +
        (house4?.totalEvents ?? 0);

      const houseLeaderboard = document.getElementById(
        "yearly"
      ) as HTMLCanvasElement;
      hcl = new Chart(houseLeaderboard, {
        type: "bar",
        data: {
          labels: [
            houses[0].name,
            houses[1].name,
            houses[2].name,
            houses[3].name,
          ],
          datasets: [
            {
              label: "Points",
              data: [house1, house2, house3, house4],
              backgroundColor: [
                houses[0].color,
                houses[1].color,
                houses[2].color,
                houses[3].color,
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 0,
              borderRadius: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,

          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: "#f2f2f2",
                display: false,
              },
              ticks: {
                display: true,
              },
              border: {
                display: false,
              },
            },
            y: {
              grid: {
                color: "#f2f2f2",
                display: false,
              },
            },
          },
        },
      });
    }

    return () => {
      if (hcl) {
        hcl.destroy();
      }
    };
  }, [loading, currentYear]);

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
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (!loading) {
    return (
      <>
        <Box className="houses">
          <Flex className="graph-wrapper" gap="20px" wrap="wrap">
            {houses.map((house) => (
              <Card
                key={house._id}
                className="house-card"
                bg={house.color}
                cursor="pointer"
                onClick={() => {
                  navigate(`/houses/${house._id}`);
                }}
              >
                <CardBody>
                  <Text textAlign="center">{house.name}</Text>
                </CardBody>
              </Card>
            ))}
          </Flex>
          <Box className="graph-wrapper">
            <Flex gap="20px" justifyContent="space-between" wrap="wrap">
              <Box p="20px" width="32%" className="graphs" height="65vh">
                <Text fontSize="25px" mb="50px">
                  Leaderboard - Monthly
                </Text>
                <Box height="80%">
                  <canvas id="monthly" height="200px"></canvas>
                </Box>
              </Box>

              <Box p="20px" width="32%" className="graphs" height="65vh">
                <Text
                  fontSize="25px"
                  mb="50px"
                  alignSelf="flex-end"
                  textAlign="center"
                  width="100%"
                >
                  Leaderboard - Previous Month
                </Text>
                <Box height="80%">
                  {" "}
                  <canvas id="prev"></canvas>
                </Box>
              </Box>

              <Box p="20px" width="32%" className="graphs" height="65vh">
                <Text
                  fontSize="25px"
                  mb="50px"
                  alignSelf="flex-start"
                  textAlign="start"
                  width="100%"
                >
                  Leaderboard - Yearly
                </Text>
                <Box height="80%">
                  {" "}
                  <canvas id="yearly"></canvas>
                </Box>
              </Box>
            </Flex>
          </Box>
        </Box>
      </>
    );
  } else {
    return <Loader />;
  }
};

export default Houses;
