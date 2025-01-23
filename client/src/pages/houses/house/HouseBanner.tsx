import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { Input } from "@chakra-ui/react";

interface HouseBannerProps {
  id: string;
  onBannerChange: (file: File) => void;
  color: string;
  editPrivilege: boolean;
  ext: string;
  refreshImages: number;
}

export const HouseBanner: React.FC<HouseBannerProps> = ({
  id,
  ext,
  onBannerChange,
  color,
  editPrivilege,
  refreshImages,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="relative h-72 bg-cover bg-center rounded-t-2xl overflow-hidden w-full"
      style={{
        backgroundImage: `url(${
          import.meta.env.VITE_API_URL
        }/static/houses/banners/${id + ext}?${refreshImages})`,
        backgroundColor: color,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

      {editPrivilege && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-sm z-10"
          onClick={handleCameraClick}
        >
          <Camera className="w-5 h-5 text-white" />
          <Input
            ref={fileInputRef}
            type="file"
            id="bannerfile"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onBannerChange(file);
              }
            }}
          />
        </motion.button>
      )}
    </div>
  );
};
