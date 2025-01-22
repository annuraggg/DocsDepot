import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Stack,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useToast } from "../../../components/useToast";
import useAxios from "@/config/axios";
import { House as IHouse, Point } from "@shared-types/House";
import { Token } from "@shared-types/Token";

import { HouseBanner } from "./HouseBanner";
import { HouseProfile } from "./HouseProfile";
import { SocialLinks } from "./SocialLinks";
import { MembersTable } from "./MembersTable";
import { SettingsModal } from "./SettingsModal";
import { ImageEditorModal } from "./ImageEditorModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import AvatarEditor from "react-avatar-editor";
import { User } from "@shared-types/User";
import { Hash, Home, Mail, UserIcon, UserPlus } from "lucide-react";
import useUser from "@/config/user";
import { Certificate } from "@shared-types/Certificate";
import Loader from "@/components/Loader";

interface ExtendedPoint extends Omit<Point, "certificateId"> {
  certificateId: Certificate;
}
interface ExtendedHouse
  extends Omit<
    IHouse,
    "members" | "facultyCordinator" | "studentCordinator" | "points"
  > {
  members: User[];
  facultyCordinator: User;
  studentCordinator: User;
  points: ExtendedPoint[];
}

export const House: React.FC = () => {
  const [house, setHouse] = React.useState<ExtendedHouse | null>(null);

  const [socialLinks, setSocialLinks] = React.useState({
    instagram: "",
    twitter: "",
    linkedin: "",
  });

  const [isViewAllMembersOpen, setIsViewAllMembersOpen] = React.useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<User | null>(null);

  const [fname, setFname] = React.useState("");
  const [lname, setLname] = React.useState("");
  const [moodleid, setMoodleid] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [selectedHouse, setSelectedHouse] = React.useState("");
  const [gender, setGender] = React.useState("");

  // Form state
  const [houseName, setHouseName] = React.useState("");
  const [houseColor, setHouseColor] = React.useState("");
  const [houseAbstract, setHouseAbstract] = React.useState("");
  const [houseDesc, setHouseDesc] = React.useState("");
  const [editPrivilege, setEditPrivilege] = React.useState(false);

  // Image editing state
  const [logo, setLogo] = React.useState<File | null>(null);
  const [banner, setBanner] = React.useState<File | null>(null);
  const [logoZoom, setLogoZoom] = React.useState(1);
  const [bannerZoom, setBannerZoom] = React.useState(1);

  // Refs
  const logoRef = React.useRef<AvatarEditor>(null);
  const bannerRef = React.useRef<AvatarEditor>(null);

  // Hooks
  const navigate = useNavigate();
  const toast = useToast();
  const axios = useAxios();
  const user = useUser();
  const houseID = window.location.pathname.split("/")[2];

  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDisclosure();

  const {
    isOpen: isLogoOpen,
    onOpen: onLogoOpen,
    onClose: onLogoClose,
  } = useDisclosure();

  const {
    isOpen: isBannerOpen,
    onOpen: onBannerOpen,
    onClose: onBannerClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  useEffect(() => {
    if (user?.role === "A") {
      setEditPrivilege(true);
    }

    if (user?.role === "F" && house?.facultyCordinator?._id === user?._id) {
      setEditPrivilege(true);
    }

    fetchHouseData();
  }, []);

  React.useEffect(() => {
    if (house) {
      calculatePoints();
      sortMembers();
    }
  }, [house]);

  // Functions
  const fetchHouseData = async () => {
    try {
      const response = await axios.get(`/houses/${houseID}`);
      if (response.status === 200) {
        const { house } = response.data.data;
        console.log(response.data.data);
        setHouse(house);

        // form data
        setHouseName(house.name);
        setHouseColor(house.color);
        setHouseAbstract(house.abstract);
        setHouseDesc(house.desc);
        setBanner(house.banner);
        setLogo(house.logo);
        setSocialLinks(house.socialLinks || {});
      }
    } catch (error) {
      toast(
        "Failed to fetch house data",
        "Failed to fetch house data",
        "error"
      );
    }
  };

  const calculatePoints = () => {};

  const sortMembers = () => {};

  const handleUpdateHouse = async () => {
    try {
      const response = await axios.put(`/houses/${houseID}`, {
        name: houseName,
        color: houseColor,
        abstract: houseAbstract,
        desc: houseDesc,
        socialLinks,
      });
      if (response.status === 200) {
        toast("Success", "House updated successfully", "success");
        onSettingsClose();
        fetchHouseData();
      }
    } catch (error) {
      toast("Error", "Failed to update house", "error");
    }
  };

  const handleSaveLogo = async () => {};

  const handleSaveBanner = async () => {};

  const handleDeleteMember = async () => {
    try {
      if (!selectedMember) return;

      const response = await axios.delete(`/houses/${houseID}/member`, {
        data: {
          mid: selectedMember._id,
        },
      });

      if (response.status === 200) {
        toast("Success", "Member removed successfully", "success");
        onDeleteClose();
        fetchHouseData();
      }
    } catch (error) {
      toast("Error", "Failed to remove member", "error");
    }
  };

  const getTopMembers = (members: User[], limit?: number) => {
    const sortedMembers = [...members].sort((a, b) => {
      const aMemberPoints =
        house?.points?.reduce(
          (sum, point) => (point.userId === a._id ? sum + point.points : sum),
          0
        ) || 0;

      const bMemberPoints =
        house?.points?.reduce(
          (sum, point) => (point.userId === b._id ? sum + point.points : sum),
          0
        ) || 0;

      return bMemberPoints - aMemberPoints || 0;
    });

    return limit ? sortedMembers.slice(0, limit) : sortedMembers;
  };

  const handleSocialLinksChange = (
    type: "instagram" | "twitter" | "linkedin",
    value: string
  ) => {
    setSocialLinks((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  if (!house) {
    return <Loader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8"
    >
      <div className="max-w-7xl mx-auto">
        <Card className="w-full shadow-xl">
          <CardBody className="p-0">
            <div className="relative">
              <HouseBanner
                banner={house?.banner || ""}
                color={house?.color || ""}
                editPrivilege={editPrivilege}
                onSelectBanner={() => {}}
                onBannerChange={() => {}}
              />

              <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
                <HouseProfile
                  editPrivileges={editPrivilege}
                  logo={house?.logo || ""}
                  name={house?.name || ""}
                  facCord={house?.facultyCordinator || ({} as User)}
                  onSelectLogo={() => {}}
                  onLogoChange={() => {}}
                  onSettingsOpen={onSettingsOpen}
                  navigateToProfile={(id) => navigate(`/profile/${id}`)}
                />
              </div>
            </div>

            <div className="pt-5 px-8 pb-8">
              <SocialLinks />

              <h2 className="text-xl font-semibold mb-3">{house?.abstract}</h2>

              <p className="text-gray-600 leading-relaxed">{house?.desc}</p>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Top Members</h3>
                  <div className="space-x-2">
                    {editPrivilege && (
                      <Button
                        size="sm"
                        leftIcon={<UserPlus size={16} />}
                        onClick={() => setIsAddMemberOpen(true)}
                      >
                        Add Member
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsViewAllMembersOpen(true)}
                    >
                      View All
                    </Button>
                  </div>
                </div>
                <MembersTable
                  house={house!}
                  members={getTopMembers(house?.members || [], 3)}
                  onMemberClick={(id) => navigate(`/profile/${id}`)}
                  onDeleteClick={(member) => {
                    setSelectedMember(member);
                    onDeleteOpen();
                  }}
                  editPrivilege={editPrivilege}
                />
              </CardBody>
            </Card>
          </div>

          <div>
            {/* <HouseStats
              totalPoints={totalPoints}
              internalPoints={internalPoints}
              externalPoints={externalPoints}
              eventPoints={eventPoints}
            /> */}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        houseName={houseName}
        houseColor={houseColor}
        houseAbstract={houseAbstract}
        houseDesc={houseDesc}
        isAdmin={user?.role === "A"}
        onNameChange={setHouseName}
        onColorChange={setHouseColor}
        onAbstractChange={setHouseAbstract}
        onDescChange={setHouseDesc}
        onSocialLinksChange={handleSocialLinksChange}
        onSave={handleUpdateHouse}
      />

      <ImageEditorModal
        isOpen={isLogoOpen}
        onClose={onLogoClose}
        image={logo || ""}
        type="logo"
        editorRef={logoRef}
        zoom={logoZoom}
        onZoomChange={(value) =>
          setLogoZoom(Array.isArray(value) ? value[0] : value)
        }
        onSave={handleSaveLogo}
      />

      <ImageEditorModal
        isOpen={isBannerOpen}
        onClose={onBannerClose}
        image={banner || ""}
        type="banner"
        editorRef={bannerRef}
        zoom={bannerZoom}
        onZoomChange={(value) =>
          setBannerZoom(Array.isArray(value) ? value[0] : value)
        }
        onSave={handleSaveBanner}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDeleteMember}
        title="Remove Member"
        description="Are you sure you want to remove this member? This action cannot be undone."
      />

      <Modal
        isOpen={isViewAllMembersOpen}
        onClose={() => setIsViewAllMembersOpen(false)}
        size="4xl"
      >
        <ModalContent>
          <ModalHeader>All Members</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <MembersTable
              house={house!}
              members={getTopMembers(house?.members || [])}
              onMemberClick={(id) => navigate(`/profile/${id}`)}
              onDeleteClick={(member) => {
                setSelectedMember(member);
                onDeleteOpen();
              }}
              editPrivilege={editPrivilege}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          as={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 } as any}
          mx={4}
        >
          <ModalHeader fontSize="2xl">Add New Student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <Stack direction={["column", "row"]} spacing={4} w="full">
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <UserIcon size={18} />
                    </InputLeftElement>
                    <Input
                      placeholder="First Name"
                      value={fname}
                      onChange={(e) => setFname(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <UserIcon size={18} />
                    </InputLeftElement>
                    <Input
                      placeholder="Last Name"
                      value={lname}
                      onChange={(e) => setLname(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>
              </Stack>

              <FormControl>
                <FormLabel>Moodle ID</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Hash size={18} />
                  </InputLeftElement>
                  <Input
                    placeholder="Moodle ID"
                    value={moodleid}
                    onChange={(e) => setMoodleid(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Mail size={18} />
                  </InputLeftElement>
                  <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>House</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Home size={18} />
                  </InputLeftElement>
                  <Select
                    placeholder="Select a House"
                    onChange={(e) => setSelectedHouse(e.target.value)}
                    value={selectedHouse}
                    pl={10}
                  ></Select>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Gender</FormLabel>
                <RadioGroup onChange={setGender} value={gender}>
                  <Stack direction="row" spacing={6}>
                    <Radio value="M" colorScheme="blue">
                      Male
                    </Radio>
                    <Radio value="F" colorScheme="pink">
                      Female
                    </Radio>
                    <Radio value="O" colorScheme="purple">
                      Others
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                setIsAddMemberOpen(false);
              }}
              leftIcon={<UserPlus size={18} />}
            >
              Add Student
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};

export default House;
