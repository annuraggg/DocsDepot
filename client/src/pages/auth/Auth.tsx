import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import APSIT from "./../../assets/img/apsit-logo.png";
import Cookie from "js-cookie";
import { useNavigate } from "react-router";
import useAxios from "@/config/axios";
import CreatePW from "./CreatePW";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const [mid, setMid] = useState("");
  const [fact, setFact] = useState("");

  const [err, setErr] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toaster = useToast();

  const redirectURL =
    new URLSearchParams(window.location.search).get("redirect") || "/";

  useEffect(() => {
    try {
      if (Cookie.get("blocked")) {
        setDisabled(true);
        setErr("Account temporarily blocked. Please try again later.");
      }
      localStorage.removeItem("chakra-ui-color-mode");
    } catch (error) {
      console.error("Error in initialization:", error);
      setErr("An error occurred while initializing the application.");
    }
  }, []);

  useEffect(() => {
    try {
      if (attempts === 5) {
        history.replaceState({}, "/auth", "/auth?err=max");
        setErr("Too Many Attempts");
        setDisabled(true);

        const now = new Date();
        const expirationTime = new Date(now.getTime() + 1000 * 60 * 2);
        Cookie.set("blocked", "true", {
          expires: expirationTime,
          path: "/"
        });

        toaster({
          title: "Too many attempts",
          description: "Please try again after 2 minutes.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });

        setTimeout(() => {
          setDisabled(false);
          setErr("");
          history.replaceState({}, "/auth?err=max", "/auth");
        }, 120000); // 2 minutes
      }
    } catch (error) {
      console.error("Error handling attempts:", error);
      setErr("An error occurred while processing your request.");
    }
  }, [attempts]);

  const programming_facts = [
    "The first computer bug was a real bug – a moth found trapped in a Harvard Mark II computer in 1947.",
    "The term 'bug' to describe a glitch in a computer system was coined by Grace Hopper when a moth caused an error in the Mark II computer in 1947.",
    "The world's first computer programmer was Ada Lovelace, an English mathematician and writer.",
    "The QWERTY keyboard layout was designed to slow down typing and prevent mechanical jams in typewriters.",
    "The ENIAC computer, one of the earliest general-purpose computers, weighed about 27 tons.",
    "JavaScript was created in 10 days by Brendan Eich while he worked at Netscape.",
    "The C programming language was developed by Dennis Ritchie at Bell Labs in the early 1970s.",
    "Linux, an open-source operating system kernel, was created by Linus Torvalds in 1991.",
    "The first version of Windows, Windows 1.0, was released by Microsoft in 1985.",
    "Python was named after the British comedy show 'Monty Python's Flying Circus.'",
    "Java was originally called 'Oak' but was renamed 'Java' due to trademark issues.",
    "The '@' symbol in email addresses was chosen by Ray Tomlinson, the inventor of email.",
    "The HTML acronym stands for 'Hypertext Markup Language.'",
    "The first computer mouse was made of wood and had only one button.",
    "The world's first computer virus, the Creeper virus, was written in 1971.",
    "The programming language COBOL, developed in the late 1950s, is still used in legacy systems.",
    "The Windows operating system was named after its GUI component – overlapping windows.",
    "The number of possible combinations in a deck of playing cards is greater than the number of atoms on Earth.",
    "The acronym 'HTTP' stands for 'Hypertext Transfer Protocol.'",
    "The first recorded computer-generated music was created by Alan Turing's computer in 1951.",
    "CAPTCHA stands for 'Completely Automated Public Turing test to tell Computers and Humans Apart.'",
    "The original source code for the World Wide Web was written in the NeXTSTEP programming environment.",
    "The Linux mascot, Tux, is a penguin chosen because penguins are known to be loyal and cooperative.",
    "A 'byte' was coined by Werner Buchholz, an IBM engineer, as a term to describe groups of bits.",
    "The C++ programming language was an extension of the C programming language.",
    "The first computer programmer in space was a NASA astronaut, John Howard, who wrote code for Apollo missions.",
    "The Commodore 64, released in 1982, is one of the best-selling personal computers in history.",
    "The 'Hello, World!' program is a traditional way to introduce a programming language to beginners.",
    "The original Apple Macintosh, released in 1984, had only 128KB of RAM.",
    "The term 'bit' is a contraction of 'binary digit.'",
    "The C# programming language, pronounced 'C-sharp,' was developed by Microsoft.",
    "The first video game with recognizable graphics was 'Spacewar!' developed in 1962.",
    "The concept of object-oriented programming was developed in the 1960s but gained popularity in the 1980s.",
    "The first domain name ever registered was 'symbolics.com' on March 15, 1985.",
    "The game 'Pong' was one of the earliest video games and simulated table tennis.",
    "The 'Shift' key on a keyboard was introduced to allow the typewriter mechanism to shift position.",
    "The 'Ctrl' key (Control key) was first introduced on the QWERTY keyboard in the 1960s.",
    "The C# programming language, pronounced 'C-sharp,' was developed by Microsoft.",
    "The first video game with recognizable graphics was 'Spacewar!' developed in 1962.",
    "The concept of object-oriented programming was developed in the 1960s but gained popularity in the 1980s.",
    "The first domain name ever registered was 'symbolics.com' on March 15, 1985.",
    "The game 'Pong' was one of the earliest video games and simulated table tennis.",
    "The 'Shift' key on a keyboard was introduced to allow the typewriter mechanism to shift position.",
    "The 'Ctrl' key (Control key) was first introduced on the QWERTY keyboard in the 1960s.",
    "The concept of a 'bug' in a computer system originated from a literal insect – a moth – causing a malfunction.",
    "The Commodore Amiga, released in 1985, was one of the first personal computers with advanced multimedia capabilities.",
    "The acronym 'SQL' stands for 'Structured Query Language.'",
    "The concept of a 'bug' in a computer system originated from a literal insect – a moth – causing a malfunction.",
    "The Commodore Amiga, released in 1985, was one of the first personal computers with advanced multimedia capabilities.",
    "The acronym 'SQL' stands for 'Structured Query Language.'",
    "The concept of 'open-source' software involves sharing the source code publicly and allowing anyone to modify and distribute it.",
    "The 'cloud' in 'cloud computing' represents the internet, and cloud services store and manage data remotely.",
    "The first computer mouse had only one button because its creator, Douglas Engelbart, thought it was sufficient.",
    "The 'AI winter' refers to periods of reduced funding and interest in artificial intelligence research.",
    "The term 'debugging' originated with Grace Hopper when she removed a moth from a computer relay.",
    "A 'hackathon' is a coding event where programmers collaborate intensively on projects.",
    "The 'NaN' in programming stands for 'Not a Number.'",
    "The first computer programmer in space was a NASA astronaut, John Howard, who wrote code for Apollo missions.",
    "The 'NaN' in programming stands for 'Not a Number.'",
    "The first computer programmer in space was a NASA astronaut, John Howard, who wrote code for Apollo missions.",
    "The Commodore 64, released in 1982, is one of the best-selling personal computers in history.",
    "The 'Hello, World!' program is a traditional way to introduce a programming language to beginners.",
    "The original Apple Macintosh, released in 1984, had only 128KB of RAM.",
    "The term 'bit' is a contraction of 'binary digit.'",
    "The C# programming language, pronounced 'C-sharp,' was developed by Microsoft.",
    "The first video game with recognizable graphics was 'Spacewar!' developed in 1962.",
    "The concept of object-oriented programming was developed in the 1960s but gained popularity in the 1980s.",
    "The first domain name ever registered was 'symbolics.com' on March 15, 1985.",
    "The game 'Pong' was one of the earliest video games and simulated table tennis.",
    "The 'Shift' key on a keyboard was introduced to allow the typewriter mechanism to shift position.",
    "The 'Ctrl' key (Control key) was first introduced on the QWERTY keyboard in the 1960s.",
    "The concept of a 'bug' in a computer system originated from a literal insect – a moth – causing a malfunction.",
    "The Commodore Amiga, released in 1985, was one of the first personal computers with advanced multimedia capabilities.",
    "The acronym 'SQL' stands for 'Structured Query Language.'",
    "The concept of 'open-source' software involves sharing the source code publicly and allowing anyone to modify and distribute it.",
    "The 'cloud' in 'cloud computing' represents the internet, and cloud services store and manage data remotely.",
    "The first computer mouse had only one button because its creator, Douglas Engelbart, thought it was sufficient.",
    "The 'AI winter' refers to periods of reduced funding and interest in artificial intelligence research.",
    "The term 'debugging' originated with Grace Hopper when she removed a moth from a computer relay.",
    "A 'hackathon' is a coding event where programmers collaborate intensively on projects.",
    "The 'NaN' in programming stands for 'Not a Number.'",
    "The first computer programmer in space was a NASA astronaut, John Howard, who wrote code for Apollo missions.",
  ];

  useEffect(() => {
    setFact(
      programming_facts[Math.floor(Math.random() * programming_facts.length)]
    );

    const params = new URLSearchParams(window.location.search);
    const err = params.get("err");
    if (err === "newlcn") {
      setErr("You have logged in from a new location.");
    } else if (err === "exp") {
      setErr("");
    } else if (err === "max") setErr("Too Many Attempts");
  }, []);

  const validateAndSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErr("");

    try {
      const midField = document.querySelector("#mid");
      const pwField = document.querySelector("#pw");

      if (!midField || !pwField) {
        throw new Error("Error occurred during authentication");
      }

      const mid = (midField as HTMLInputElement).value;
      const pwd = (pwField as HTMLInputElement).value;
      setMid(mid);

      const axios = useAxios();
      const res = await axios.post("/auth", {
        mid: mid.trim(),
        password: pwd.trim()
      });

      if (res.status === 200) {
        const response = res.data.data;

        localStorage.setItem(
          "chakra-ui-color-mode",
          response?.colorMode ?? "light"
        );

        Cookie.set("token", response.token, { expires: 1 / 6 });

        if (redirectURL !== "/") {
          navigate(redirectURL);
          return;
        }

        if (response.role === "A") {
          navigate("/admin");
        } else if (response.role === "F") {
          if (response.firstTime) {
            onOpen();
          } else {
            navigate("/faculty");
          }
        } else if (response.role === "S") {
          if (response.firstTime) {
            onOpen();
          } else {
            navigate("/student");
          }
        }
      } else {
        setAttempts(attempts + 1);
        throw new Error("Authentication failed");
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      if (!err.response) {
        setErr("Network error occurred. Please check your connection.");
        return;
      }

      const errorMessage = err.response?.data?.message || "Something went wrong";
      setErr(errorMessage);

      if (err.response?.status === 429) {
        setDisabled(true);
        toaster({
          title: "Too many attempts",
          description: "Please try again after some time.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-[#fefeff]">
      <div className="hidden md:flex w-1/2 h-screen bg-gradient-to-r from-[#b966f5] to-[#7bb8fb] items-center justify-center">
        <div className="bg-white/20 border border-aliceblue rounded-xl w-3/4 h-3/4 flex flex-col items-center justify-center p-12 gap-8">
          <h2 className="text-white text-5xl">Did you know?</h2>
          <p className="text-center text-white text-xs -mt-5">{fact}</p>
        </div>
      </div>
      <div className="w-full md:w-1/2 h-screen flex flex-col items-center justify-center gap-2 font-poppins">
        <div className="w-[65%]">
          <Image src={APSIT} alt="APSIT" className="w-44" />
        </div>

        <div className="w-96">
          <Box className="mb-10">
            <Heading className="text-2xl">Hey, hello 👋</Heading>
            <Text className="text-xs opacity-70">
              Sign in with your Moodle ID to Continue
            </Text>
          </Box>
          <form onSubmit={validateAndSubmit}>
            <label htmlFor="mid" className="text-sm font-bold font-familjen">
              Username
            </label>
            <Input id="mid" type="text" disabled={disabled} required />
            <div className="flex flex-col justify-center">
              <label
                htmlFor="pw"
                className="mt-4 text-sm font-bold  font-familjen"
              >
                Password
              </label>
              <InputGroup>
                <Input id="pw" type={show ? "text" : "password"} required />
                <InputRightAddon>
                  {" "}
                  <Button size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightAddon>
              </InputGroup>
            </div>
            <Button
              type="submit"
              isLoading={isLoading}
              loadingText="Logging in..."
              colorScheme="purple"
              width="full"
              className="mt-6"
              disabled={disabled}
            >
              Login
            </Button>
          </form>
          {err && <Text className="text-red-500 mt-4 text-xs">{err}</Text>}
        </div>
      </div>

      <CreatePW isOpen={isOpen} onClose={onClose} onOpen={onOpen} mid={mid} />
    </div>
  );
};

export default Auth;
