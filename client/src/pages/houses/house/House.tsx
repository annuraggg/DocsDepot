import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Card, CardBody, useDisclosure } from '@chakra-ui/react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useToast } from '../../../components/useToast';
import useAxios from "@/config/axios";
import { House as IHouse, Member } from '../../../types/house';
import { Token } from '@shared-types/Token';

import { HouseBanner } from './HouseBanner';
import { HouseProfile } from './HouseProfile';
import { HouseSocialLinks } from './HouseSocialLinks';
import { HouseStats } from './HouseStats';
import { MembersTable } from './MembersTable';
import { SettingsModal } from './SettingsModal';
import { ImageEditorModal } from './ImageEditorModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import AvatarEditor from 'react-avatar-editor';

export const House: React.FC = () => {
  const [house, setHouse] = React.useState<IHouse | null>(null);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [facCord, setFacCord] = React.useState<any[]>([]);
  const [editPrivilege, setEditPrivilege] = React.useState(false);
  const [decoded, setDecoded] = React.useState<Token>({} as Token);

  // Points state
  const [totalPoints, setTotalPoints] = React.useState(0);
  const [internalPoints, setInternalPoints] = React.useState(0);
  const [externalPoints, setExternalPoints] = React.useState(0);
  const [eventPoints, setEventPoints] = React.useState(0);

  // Form state
  const [houseName, setHouseName] = React.useState('');
  const [houseColor, setHouseColor] = React.useState('');
  const [houseAbstract, setHouseAbstract] = React.useState('');
  const [houseDesc, setHouseDesc] = React.useState('');
  const [facCordID, setFacCordID] = React.useState('');
  const [studentCordID, setStudentCordID] = React.useState('');

  // Image editing state
  const [logo, setLogo] = React.useState<File | null>(null);
  const [banner, setBanner] = React.useState<File | null>(null);
  const [logoZoom, setLogoZoom] = React.useState(1);
  const [bannerZoom, setBannerZoom] = React.useState(1);
  const [logoLoading, setLogoLoading] = React.useState(false);
  const [bannerLoading, setBannerLoading] = React.useState(false);

  // Refs
  const logoRef = React.useRef<AvatarEditor>(null);
  const bannerRef = React.useRef<AvatarEditor>(null);

  // Hooks
  const navigate = useNavigate();
  const toast = useToast();
  const axios = useAxios();
  const houseID = window.location.pathname.split('/')[2];

  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose
  } = useDisclosure();

  const {
    isOpen: isLogoOpen,
    onOpen: onLogoOpen,
    onClose: onLogoClose
  } = useDisclosure();

  const {
    isOpen: isBannerOpen,
    onOpen: onBannerOpen,
    onClose: onBannerClose
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      const jwt = jwtDecode(token) as Token;
      setDecoded(jwt);
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
        const { house, members, facCordInfo, studentCordInfo } = response.data.data;
        setHouse(house);
        setMembers(members);
        setFacCord(facCordInfo);
        setStudentCordID(studentCordInfo);

        // form data
        setHouseName(house.name);
        setHouseColor(house.color);
        setHouseAbstract(house.abstract);
        setHouseDesc(house.desc);
        setFacCordID(facCordInfo.mid);
        setBanner(house.banner);
        setLogo(house.logo);
      }
    } catch (error) {
      toast('Failed to fetch house data', 'Failed to fetch house data', 'error');
    }
  };

  const calculatePoints = () => {
  };

  const sortMembers = () => {
  };

  const handleUpdateHouse = async () => {
  };

  const handleSaveLogo = async () => {
  };

  const handleSaveBanner = async () => {
  };

  const handleDeleteMember = async (member: Member) => {
  };

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
                banner={house?.banner || ''}
                color={house?.color || ''}
                editPrivilege={editPrivilege}
                onSelectBanner={() => { }}
                onBannerChange={() => { }}
              />

              <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
                <HouseProfile
                  logo={house?.logo || ''}
                  name={house?.name || ''}
                  facCord={facCord}
                  editPrivilege={editPrivilege}
                  onSelectLogo={() => { }}
                  onLogoChange={() => { }}
                  onSettingsOpen={onSettingsOpen}
                  navigateToProfile={(id) => navigate(`/profile/${id}`)}
                />
              </div>
            </div>

            <div className="pt-5 px-8 pb-8">
              <HouseSocialLinks />

              <h2 className="text-xl font-semibold mb-3">
                {house?.abstract}
              </h2>

              <p className="text-gray-600 leading-relaxed">
                {house?.desc}
              </p>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardBody>
                <h3 className="text-xl font-semibold mb-4">Members</h3>
                <MembersTable
                  members={members}
                  editPrivilege={editPrivilege}
                  onMemberClick={(id) => navigate(`/profile/${id}`)}
                  onDeleteClick={handleDeleteMember}
                />
              </CardBody>
            </Card>
          </div>

          <div>
            <HouseStats
              totalPoints={totalPoints}
              internalPoints={internalPoints}
              externalPoints={externalPoints}
              eventPoints={eventPoints}
            />
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
        isAdmin={decoded.role === 'A'}
        onNameChange={setHouseName}
        onColorChange={setHouseColor}
        onAbstractChange={setHouseAbstract}
        onDescChange={setHouseDesc}
        onSave={handleUpdateHouse}
      />

      <ImageEditorModal
        isOpen={isLogoOpen}
        onClose={onLogoClose}
        image={logo || ''}
        type="logo"
        editorRef={logoRef}
        zoom={logoZoom}
        onZoomChange={(value) => setLogoZoom(Array.isArray(value) ? value[0] : value)}
        onSave={handleSaveLogo}
        isLoading={logoLoading}
      />

      <ImageEditorModal
        isOpen={isBannerOpen}
        onClose={onBannerClose}
        image={banner || ''}
        type="banner"
        editorRef={bannerRef}
        zoom={bannerZoom}
        onZoomChange={(value) => setBannerZoom(Array.isArray(value) ? value[0] : value)}
        onSave={handleSaveBanner}
        isLoading={bannerLoading}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={() => { }}
        title="Remove Member"
        description="Are you sure you want to remove this member? This action cannot be undone."
      />
    </motion.div>
  );
};

export default House;