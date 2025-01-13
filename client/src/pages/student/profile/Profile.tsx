import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Flex,
  Text,
  InputGroup,
  Input,
  Button,
  Heading,
  Link,
  Table,
  Thead,
  Tr,
  Td,
  useToast,
  Tbody,
  InputLeftAddon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";

import Chart from "chart.js/auto";
import AvatarEditor from "react-avatar-editor";
import { useNavigate } from "react-router";
import { House } from "@shared-types/House";
import { Certificate } from "@shared-types/Certificate";
import { User } from "@shared-types/User";
import Loader from "@/components/Loader";
import useAxios from "@/config/axios";

const Profile = () => {
  const [privilege, setPrivilege] = useState(false);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [update, setUpdate] = useState(false);

  const navigator = useNavigate();

  const newImageRef = React.useRef<AvatarEditor>(null);

  const toast = useToast();

  const [user, setUser] = useState<User>();
  const [houses, setHouses] = useState<House[]>();
  const [userHouse, setUserHouse] = useState<House>();
  const [certifications, setCertifications] = useState<Certificate[]>();
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [mid, setMid] = useState("");
  const [newImage, setNewImage] = useState<File>();
  const [exportPrivilege, setExportPrivilege] = useState(false);

  const [btnLoading, setBtnLoading] = useState(false);

  const axios = useAxios();

  useEffect(() => {
    const token = Cookies.get("token");
    let jwt;
    try {
      if (token) {
        if (user) {
          jwt = user;
          if (jwt?.mid === user?.mid) {
            setPrivilege(true);
            setExportPrivilege(true);
            setMid(jwt?.mid);
            console.log(jwt);
          } else {
            if (jwt?.role === "A" || jwt?.role === "F") {
              setExportPrivilege(true);
            } else {
              setExportPrivilege(false);
            }
            setPrivilege(false);
          }
        }
      }
    } catch (error) {
      setPrivilege(false);
    }
  }, [loading, user]);

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
          const {
            internal = 0,
            external = 0,
            events = 0,
          } = monthlyPoints[month];

          // Add them to their respective totals
          totalInternalPoints += internal;
          totalExternalPoints += external;
          totalEventsPoints += events;
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
    let id = window.location.href.split("/").slice(4)[0];
    if (!id) {
      try {
        id = user?.mid || "";
      } catch {
        console.error("Error");
        toast({
          title: "Error",
          description: "Error fetching profile data",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
        return;
      }
    }

    axios
      .get("/auth/profile")
      .then((res) => {
        interface ResponseType {
          user: User;
          allHouses: House[];
          certifications: Certificate[];
        }

        const data: ResponseType = res.data.data;

        if (!data.user || !data.allHouses || !data.certifications) return;

        setHouses(data.allHouses);
        const userH = data.allHouses.find(
          (house: House) => house._id === data?.user?.house?.id
        );
        setUserHouse(userH);
        setUser(data.user);
        setCertifications(data.certifications);
        setLoading(false);
        setEmail(data.user.email);
        setLinkedin(data.user.linkedin);
        setGithub(data.user.github);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Error fetching dashboard data",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  }, [update]);

  useEffect(() => {
    if (!loading) {
      const sepPoints = calculateTotalPoints(userHouse!);
      const totalPoints =
        sepPoints.totalInternal +
        sepPoints.totalExternal +
        sepPoints.totalEvents;

      const sephousePoints = calculateTotalPoints(userHouse!);
      const housePoints =
        sephousePoints.totalInternal +
        sephousePoints.totalExternal +
        sephousePoints.totalEvents;

      const canvas = document.getElementById(
        "contribution"
      ) as HTMLCanvasElement;
      if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        return;
      }
      const contrChart = new Chart(canvas, {
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
                sepPoints.totalInternal,
                sepPoints.totalExternal,
                sepPoints.totalEvents,
              ],
              backgroundColor: ["#3e95cd", "#ffb6c1", "#9370db", "#87ceeb"],
              borderColor: ["#3e95cd", "#ffb6c1", "#9370db", "#87ceeb"],
              borderWidth: 1,
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
        },
      });

      return () => {
        if (contrChart) {
          contrChart.destroy();
        }
      };
    }
  }, [loading, userHouse, user]);

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
    let currentYear = currentDate.getFullYear().toString();

    let myHouseChart: Chart<"line", any[], string>;
    let myHouse;

    if (!loading && userHouse && userHouse.points) {
      const jan =
        (userHouse?.points[Number(currentYear)]?.["january"]?.internal ?? 0) +
        (userHouse?.points[Number(currentYear)]?.["january"]?.external ?? 0) +
        (userHouse?.points[Number(currentYear)]?.["january"]?.events ?? 0);
      const feb =
        (userHouse?.points[Number(currentYear)]?.["february"]?.internal ?? 0) +
        (userHouse?.points[Number(currentYear)]?.["february"]?.external ?? 0) +
        (userHouse?.points[Number(currentYear)]?.["february"]?.events ?? 0);
      const mar =
        (userHouse?.points[Number(currentYear)]?.["march"]?.internal ?? 0) +
        (userHouse?.points[Number(currentYear)]?.["march"]?.external ?? 0) +
        (userHouse?.points[Number(currentYear)]?.["march"]?.events ?? 0);
      const apr =
        (userHouse.points[Number(currentYear)]?.["april"]?.internal ?? 0) +
        (userHouse.points[Number(currentYear)]?.["april"]?.external ?? 0) +
        (userHouse.points[Number(currentYear)]?.["april"]?.events ?? 0);
      const may =
        (userHouse.points[Number(currentYear)]?.["may"]?.internal ?? 0) +
        (userHouse.points[Number(currentYear)]?.["may"]?.external ?? 0) +
        (userHouse.points[Number(currentYear)]?.["may"]?.events ?? 0);
      const jun =
        (userHouse.points[Number(currentYear)]?.["june"]?.internal ?? 0) +
        (userHouse.points[Number(currentYear)]?.["june"]?.external ?? 0) +
        (userHouse.points[Number(currentYear)]?.["june"]?.events ?? 0);
      const jul =
        (userHouse.points[Number(currentYear)]?.["july"]?.internal ?? 0) +
        (userHouse.points[Number(currentYear)]?.["july"]?.external ?? 0) +
        (userHouse.points[Number(currentYear)]?.["july"]?.events ?? 0);
      const aug =
        (userHouse.points[Number(currentYear)]?.["august"]?.internal ?? 0) +
        (userHouse.points[Number(currentYear)]?.["august"]?.external ?? 0) +
        (userHouse.points[Number(currentYear)]?.["august"]?.events ?? 0);
      const sep =
        (userHouse.points[Number(currentYear)]?.["september"]?.internal ?? 0) +
        (userHouse.points[Number(currentYear)]?.["september"]?.external ?? 0) +
        (userHouse.points[Number(currentYear)]?.["september"]?.events ?? 0);
      const oct =
        (userHouse.points[Number(currentYear)]?.["october"]?.internal ?? 0) +
        (userHouse.points[Number(currentYear)]?.["october"]?.external ?? 0) +
        (userHouse.points[Number(currentYear)]?.["october"]?.events ?? 0);
      const nov =
        (userHouse.points[Number(currentYear)]?.["november"]?.internal ?? 0) +
        (userHouse.points[Number(currentYear)]?.["november"]?.external ?? 0) +
        (userHouse.points[Number(currentYear)]?.["november"]?.events ?? 0);
      const dec =
        (userHouse.points[Number(currentYear)]?.["december"]?.internal ?? 0) +
        (userHouse.points[Number(currentYear)]?.["december"]?.external ?? 0) +
        (userHouse.points[Number(currentYear)]?.["december"]?.events ?? 0);

      myHouse = document.getElementById("graph") as HTMLCanvasElement;
      if (!myHouse || !(myHouse instanceof HTMLCanvasElement)) {
        return;
      }
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

    return () => {
      if (myHouseChart) {
        myHouseChart.destroy();
      }
    };
  }, [loading]);

  const changeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const validateEmail = (email: string) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    if (e.key === "Enter") {
      if (!validateEmail(email)) {
        toast({
          title: "Invalid Email",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      axios
        .post("/auth/profile", { email, linkedin, github })
        .then((res) => {
          if (res.status === 200) {
            toast({
              title: "Email Updated Successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            (e.target as HTMLInputElement).blur();
          } else {
            toast({
              title: "Error",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toast({
            title: "Error",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };

  const changeLinkedin = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    if ("target" in e && e.target instanceof HTMLInputElement) {
      setLinkedin(e.target.value);
    }

    const isLinkedInURL = (url: string) => {
      const linkedInPattern =
        /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+$/i;
      return linkedInPattern.test(url);
    };

    if ("key" in e && e.key === "Enter") {
      if (
        "target" in e &&
        e.target instanceof HTMLInputElement &&
        !isLinkedInURL(e.target.value)
      ) {
        toast({
          title: "Invalid Linkedin URL",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
      } catch (_) {
        console.log(_);
        toast({
          title: "Invalid Github URL",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      axios
        .post("/auth/profile", { email, linkedin, github })
        .then((res) => {
          if (res.status === 200) {
            toast({
              title: "Linkedin Updated Successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            (e.target as HTMLInputElement).blur();
          } else {
            toast({
              title: "Error",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toast({
            title: "Error",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };

  const changeGithub = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    if ("target" in e && e.target instanceof HTMLInputElement) {
      setGithub(e.target.value);
    }

    const isGitHubURL = (url: string) => {
      const githubPattern =
        /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+$/i;
      return githubPattern.test(url);
    };

    if ("key" in e && e.key === "Enter") {
      if (!isGitHubURL((e.target as HTMLInputElement).value)) {
        toast({
          title: "Invalid URL",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      axios
        .post("/auth/profile", { email, linkedin, github })
        .then((res) => {
          if (res.status === 200) {
            toast({
              title: "Github Updated Successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            (e.target as HTMLInputElement).blur();
          } else {
            toast({
              title: "Error",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toast({
            title: "Error",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };

  const selectImage = () => {
    const fileInput = document.getElementById("file");
    if (fileInput) {
      fileInput.click();
    }
  };

  const openInAvatarEditor = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const image = e.target.files[0];

    setNewImage(image);
    onOpen();
  };

  const uploadImage = async () => {
    setBtnLoading(true);
    if (!newImageRef.current) {
      toast({
        title: "Error",
        description: "Image editor not initialized",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setBtnLoading(false);
      return;
    }
    const image = await newImageRef.current
      .getImageScaledToCanvas()
      .toDataURL("image/png");

    axios
      .post(`auth/profile/picture`, { image })
      .then((res) => {
        setBtnLoading(false);
        if (res.status === 200) {
          toast({
            title: "Profile Picture Updated Successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onClose();
          setUpdate(!update);
          window.location.reload();
        } else {
          toast({
            title: "Error",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch((err) => {
        setBtnLoading(false);
        console.error(err);
        toast({
          title: "Error",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const closeModal = () => {
    onClose();
    setNewImage(undefined);
  };

  const generateReport = () => {
    navigator(`/profile/${mid}/generate/report`);
  };

  if (!loading) {
    return (
      <>
        <Flex gap="20px" className="StudentProfile" id="sp">
          <Box width="100%">
            <Flex
              p="20px"
              direction="column"
              gap="20px"
              align="center"
              boxShadow="0px 0px 10px 0px rgba(185, 100, 245, 0.1);"
              borderRadius="15px"
              width="100%"
            >
              <Box className="pfp">
                <Avatar
                  size="2xl"
                  src={user?.profilePicture}
                  className={privilege ? "original" : ""}
                />
                {privilege ? (
                  <Flex
                    onClick={selectImage}
                    align="center"
                    justify="center"
                    cursor="pointer"
                    width="100%"
                    height="100%"
                    borderRadius="50%"
                    className={privilege ? "overlay" : ""}
                    bg="black"
                  >
                    <i
                      className="fa-solid fa-pen"
                      style={{ fontSize: "20px", color: "white" }}
                    ></i>
                  </Flex>
                ) : null}
              </Box>
              <Input
                type="file"
                id="file"
             
                accept="image/*"
                onChange={openInAvatarEditor}
              />

              {exportPrivilege ? (
                <>
                  <Flex gap="5px">
                    <Text>
                      {user?.fname} {user?.lname}
                    </Text>
                    -<Text>{user?.mid}</Text>
                  </Flex>
                  <Button
                    opacity="1"
                    _hover={{
                      scale: "1.1",
                      bg: "#38A169",
                      opacity: 1,
                      color: "white",
                    }}
                    onClick={generateReport}
                  >
                    Generate Report
                  </Button>
                </>
              ) : (
                <>
                  {" "}
                  <Text>
                    {user?.fname} {user?.lname}
                  </Text>
                  <Text>{user?.mid}</Text>
                </>
              )}

              <Flex gap="20px">
                <Box>
                  <Flex direction="column" align="center" justify="center">
                    <Text>{user?.certificates?.internal ?? 0}</Text>
                    <Text fontSize="13px">Internal Certificates</Text>
                  </Flex>
                </Box>

                <Box>
                  <Flex direction="column" align="center" justify="center">
                    <Text>{user?.certificates?.external ?? 0}</Text>
                    <Text fontSize="13px">External Certificates</Text>
                  </Flex>
                </Box>
              </Flex>

              <Box>
                <Flex direction="column" align="center" justify="center">
                  <Text>{user?.certificates?.event ?? 0}</Text>
                  <Text fontSize="13px">Events Certificates</Text>
                </Flex>
              </Box>
            </Flex>

            {privilege ? (
              <Flex
                direction="column"
                gap="15px"
                mt="20px"
                boxShadow="0px 0px 10px 0px rgba(185, 100, 245, 0.1);"
                borderRadius="15px"
                p="20px"
                height="29.6vh"
              >
                <InputGroup>
                  <InputLeftAddon>
                    <i className="fa-solid fa-envelopes"></i>
                  </InputLeftAddon>
                  <Input
                    gap="10px"
                    type="email"
                    border="1px solid lightgray"
                    padding="8px"
                    onChange={changeEmail}
                    onKeyUp={handleEmailKeyPress}
                    defaultValue={user?.email}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  />
                </InputGroup>

                <InputGroup>
                  <InputLeftAddon>
                    <i className="fa-brands fa-linkedin"></i>
                  </InputLeftAddon>
                  <Input
                    gap="10px"
                    type="url"
                    border="1px solid lightgray"
                    padding="8px"
                    borderRadius="5px"
                    defaultValue={user?.linkedin}
                    onKeyUp={changeLinkedin}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  />
                </InputGroup>

                <InputGroup>
                  <InputLeftAddon>
                    <i className="fa-brands fa-github"></i>
                  </InputLeftAddon>
                  <Input
                    gap="10px"
                    type="url"
                    border="1px solid lightgray"
                    padding="8px"
                    borderRadius="5px"
                    defaultValue={user?.github}
                    onKeyUp={changeGithub}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  />
                </InputGroup>
              </Flex>
            ) : (
              <Flex
                direction="column"
                gap="15px"
                mt="20px"
                boxShadow="0px 0px 10px 0px rgba(185, 100, 245, 0.1);"
                borderRadius="15px"
                p="20px"
                height="29.6vh"
              >
                <Flex
                  gap="10px"
                  direction="row"
                  align="center"
                  border="1px solid lightgray"
                  padding="8px"
                  borderRadius="5px"
                >
                  <i className="fa-solid fa-envelopes"></i>
                  <Link
                    href={"mailto:" + user?.email}
                    target="_blank"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {user?.email}
                  </Link>
                </Flex>

                <Flex
                  gap="10px"
                  direction="row"
                  align="center"
                  border="1px solid lightgray"
                  padding="8px"
                  borderRadius="5px"
                >
                  <i className="fa-brands fa-linkedin"></i>
                  <Link
                    href={user?.linkedin}
                    target="_blank"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    width="300px"
                  >
                    {user?.linkedin}
                  </Link>
                </Flex>
                <Flex
                  gap="10px"
                  direction="row"
                  align="center"
                  border="1px solid lightgray"
                  padding="8px"
                  borderRadius="5px"
                >
                  <i className="fa-brands fa-github"></i>
                  <Link
                    target="_blank"
                    href={user?.github}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    width="300px"
                  >
                    {user?.github}
                  </Link>
                </Flex>
              </Flex>
            )}
          </Box>

          <Flex direction="column" gap="20px">
            <Box height="fit-content" gap="20px">
              <Flex width="65vw" gap="20px" className="graphs">
                <Box
                  height="41.5vh"
                  minHeight="fit-content"
                  p="20px"
                  borderRadius="15px"
                  boxShadow="0px 0px 10px 0px rgba(185, 100, 245, 0.1);"
                  width="50%"
                  className="graphs"
                >
                  <Heading fontSize="17px" mb="50px">
                    House Contribution
                  </Heading>
                  <Flex
                    align="center"
                    justify="center"
                    height="60%"
                    gap="20px"
                    direction="column"
                  >
                    <canvas
                      id="contribution"
                      width="10px"
                      height="10px"
                    ></canvas>
                  </Flex>
                </Box>

                <Box
                  height="41.5vh"
                  minHeight="fit-content"
                  borderRadius="15px"
                  boxShadow="0px 0px 10px 0px rgba(185, 100, 245, 0.1);"
                  p="0px 10px"
                  pb="30px"
                  width="80vw"
                  className="graphs"
                >
                  <Heading p="20px" pb="0" fontSize="17px" mb="50px">
                    Contribution Graph
                  </Heading>

                  <Flex
                    align="center"
                    justify="center"
                    height="70%"
                    gap="20px"
                    direction="column"
                  >
                    <canvas id="graph"></canvas>
                  </Flex>
                </Box>
              </Flex>
            </Box>

            <Box
              width="100%"
              height="41.5vh"
              minHeight="fit-content"
              borderRadius="15px"
              boxShadow="0px 0px 10px 0px rgba(185, 100, 245, 0.1);"
              p="20px"
              overflowY="auto"
              className="table"
            >
              <Table>
                <Thead>
                  <Tr>
                    <Td>Sr. No</Td>
                    <Td>Certificate Name</Td>
                    <Td>Issuing Org.</Td>
                    <Td>Type</Td>
                    <Td>Issue Date</Td>
                  </Tr>
                </Thead>
                <Tbody>
                  {certifications?.map((certification, index) => (
                    <Tr key={index}>
                      <Td>{index + 1}</Td>
                      <Td>{certification?.certificateName}</Td>
                      <Td>{certification?.issuingOrg}</Td>
                      <Td>{certification?.certificateType}</Td>
                      <Td>
                        {certification?.issueMonth} {certification.issueYear}
                      </Td>
                      <Td
                        _hover={{ cursor: "pointer", textDecor: "underline" }}
                        onClick={() =>
                          navigator(`/certificates/${certification._id}`)
                        }
                      >
                        View
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Flex>
        </Flex>
        <Modal isOpen={isOpen} onClose={closeModal}>
          <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
          <ModalContent>
            <ModalHeader>Upload Picture</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex
                align="center"
                justify="center"
                direction="column"
                gap="50px"
              >
                <AvatarEditor
                  image={newImage || ""}
                  width={200}
                  height={200}
                  border={50}
                  borderRadius={100}
                  color={[0, 0, 0, 0.6]} // RGBA
                  scale={zoom}
                  rotate={0}
                  className="avatar-editor"
                  ref={newImageRef}
                />
                <Box width="100%">
                  <Text textAlign="center">Zoom</Text>
                  <Slider
                    aria-label="slider-ex-1"
                    min={1.2}
                    value={zoom}
                    onChange={setZoom}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                variant="ghost"
                isLoading={btnLoading}
                onClick={uploadImage}
              >
                Set
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  } else {
    return <Loader />;
  }
};

export default Profile;
