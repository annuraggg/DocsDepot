import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Tabs,
  Flex,
  Table,
  createListCollection,
} from "@chakra-ui/react";
import Chart from "chart.js/auto";
import Loader from "@/components/Loader";
import IntroModal from "./IntroModal";
import useUser from "@/config/user";
import { toaster } from "@/components/ui/toaster";
import { House } from "@shared-types/House";
import { Certificate } from "@shared-types/Certificate";
import { User } from "@shared-types/User";
import { SelectContent, SelectItem, SelectRoot } from "@/components/ui/select";
import useAxios from "@/config/axios";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [houses, setHouses] = useState<House[]>();
  const [userHouse, setUserHouse] = useState<House>();
  const [certifications, setCertifications] = useState<Certificate[]>();
  const [selectedMonth, setSelectedMonth] = useState(["all"]);
  const [firstTime, setFirstTime] = useState(false);

  const localUser = useUser();

  function calculateTotalPoints(data: House) {
    if (!loading) {
      const currentDate = new Date();
      const currentYear = currentDate?.getFullYear(); // Get the current year

      let totalInternalPoints = 0;
      let totalExternalPoints = 0;
      let totalEventsPoints = 0;

      if (data && data?.points && data?.points[currentYear]) {
        const monthlyPoints = data?.points[currentYear];
        for (const month in monthlyPoints) {
          if (monthlyPoints?.hasOwnProperty(month)) {
            // Separate internal, external, and events points
            const { internal, external, events } = monthlyPoints[month] || {};

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

  useEffect(() => {
    const axios = useAxios();

    axios
      .post("/student", { mid: localUser?.mid })
      .then((res) => {
        console.log(res.data.data);
        setUser(res.data.data.user);
        setHouses(res.data.data.allHouses);
        setUserHouse(res.data.data.userHouse);
        setCertifications(res.data.data.certifications);
        setFirstTime(res.data.data.user.firstTime);
      })
      .catch((err) => {
        console.log(err);
        toaster.error({
          title: "Error",
          description: "Error fetching dashboard data",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let hcl: Chart<"bar", any[], any>;

    if (!houses) return;

    if (!loading) {
      let house1, house2, house3, house4;
      if (selectedMonth[0] === "all") {
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
      } else {
        const currentDate = new Date();
        const currentYear = currentDate?.getFullYear()?.toString();

        house1 = houses[0]?.points[Number(currentYear)]
          ? houses[0]?.points[Number(currentYear)][selectedMonth[0]] ?? 0
          : 0;
        house2 = houses[1]?.points[Number(currentYear)]
          ? houses[1]?.points[Number(currentYear)][selectedMonth[0]] ?? 0
          : 0;
        house3 = houses[2]?.points[Number(currentYear)]
          ? houses[2]?.points[Number(currentYear)][selectedMonth[0]] ?? 0
          : 0;
        house4 = houses[3]?.points[Number(currentYear)]
          ? houses[3]?.points[Number(currentYear)][selectedMonth[0]] ?? 0
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

      if (!houseLeaderboard) return;

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

    let myHouseChart: Chart<"line", any[], string>;
    let myHouse;

    if (!loading && userHouse) {
      const pointsForMonth = (month: string) => {
        const monthData = userHouse?.points[Number(currentYear)]?.[month];
        return (
          (monthData?.internal ?? 0) +
          (monthData?.external ?? 0) +
          (monthData?.events ?? 0)
        );
      };

      const jan = pointsForMonth("january");
      const feb = pointsForMonth("february");
      const mar = pointsForMonth("march");
      const apr = pointsForMonth("april");
      const may = pointsForMonth("may");
      const jun = pointsForMonth("june");
      const jul = pointsForMonth("july");
      const aug = pointsForMonth("august");
      const sep = pointsForMonth("september");
      const oct = pointsForMonth("october");
      const nov = pointsForMonth("november");
      const dec = pointsForMonth("december");

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
              borderColor: houses ? houses[0]?.color : "#3e95cd",
              fill: true, // Enable the fill area
              backgroundColor: hexToRgba(
                houses ? houses[1]?.color : "#3e95cd",
                0.25
              ), // Fill color
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
    let cont: HTMLCanvasElement;

    if (!loading) {
      const sepPoints = calculateTotalPoints(userHouse!);
      const totalPoints =
        sepPoints?.totalInternal ??
        0 + (sepPoints?.totalExternal || 0) + (sepPoints?.totalEvents || 0);

      const sephousePoints = calculateTotalPoints(userHouse!);
      const housePoints =
        (sephousePoints?.totalInternal || 0) +
        (sephousePoints?.totalExternal || 0) +
        (sephousePoints?.totalEvents || 0);

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
  }, [loading]);

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

  const monthsList = createListCollection({
    items: [
      { value: "january", label: "January" },
      { value: "february", label: "February" },
      { value: "march", label: "March" },
      { value: "april", label: "April" },
      { value: "may", label: "May" },
      { value: "june", label: "June" },
      { value: "july", label: "July" },
      { value: "august", label: "August" },
      { value: "september", label: "September" },
      { value: "october", label: "October" },
      { value: "november", label: "November" },
      { value: "december", label: "December" },
    ],
  });

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
                <SelectRoot
                  width="150px"
                  value={selectedMonth}
                  onValueChange={(e) => setSelectedMonth(e.value)}
                  collection={monthsList}
                >
                  <SelectContent>
                    {monthsList.items.map((month) => (
                      <SelectItem item={month} key={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Flex>
              <canvas id="houseLeaderboard"></canvas>
            </Box>
            <Box className="certifications">
              <Tabs.Root>
                <Tabs.List>
                  <Tabs.Trigger value="internal">Internal</Tabs.Trigger>
                  <Tabs.Trigger value="events">Events</Tabs.Trigger>
                  <Tabs.Trigger value="external">External</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="internal">
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>
                          Certification Details
                        </Table.ColumnHeader>
                        <Table.ColumnHeader className="hideOnPhone">
                          Points
                        </Table.ColumnHeader>
                        <Table.ColumnHeader className="hideOnPhone">
                          Submitted On
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {certifications

                        ?.filter((cert) => cert?.certificateType === "internal")
                        ?.slice(0, 3)
                        ?.map((cert) => (
                          <Table.Row key={cert?._id}>
                            <Table.Cell>
                              <Text>{cert?.certificateName}</Text>
                              <Text fontSize="12px">{cert?.issuingOrg}</Text>
                            </Table.Cell>
                            <Table.Cell className="hideOnPhone">
                              {cert?.xp || "0"}
                            </Table.Cell>
                            <Table.Cell className="hideOnPhone">
                              {" "}
                              {/* @ts-ignore */}
                              {months[cert?.submittedMonth]}{" "}
                              {cert?.submittedYear}
                            </Table.Cell>
                            <Table.Cell>
                              {cert?.status
                                ? cert.status.slice(0, 1).toUpperCase() +
                                  cert.status.slice(1)
                                : ""}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                    </Table.Body>
                  </Table.Root>
                </Tabs.Content>
                <Tabs.Content value="events">
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>
                          Certification Details
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Points</Table.ColumnHeader>
                        <Table.ColumnHeader>Submitted On</Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {certifications

                        ?.filter((cert) => cert?.certificateType === "event")
                        ?.slice(0, 3)
                        ?.map((cert) => (
                          <Table.Row key={cert?._id}>
                            <Table.Cell>
                              <Text>{cert?.certificateName}</Text>
                              <Text fontSize="12px">{cert?.issuingOrg}</Text>
                            </Table.Cell>
                            <Table.Cell>{cert?.points || "0"}</Table.Cell>
                            <Table.Cell>
                              {" "}
                              {/* @ts-ignore */}
                              {months[cert?.submittedMonth]}{" "}
                              {cert?.submittedYear}
                            </Table.Cell>
                            <Table.Cell>
                              {(cert?.status ?? "").slice(0, 1).toUpperCase() +
                                (cert?.status ?? "").slice(1)}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                    </Table.Body>
                  </Table.Root>
                </Tabs.Content>
                <Tabs.Content value="external">
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>
                          Certification Details
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Points</Table.ColumnHeader>
                        <Table.ColumnHeader>Submitted On</Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {certifications

                        ?.filter((cert) => cert?.certificateType === "external")
                        ?.slice(0, 3)
                        ?.map((cert) => (
                          <Table.Row key={cert._id}>
                            <Table.Cell>
                              <Text>{cert?.certificateName}</Text>
                              <Text fontSize="12px">{cert?.issuingOrg}</Text>
                            </Table.Cell>
                            <Table.Cell>{cert?.points || "0"}</Table.Cell>
                            <Table.Cell>
                              {" "}
                              {/* @ts-ignore */}
                              {months[cert?.submittedMonth]}{" "}
                              {cert?.submittedYear}
                            </Table.Cell>
                            <Table.Cell>
                              {cert?.status
                                ? cert.status.slice(0, 1).toUpperCase() +
                                  cert.status.slice(1)
                                : ""}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                    </Table.Body>
                  </Table.Root>
                </Tabs.Content>
              </Tabs.Root>
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
