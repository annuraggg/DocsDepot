import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useToast } from "../../../components/useToast";
import useAxios from "@/config/axios";
import { HouseBanner } from "./HouseBanner";
import { HouseProfile } from "./HouseProfile";
import { SocialLinks } from "./SocialLinks";
import { MembersTable } from "./MembersTable";
import { SettingsModal } from "./SettingsModal";
import { ImageEditorModal } from "./ImageEditorModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import AvatarEditor from "react-avatar-editor";
import { User } from "@shared-types/User";
import { UserPlus } from "lucide-react";
import useUser from "@/config/user";
import Loader from "@/components/Loader";
import { ExtendedHouse } from "@shared-types/ExtendedHouse";
import AddUserModal from "./AddUserModal";

export const House: React.FC = () => {
  const [house, setHouse] = React.useState<ExtendedHouse | null>(null);
  const [updateImagesValue, setUpdateImagesValue] = React.useState(0);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isAddingMember, setIsAddingMember] = React.useState(false);
  const [isDeletingMember, setIsDeletingMember] = React.useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = React.useState(false);

  const [isViewAllMembersOpen, setIsViewAllMembersOpen] = React.useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<User | null>(null);

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
    fetchHouseData();
  }, []);

  useEffect(() => {
    if (house) {
      calculatePoints();
      sortMembers();

      if (user?.role === "A") {
        setEditPrivilege(true);
      }

      if (user?.role === "F" && house?.facultyCordinator?._id === user?._id) {
        setEditPrivilege(true);
      }
    }
  }, [house]);

  // Functions
  const fetchHouseData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/houses/${houseID}`);
      if (response.status === 200) {
        const { house } = response.data.data;
        setHouse(house);
        setBanner(house.banner);
        setLogo(house.logo);
      }
    } catch (error: any) {
      toast(
        "Failed to fetch house data",
        error.response?.data?.message || "Something went wrong while fetching house data",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHouse = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.put(`/houses/${houseID}`, { house });
      if (response.status === 200) {
        toast("Success", "House updated successfully", "success");
        onSettingsClose();
        await fetchHouseData();
      }
    } catch (error: any) {
      toast("Error", error.response?.data?.message || "Failed to update house", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const addUserToHouse = async (userId: string) => {
    setIsAddingMember(true);
    try {
      const response = await axios.post(`/houses/${houseID}/member`, {
        _id: userId,
      });

      if (response.status === 200) {
        toast("Success", "Member added successfully", "success");
        setIsAddMemberOpen(false);
        await fetchHouseData();
      }
    } catch (error: any) {
      toast("Error", error.response?.data?.message || "Failed to add member", "error");
      throw error;
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    setIsDeletingMember(true);
    try {
      const response = await axios.delete(`/houses/${houseID}/member`, {
        data: {
          mid: selectedMember._id,
        },
      });

      if (response.status === 200) {
        toast("Success", "Member removed successfully", "success");
        onDeleteClose();
        await fetchHouseData();
      }
    } catch (error: any) {
      toast("Error", error.response?.data?.message || "Failed to remove member", "error");
    } finally {
      setIsDeletingMember(false);
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

  const handleSaveLogo = async () => {
    if (!logoRef.current) return;
    setIsUploadingLogo(true);

    try {
      const canvasBlob = await new Promise((resolve, reject) => {
        logoRef?.current?.getImage().toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        });
      });

      if (!canvasBlob) throw new Error("Failed to create image blob");

      const formData = new FormData();
      formData.append("image", canvasBlob as Blob);

      const response = await axios.put(`/houses/${houseID}/logo`, formData);
      if (response.status === 200) {
        toast("Success", "Logo updated successfully", "success");
        onLogoClose();
        await fetchHouseData();
        refreshComponent();
      }
    } catch (error: any) {
      toast("Error", error.response?.data?.message || "Failed to update logo", "error");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!bannerRef.current) return;
    setIsUploadingBanner(true);

    try {
      const canvasBlob = await new Promise((resolve, reject) => {
        bannerRef?.current?.getImage().toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        });
      });

      if (!canvasBlob) throw new Error("Failed to create image blob");

      const formData = new FormData();
      formData.append("image", canvasBlob as Blob);

      const response = await axios.put(`/houses/${houseID}/banner`, formData);
      if (response.status === 200) {
        toast("Success", "Banner updated successfully", "success");
        onBannerClose();
        await fetchHouseData();
        refreshComponent();
      }
    } catch (error: any) {
      toast("Error", error.response?.data?.message || "Failed to update banner", "error");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const refreshComponent = () => {
    setUpdateImagesValue((prev) => prev + 1);
  };

  const calculatePoints = () => { };

  const sortMembers = () => { };

  if (!house) {
    return <Loader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <Card className="w-full shadow-xl">
          <CardBody className="p-0">
            <div className="relative">
              <HouseBanner
                refreshImages={updateImagesValue}
                id={house?._id || ""}
                ext={house?.banner || ""}
                color={house?.color || ""}
                editPrivilege={editPrivilege}
                onBannerChange={(file: File) => {
                  setBanner(file);
                  onBannerOpen();
                }}
              />

              <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
                <HouseProfile
                  refreshImages={updateImagesValue}
                  editPrivileges={editPrivilege}
                  logo={house?.logo || ""}
                  onLogoChange={(file: File) => {
                    setLogo(file);
                    onLogoOpen();
                  }}
                  onSettingsOpen={onSettingsOpen}
                  navigateToProfile={(id) => navigate(`/profile/${id}`)}
                  house={house}
                />
              </div>
            </div>

            <div className="pt-5 px-8 pb-8">
              <SocialLinks house={house} />
              <h2 className="text-xl font-semibold mb-3">{house?.abstract || "No Abstract Provided."}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{house?.desc || "No Description Provided. "}</p>
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
        house={house}
        setHouse={setHouse}
        onSave={handleUpdateHouse}
        isLoading={isUpdating}
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
        isLoading={isUploadingLogo}
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
        isLoading={isUploadingBanner}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDeleteMember}
        title="Remove Member"
        description="Are you sure you want to remove this member? This action cannot be undone."
        isLoading={isDeletingMember}
      />

      <Modal
        isOpen={isViewAllMembersOpen}
        onClose={() => setIsViewAllMembersOpen(false)}
        size="4xl"
      >
        <ModalOverlay backdropFilter="blur(10px)" />
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

      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        scrollBehavior="inside"
        size="4xl"
      >
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
            <AddUserModal addUser={addUserToHouse} />
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
