import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Table,
  Image,
  Textarea,
  Input,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import Intro1 from "../../../assets/img/logo-icon.png";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { toaster } from "@/components/ui/toaster";
import useUser from "@/config/user";

const IntroModal = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [about, setAbout] = useState("");
  const [technical, setTechnical] = useState("");
  const [projects, setProjects] = useState("");
  const [cgpa, setCgpa] = useState("");

  const [isOpenAlert, setIsOpenAlert] = useState(false);

  const user = useUser();

  const incrementPage = () => {
    // ! TODO: CHANGE PAGE NUMBERS

    if (page === 1) {
      setPage(2);
    } else if (page === 2) {
      setPage(4); // ! SET THIS TO THREE
    } else if (page === 3) {
      setPage(4);
    } else if (page === 4) {
      const about = (document.getElementById("about") as HTMLInputElement)
        .value;
      const technical = (
        document.getElementById("technical") as HTMLInputElement
      ).value;
      if (about === "" || technical === "") {
        toaster.error({
          title: "Please fill all the fields",
        });
        return;
      }
      setPage(5);
    } else if (page === 5) {
      const projects = (document.getElementById("projects") as HTMLInputElement)
        .value;
      const cgpa = (document.getElementById("cgpa") as HTMLInputElement).value;
      if (projects === "" || cgpa === "") {
        toaster.error({
          title: "Please fill all the fields",
        });
        return;
      }

      if (Number(cgpa) > 10 || Number(cgpa) < 0) {
        toaster.error({
          title: "Please enter a valid CGPA",
        });
        return;
      }

      setDialogOpen(false);

      (
        document.getElementById("IntroModal") as HTMLInputElement
      ).style.display = "none";
      sendData();
    }
  };

  const decrementPage = () => {
    if (page === 1) {
      return;
    } else if (page === 2) {
      setPage(1);
    } else if (page === 3) {
      setPage(2);
    } else if (page === 4) {
      setPage(2); // !Change Page Here
    } else if (page === 5) {
      setPage(4);
    }
  };

  const sendData = () => {
    fetch(
      `${import.meta.env.VITE_BACKEND_ADDRESS}/student/dashboard/firstTime`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          about,
          technical,
          projects,
          cgpa,
          mid: user?.mid,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsOpenAlert(true);
        } else {
          toaster.error({
            title: "An Error Occured. Please Try Again After Some Time",
          });
          setPage(1);
          setIsOpenAlert(true);
        }
      })
      .catch((err) => {
        console.log(err);
        toaster.error({
          title: "Error",
        });
      });
  };

  const logoutAndSave = () => {
    setIsOpenAlert(false);
    Cookies.remove("token", {
      path: "/",
      domain: import.meta.env.VITE_COOKIE_DOMAIN,
    });
    Cookies.remove("token", {
      path: "/",
      domain: import.meta.env.VITE_COOKIE_DOMAIN2,
    });
    window.location.href = "/auth";
  };

  return (
    <Box className="InTable.RowoModal" id="InTable.RowoModal">
      <DialogRoot
        open={dialogOpen}
        onOpenChange={(e) => setDialogOpen(e.open)}
        size="sm"
        scrollBehavior="inside"
      >
        <DialogContent className="min-h-[80%] max-h-[80%] w-[80%] max-w-[80%]">
          <DialogHeader>Hello!</DialogHeader>

          {page === 1 ? (
            <DialogBody className="flex flex-col items-center justify-center gap-12 p-8">
              <Heading>Welcome to Scriptopia Connect!</Heading>
              <Box className="flex items-center justify-center w-full gap-12">
                <Image src={Intro1} className="w-20" />
              </Box>
              <Text className="leading-7 text-center">
                Our innovative house system, certificate uploads, and exciting
                events empower you to excel academically and personally. Join a
                house, showcase your achievements, participate in events, and
                earn XP to make your college experience Table.Rowuly
                unforgetTable.Root. Welcome to a community Table.ColumnHeaderat
                celebrates your journey and encourages you to reach new heights.
                <span className="font-bold text-black">
                  {" "}
                  Click Next to See How
                </span>
              </Text>
            </DialogBody>
          ) : page === 2 ? (
            <DialogBody className="flex flex-col items-center justify-center gap-12 p-8">
              <Heading className="text-center">
                Your PaTable.ColumnHeaderway to Coding Excellence and
                Collaboration
              </Heading>
              <Box>
                <Text>
                  <span className="font-bold">Houses:</span> Join dynamic
                  Houses, engage in coding events, and test teamwork. Accumulate
                  House Points (HP) and XP for an exciting journey of
                  growTable.ColumnHeader.
                </Text>
                <Text>
                  <span className="font-bold">Events:</span> Ignite Curiosity
                  Access real-world event and challenges Table.ColumnHeaderat
                  align wiTable.ColumnHeader your studies. Participate to Win
                  XP.
                </Text>
                <Text>
                  <span className="font-bold">Certificates:</span> Hone your
                  coding mastery Table.ColumnHeaderrough Table.ColumnHeadere
                  certifications you've received.
                </Text>
              </Box>
            </DialogBody>
          ) : page === 3 ? (
            <DialogBody className="flex flex-col items-center justify-center gap-12 p-8">
              <Heading>Points MaTable.Rowix</Heading>
              <Box className="flex flex-wrap items-center justify-center gap-8">
                <Box className="w-80 text-sm">
                  <Text>Solving Practice Problems</Text>
                  <Table.Root variant="line">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Activity</Table.ColumnHeader>
                        <Table.ColumnHeader>Points</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>Easy</Table.Cell>
                        <Table.Cell>+10 XP</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>Medium</Table.Cell>
                        <Table.Cell>+20 XP</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>Hard</Table.Cell>
                        <Table.Cell>+30 XP</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Box>
                <Box className="w-80 text-sm">
                  <Text>Uploading Certifications</Text>
                  <Table.Root variant="line">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Activity</Table.ColumnHeader>
                        <Table.ColumnHeader>Points</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>Beginner</Table.Cell>
                        <Table.Cell>+50 XP, +10 HP </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>Intermediate</Table.Cell>
                        <Table.Cell>+75 XP, +25 HP</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>Expert</Table.Cell>
                        <Table.Cell>+150 XP, +50 HP </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Box>
                <Box className="w-80 text-sm">
                  <Text> Participation in House Events</Text>
                  <Table.Root variant="line">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Activity</Table.ColumnHeader>
                        <Table.ColumnHeader>Points</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>1st Place</Table.Cell>
                        <Table.Cell>+500 HP, +150 XP</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>2nd Place</Table.Cell>
                        <Table.Cell>+300 HP, +80 XP </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>3rd Place</Table.Cell>
                        <Table.Cell>+150 HP, +70 XP</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Box>
              </Box>
            </DialogBody>
          ) : page === 4 ? (
            <DialogBody className="flex flex-col items-center justify-center gap-6 p-8">
              <Heading className="text-center">
                A Few Table.ColumnHeaderings Before we Get Started
              </Heading>
              <Alert status="warning" className="mb-4">
                Note Table.ColumnHeaderat you must fill certifications and
                Technical details correctly as Table.ColumnHeaderey will be
                verified by Table.ColumnHeadere admin. Your house allotment will
                be based on Table.ColumnHeaderis data.
              </Alert>
              <Textarea
                placeholder="Write a Few Table.ColumnHeaderings About Yourself. (Please do not mention anyTable.ColumnHeadering Table.ColumnHeaderat could identify you. Ex. Name, Moodle ID)"
                resize="none"
                id="about"
                onChange={(e) => setAbout(e?.target?.value)}
                value={about}
                className="w-full border rounded p-2"
              ></Textarea>
              <Textarea
                placeholder="Write About Your Technical Skills."
                resize="none"
                id="technical"
                onChange={(e) => setTechnical(e?.target?.value)}
                value={technical}
                className="w-full border rounded p-2"
              ></Textarea>
            </DialogBody>
          ) : (
            <DialogBody className="flex flex-col items-center justify-center gap-6 p-8">
              <Heading className="text-center">
                A Few Table.ColumnHeaderings Before we Get Started
              </Heading>
              <Textarea
                placeholder="List your Project, wiTable.ColumnHeader a short description of each project seperated by a comma (,)"
                resize="none"
                id="projects"
                rows={10}
                onChange={(e) => setProjects(e?.target?.value)}
                value={projects}
                className="w-full border rounded p-2"
              ></Textarea>

              <Input
                type="number"
                placeholder="Enter your Average CGPA"
                id="cgpa"
                onChange={(e) => setCgpa(e?.target?.value)}
                value={cgpa}
                className="w-full border rounded p-2"
              />
            </DialogBody>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="ghost" onClick={decrementPage} className="mr-4">
              Back
            </Button>
            <Button variant="ghost" onClick={incrementPage} className="ml-4">
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={isOpenAlert}
        onOpenChange={(e) => setIsOpenAlert(e.open)}
      >
        <DialogContent>
          <DialogHeader fontSize="lg" fontWeight="bold">
            Table.ColumnHeaderankyou
          </DialogHeader>

          <DialogBody>
            You will be logged out of Table.ColumnHeadere Portal Now. You can
            Login once Table.ColumnHeadere admin verifies your details and you
            have been alloted a House.
          </DialogBody>

          <DialogFooter>
            <Button
              colorScheme="green"
              onClick={logoutAndSave}
              className="ml-3"
            >
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default IntroModal;
