import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Camera, File } from "lucide-react";
import { User } from "@shared-types/User";
import { Certificate } from "@shared-types/Certificate";

const MotionFlex = motion(Flex);
const MotionAvatar = motion(Avatar);

interface ProfileHeaderProps {
  user?: User;
  privilege: boolean;
  exportPrivilege: boolean;
  selectImage: () => void;
  generateReport: () => void;
  certifications?: Certificate[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  privilege,
  exportPrivilege,
  selectImage,
  generateReport,
  certifications,
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MotionFlex
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      p="6"
      direction="column"
      gap="6"
      align="center"
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
      width="100%"
    >
      <Box className="relative group">
        <MotionAvatar
          size="2xl"
          src={user?.profilePicture}
          className="ring-4 ring-purple-100 transition-all duration-300 group-hover:ring-purple-200"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        {privilege && (
          <MotionFlex
            onClick={selectImage}
            align="center"
            justify="center"
            className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="text-white" size={24} />
          </MotionFlex>
        )}
      </Box>

      <MotionFlex
        variants={itemVariants}
        className="flex flex-col items-center gap-2"
      >
        <Text className="text-2xl font-semibold text-gray-800">
          {user?.fname} {user?.lname}
        </Text>
        <Text className="text-gray-500 font-medium">{user?.mid}</Text>
      </MotionFlex>

      {exportPrivilege && (
        <motion.button
          variants={itemVariants}
          className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateReport}
        >
          <File size={18} />
          Generate Report
        </motion.button>
      )}

      <MotionFlex variants={itemVariants} className="grid grid-cols-3 gap-8">
        <Box className="text-center">
          <Text className="text-2xl font-bold text-purple-600">
            {certifications?.filter((cert) => cert.type === "internal").length}
          </Text>
          <Text className="text-sm text-gray-600">Internal Certs</Text>
        </Box>

        <Box className="text-center">
          <Text className="text-2xl font-bold text-blue-600">
            {certifications?.filter((cert) => cert.type === "external")
              .length ?? 0}
          </Text>
          <Text className="text-sm text-gray-600">External Certs</Text>
        </Box>

        <Box className="text-center">
          <Text className="text-2xl font-bold text-green-600">
            {certifications?.filter((cert) => cert.type === "event").length ??
              0}
          </Text>
          <Text className="text-sm text-gray-600">Event Certs</Text>
        </Box>
      </MotionFlex>
    </MotionFlex>
  );
};
