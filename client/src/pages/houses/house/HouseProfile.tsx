import React from "react";
import { motion } from "framer-motion";
import { Avatar, Button } from "@chakra-ui/react";
import { Settings, Camera } from "lucide-react";
import { ExtendedHouse } from "@shared-types/ExtendedHouse";

interface HouseProfileProps {
  logo: string;
  onLogoChange: (file: File) => void;
  onSettingsOpen: () => void;
  navigateToProfile: (id: string) => void;
  editPrivileges: boolean;
  house: ExtendedHouse;
  refreshImages: number;
}

export const HouseProfile: React.FC<HouseProfileProps> = ({
  onLogoChange,
  onSettingsOpen,
  navigateToProfile,
  editPrivileges,
  house,
  refreshImages,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    fileInputRef?.current?.click();
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="absolute -bottom-20 left-8 right-8 flex items-end justify-between"
    >
      <div className="flex items-end gap-6">
        <div className="relative bg-white rounded-full">
          <Avatar
            src={`   ${import.meta.env.VITE_API_URL}/static/houses/logos/${
              house?._id + house?.logo
            }?${refreshImages}`}
            size="2xl"
            className="w-36 h-36 border-4 border-white rounded-full shadow-lg"
            color="primary"
          />
          {editPrivileges && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full backdrop-blur-sm"
              onClick={handleCameraClick}
            >
              <Camera className="w-4 h-4 text-white" />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e?.target.files?.[0];
                  if (file) {
                    onLogoChange(file);
                  }
                }}
              />
            </motion.button>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 drop-shadow-2xl">
            <h1
              className={`text-4xl font-bold text-white mix-blend-difference`}
              style={{
                WebkitTextStroke: `1px ${house?.color}`,
                color: "white",
              }}
            >
              {house?.name || "Untitled"} House
            </h1>
            {editPrivileges && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={onSettingsOpen}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Settings className="w-6 h-6 text-blue-500" />
              </motion.button>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              onClick={() => navigateToProfile(house?.facultyCordinator?.mid)}
            >
              {house.facultyCordinator &&
                `@${house?.facultyCordinator?.fname} ${house?.facultyCordinator?.lname}`}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
