import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useToast, Flex, Box, useDisclosure } from "@chakra-ui/react";
import { motion } from "framer-motion";
import AvatarEditor from "react-avatar-editor";
import Cookies from "js-cookie";
import useAxios from "@/config/axios";
import Loader from "@/components/Loader";
import { ProfileHeader } from "./ProfileHeader";
import { SocialLinks } from "./SocialLinks";
import { Charts } from "./Charts";
import { CertificationsTable } from "./CertificationsTable";
import { ImageUploadModal } from "./ImageUploadModal";
import { User } from "@shared-types/User";
import { House } from "@shared-types/House";
import { Certificate } from "@shared-types/Certificate";
import { useParams } from "react-router";

const MotionFlex = motion(Flex);
const MotionBox = motion(Box);

const Profile: React.FC = () => {
  const [privilege, setPrivilege] = useState(false);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [update, setUpdate] = useState(false);
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigate = useNavigate();
  const newImageRef = useRef<AvatarEditor>(null);
  const toast = useToast();
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

  let { id } = useParams(); // if your route is like "/admin/students/:id"
  useEffect(() => {
    if (!id) {
      try {
        id = user?.mid || "";
      } catch (error) {
        console.error("Error getting user ID:", error);
        toast({
          title: "Error",
          description: "Unable to load profile - missing user ID",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
        return;
      }
    }

    setLoading(true);
    axios
      .get("/auth/profile/" + id)
      .then((res) => {
        interface ResponseType {
          user: User;
          allHouses: House[];
          certifications: Certificate[];
        }

        const data: ResponseType = res.data.data;

        if (!data.user || !data.allHouses || !data.certifications) {
          throw new Error("Invalid response data");
        }

        setHouses(data.allHouses);
        const userH = data.allHouses.find(
          (house: House) => house._id === data?.user?.house
        );
        setUserHouse(userH);
        setUser(data.user);
        setCertifications(data.certifications);
        setEmail(data.user.social.email);
        setLinkedin(data.user.social.linkedin);
        setGithub(data.user.social.github);
      })
      .catch((error) => {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Error loading profile data",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [update]);

  const changeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const validateEmail = (email: string): boolean => {
    return Boolean(
      String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
    );
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

      setBtnLoading(true);
      axios
        .post("/auth/profile", { email, linkedin, github })
        .then(() => {
          toast({
            title: "Email Updated Successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          (e.target as HTMLInputElement).blur();
        })
        .catch((error: unknown) => {
          console.error("Error updating email:", error);
          const err = error as { response?: { data?: { message?: string } } };
          toast({
            title: "Error",
            description: err.response?.data?.message || "Error updating email",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        })
        .finally(() => {
          setBtnLoading(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const image = e.target.files[0];
    setNewImage(image);
    onOpen();
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

    try {
      const image = await newImageRef.current
        .getImageScaledToCanvas()
        .toDataURL("image/png");

      await axios.post(`auth/profile/picture`, { image });

      toast({
        title: "Profile Picture Updated Successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setUpdate(!update);
      window.location.reload();
    } catch (error: unknown) {
      console.error("Error uploading profile picture:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Error uploading profile picture",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBtnLoading(false);
    }
  };

  const closeModal = () => {
    onClose();
    setNewImage(undefined);
  };

  const generateReport = () => {
    navigate(`/profile/${mid}/generate/report`);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <MotionFlex
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      gap="20px"
      className="StudentProfile bg-gradient-to-br from-gray-50 to-white min-h-screen p-6"
      id="sp"
    >
      <MotionBox
        width="100%"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ProfileHeader
          user={user}
          privilege={privilege}
          exportPrivilege={exportPrivilege}
          selectImage={selectImage}
          generateReport={generateReport}
          certifications={certifications}
          handleFileChange={handleFileChange}
        />
        <input
          type="file"
          id="file"
          className="hidden"
          accept="image/*"
          onChange={openInAvatarEditor}
        />
        <SocialLinks
          user={user}
          privilege={privilege}
          email={email}
          linkedin={linkedin}
          github={github}
          changeEmail={changeEmail}
          handleEmailKeyPress={handleEmailKeyPress}
          changeLinkedin={changeLinkedin}
          changeGithub={changeGithub}
        />
      </MotionBox>

      <MotionFlex
        direction="column"
        gap="20px"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Charts userHouse={userHouse} houses={houses} loading={loading} />
        <CertificationsTable certifications={certifications} />
      </MotionFlex>

      <ImageUploadModal
        isOpen={isOpen}
        onClose={closeModal}
        newImage={newImage}
        zoom={zoom}
        setZoom={setZoom}
        newImageRef={newImageRef}
        btnLoading={btnLoading}
        uploadImage={uploadImage}
      />
    </MotionFlex>
  );
};

export default Profile;
