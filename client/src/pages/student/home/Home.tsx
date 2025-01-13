import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Tabs,
  Td,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Select,
  useToast,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
} from "@chakra-ui/react";
import Chart, { ChartItem } from "chart.js/auto";
import Loader from "../../../components/Loader";
import IntroModal from "./IntroModal";
import useUser from "@/config/user";
import { House } from "@shared-types/House";
import { Certificate } from "@shared-types/Certificate";
import { User } from "@shared-types/User";
import useAxios from "@/config/axios";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [houses, setHouses] = useState<House[]>();
  const [userHouse, setUserHouse] = useState<House>();
  const [certifications, setCertifications] = useState<Certificate[]>();
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [firstTime, setFirstTime] = useState(false);
  const localUser = useUser();

  const toast = useToast();

  function calculateTotalPoints(data: House) {
    if (!loading) {
      const currentDate = new Date();
      const currentYear = currentDate?.getFullYear(); // Get the current year

      let totalInternalPoints = 0;
      let totalExternalPoints = 0;
      let totalEventsPoints = 0;

      if (data && data?.points && data?.points[Number(currentYear)]) {
        const monthlyPoints = data?.points[Number(currentYear)];
        for (const month in monthlyPoints) {
          if (monthlyPoints?.hasOwnProperty(month)) {
            // Separate internal, external, and events points
            const { internal, external, events } = monthlyPoints[month];

            // Add them to their respective totals
            if (internal) {
              totalInternalPoints += internal;
            } else {
              totalInternalPoints += 0;
            }

            if (external) {
              totalExternalPoints += external;
            } else {
              totalExternalPoints += 0;
            }

            if (events) {
              totalEventsPoints += events;
            } else {
              totalEventsPoints += 0;
            }
          }
        }
      }

      return {
        totalInternal: totalInternalPoints,
        totalExternal: totalExternalPoints,
        totalEvents: totalEventsPoints,
      };
    }
  }

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event?.target?.value);
  };

  useEffect(() => {
    const axios = useAxios();

    axios
      .post("/student", {
        mid: localUser?.mid?.toString(),
      })
      .then(async (res) => {
        const data = await res.data.data
        setUser(data?.user);
        setHouses(data?.allHouses);
        setUserHouse(data?.userHouse);
        setCertifications(data?.certifications);
        setFirstTime(data?.user?.firstTime);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "Error fetching dashboard data",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  }, []);

  useEffect(() => {
    let hcl: Chart<"bar", any[], any>;

    if (!loading) {
      let house1, house2, house3, house4;
      if (selectedMonth === "all" && houses) {
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

        console.log(house1);
      } else if (houses) {
        const currentDate = new Date();
        let currentYear = currentDate?.getFullYear().toString();

        house1 = houses[0]?.points[Number(currentYear)]
          ? houses[0]?.points[Number(currentYear)][selectedMonth] ?? 0
          : 0;
        house2 = houses[1]?.points[Number(currentYear)]
          ? houses[1]?.points[Number(currentYear)][selectedMonth] ?? 0
          : 0;
        house3 = houses[2]?.points[Number(currentYear)]
          ? houses[2]?.points[Number(currentYear)][selectedMonth] ?? 0
          : 0;
        house4 = houses[3]?.points[Number(currentYear)]
          ? houses[3]?.points[Number(currentYear)][selectedMonth] ?? 0
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

      const houseLeaderboard = document?.getElementById(
        "houseLeaderboard"
      ) as HTMLCanvasElement;
      if (!houses) return;
      hcl = new Chart(houseLeaderboard, {
        type: "bar",
        data: {
          labels: [
            houses[0]?.name,
            houses[1]?.name,
            houses[2]?.name,
            houses[3]?.name,
          ],
          datasets: [
            {
              label: "Points",
              data: [house1, house2, house3, house4],
              backgroundColor: [
                houses[0]?.color,
                houses[1]?.color,
                houses[2]?.color,
                houses[3]?.color,
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          indexAxis: "y",
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
                display: false,
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
    function hexToRgba(hex: string, opacity: number) {
      // Remove the hash character (#) if present
      hex = hex.replace(/^#/, "");

      // Parse the hex color into RGB components
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;

      // Create and return the RGBA color
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    const currentDate = new Date();
    let currentYear = currentDate?.getFullYear().toString();

    let myHouseChart: Chart<"line", number[], string>;
    let myHouse;

    if (!loading && userHouse) {
      const jan =
        userHouse?.points[Number(currentYear)]?.january?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.january?.external ??
        0 + userHouse?.points[Number(currentYear)]?.january?.events ??
        0;
      const feb =
        userHouse?.points[Number(currentYear)]?.february?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.february?.external ??
        0 + userHouse?.points[Number(currentYear)]?.february?.events ??
        0;
      const mar =
        userHouse?.points[Number(currentYear)]?.march?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.march?.external ??
        0 + userHouse?.points[Number(currentYear)]?.march?.events ??
        0;
      const apr =
        userHouse?.points[Number(currentYear)]?.april?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.april?.external ??
        0 + userHouse?.points[Number(currentYear)]?.april?.events ??
        0;
      const may =
        userHouse?.points[Number(currentYear)]?.may?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.may?.external ??
        0 + userHouse?.points[Number(currentYear)]?.may?.events ??
        0;
      const jun =
        userHouse?.points[Number(currentYear)]?.june?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.june?.external ??
        0 + userHouse?.points[Number(currentYear)]?.june?.events ??
        0;
      const jul =
        userHouse?.points[Number(currentYear)]?.july?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.july?.external ??
        0 + userHouse?.points[Number(currentYear)]?.july?.events ??
        0;
      const aug =
        userHouse?.points[Number(currentYear)]?.august?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.august?.external ??
        0 + userHouse?.points[Number(currentYear)]?.august?.events ??
        0;
      const sep =
        userHouse?.points[Number(currentYear)]?.september?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.september?.external ??
        0 + userHouse?.points[Number(currentYear)]?.september?.events ??
        0;
      const oct =
        userHouse?.points[Number(currentYear)]?.october?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.october?.external ??
        0 + userHouse?.points[Number(currentYear)]?.october?.events ??
        0;
      const nov =
        userHouse?.points[Number(currentYear)]?.november?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.november?.external ??
        0 + userHouse?.points[Number(currentYear)]?.november?.events ??
        0;
      const dec =
        userHouse?.points[Number(currentYear)]?.december?.internal ??
        0 + userHouse?.points[Number(currentYear)]?.december?.external ??
        0 + userHouse?.points[Number(currentYear)]?.december?.events ??
        0;

      myHouse = document?.getElementById("myHouse") as HTMLCanvasElement;
      myHouseChart = new Chart(myHouse, {
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
              data: [
                jan,
                feb,
                mar,
                apr,
                may,
                jun,
                jul,
                aug,
                sep,
                oct,
                nov,
                dec,
              ],
              tension: 0.3,
              borderColor: houses?.[0]?.color ?? "#000000",
              fill: true, // Enable the fill area
              backgroundColor: hexToRgba(houses?.[1]?.color ?? "#000000", 0.25), // Fill color
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
                display: false, // Set the step size to 1 to show whole numbers
              },
              border: {
                display: false,
              },
            },
          },
        },
      });
    }

    return () => {
      if (myHouseChart) {
        myHouseChart?.destroy();
      }
    };
  }, [loading, userHouse]);

  useEffect(() => {
    let cont: ChartItem;
    const currentDate = new Date();
    let currentYear = currentDate?.getFullYear();
    currentYear = Number(currentYear);

    if (!loading) {
      const sepPoints = user?.house
        ? calculateTotalPoints(userHouse!)
        : undefined;
      const totalPoints =
        (sepPoints?.totalInternal ?? 0) +
        (sepPoints?.totalExternal ?? 0) +
        (sepPoints?.totalEvents ?? 0);

      const sephousePoints = calculateTotalPoints(userHouse!);
      const housePoints =
        (sephousePoints?.totalInternal ?? 0) +
        (sephousePoints?.totalExternal ?? 0) +
        (sephousePoints?.totalEvents ?? 0);

      cont = document?.getElementById("contribution") as HTMLCanvasElement;
      const contrChart = new Chart(cont, {
        type: "doughnut",
        data: {
          labels: [
            "Your House",
            "Internal Certification Points",
            "External Certification Points",
            "Events Certification Points",
          ],
          datasets: [
            {
              label: "Points",
              data: [
                housePoints - totalPoints,
                sepPoints?.totalInternal,
                sepPoints?.totalExternal,
                sepPoints?.totalEvents,
              ],
              backgroundColor: ["#3e95cd", "#ffb6c1", "#9370db", "#87ceeb"],
              borderColor: ["#3e95cd", "#ffb6c1", "#9370db", "#87ceeb"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          maintainAspectRatio: true,
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });

      return () => {
        if (contrChart) {
          contrChart?.destroy();
        }
      };
    }
  }, [loading, userHouse, user]);

  const months = [
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
  ];

  if (!loading) {
    return (
      <>
        <Box className="StudentDashboard">
          <Box className="left">
            <Box className="houseLeaderboard">
              <Flex justifyContent="space-between">
                <Box>
                  <Heading fontSize="17px">House Leaderboard</Heading>
                  <Text fontSize="12px">
                    See your house's rank in the points race.
                  </Text>
                </Box>
                {/* Step 4: Add onChange event to select */}
                <Select
                  width="150px"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                >
                  <option value="all">All</option>
                  <option value="january">January</option>
                  <option value="february">February</option>
                  <option value="march">March</option>
                  <option value="april">April</option>
                  <option value="may">May</option>
                  <option value="june">June</option>
                  <option value="july">July</option>
                  <option value="august">August</option>
                  <option value="september">September</option>
                  <option value="october">October</option>
                  <option value="november">November</option>
                  <option value="december">December</option>
                </Select>
              </Flex>
              <canvas id="houseLeaderboard"></canvas>
            </Box>
            <Box className="certifications">
              <Tabs>
                <TabList>
                  <Tab>Internal</Tab>
                  <Tab>Events</Tab>
                  <Tab>External</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Certification Details</Th>
                          <Th className="hideOnPhone">Points</Th>
                          <Th className="hideOnPhone">Submitted On</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {certifications

                          ?.filter(
                            (cert) => cert?.certificateType === "internal"
                          )
                          ?.slice(0, 3)
                          ?.map((cert) => (
                            <Tr key={cert?._id}>
                              <Td>
                                <Text>{cert?.certificateName}</Text>
                                <Text fontSize="12px">{cert?.issuingOrg}</Text>
                              </Td>
                              <Td className="hideOnPhone">{cert?.xp || "0"}</Td>
                              <Td className="hideOnPhone">
                                {" "}
                                {/* @ts-expect-error */}
                                {months[cert?.submittedMonth]}{" "}
                                {cert?.submittedYear}
                              </Td>
                              <Td>
                                {(cert?.status ?? "pending")
                                  .slice(0, 1)
                                  .toUpperCase() +
                                  (cert?.status ?? "pending").slice(1)}
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TabPanel>
                  <TabPanel>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Certification Details</Th>
                          <Th>Points</Th>
                          <Th>Submitted On</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {certifications

                          ?.filter((cert) => cert?.certificateType === "event")
                          ?.slice(0, 3)
                          ?.map((cert) => (
                            <Tr key={cert?._id}>
                              <Td>
                                <Text>{cert?.certificateName}</Text>
                                <Text fontSize="12px">{cert?.issuingOrg}</Text>
                              </Td>
                              <Td>{cert?.points || "0"}</Td>
                              <Td>
                                {" "}
                                {/* @ts-expect-error */}
                                {months[cert?.submittedMonth]}{" "}
                                {cert?.submittedYear}
                              </Td>
                              <Td>
                                {(cert?.status ?? "pending")
                                  .slice(0, 1)
                                  .toUpperCase() +
                                  (cert?.status ?? "pending").slice(1)}
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TabPanel>
                  <TabPanel>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Certification Details</Th>
                          <Th>Points</Th>
                          <Th>Submitted On</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {certifications

                          ?.filter(
                            (cert) => cert?.certificateType === "external"
                          )
                          ?.slice(0, 3)
                          ?.map((cert) => (
                            <Tr key={cert._id}>
                              <Td>
                                <Text>{cert?.certificateName}</Text>
                                <Text fontSize="12px">{cert?.issuingOrg}</Text>
                              </Td>
                              <Td>{cert?.points || "0"}</Td>
                              <Td>
                                {" "}
                                {/* @ts-expect-error */}
                                {months[cert?.submittedMonth]}{" "}
                                {cert?.submittedYear}
                              </Td>
                              <Td>
                                {(cert?.status ?? "pending")
                                  .slice(0, 1)
                                  .toUpperCase() +
                                  (cert?.status ?? "pending").slice(1)}
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Box>
          <Box className="right">
            <Box className="myHouse">
              <Flex justify="space-between">
                <Heading fontSize="17px">
                  {userHouse?.name} House Leader-board
                </Heading>
              </Flex>

              <canvas id="myHouse"></canvas>
            </Box>
            <Box className="pointAnalysis">
              <Heading fontSize="17px">Your Contribution</Heading>
              <Text fontSize="12px">
                Understand your role in your house's achievements and successes.
              </Text>
              <Flex align="center" justify="center" height="100%" gap="20px">
                <canvas id="contribution"></canvas>
                <Box className="pointAnalysis__stats" marginTop="-20px">
                  {/*} <Text fontSize="14px">
                    Internal Certification Points: <b> {hp?.totalInternal}</b>
                  </Text>
                  <Text fontSize="14px">
                    External Certification Points: <b>{hp?.totalExternal}</b>
                  </Text>
                  <Text fontSize="14px">
                    Events Certification Points: <b>{hp?.totalEvents}</b>
                          </Text>{*/}
                </Box>
              </Flex>
            </Box>
          </Box>
        </Box>

        {firstTime ? <IntroModal /> : null}
      </>
    );
  } else {
    return <Loader />;
  }
};

export default Home;
