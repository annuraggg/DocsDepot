import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Input } from '@chakra-ui/react';

interface HouseBannerProps {
  banner: string;
  color: string;
  editPrivilege: boolean;
  onSelectBanner: () => void;
  onBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HouseBanner: React.FC<HouseBannerProps> = ({
  banner,
  color,
  editPrivilege,
  onSelectBanner,
  onBannerChange,
}) => {
  return (
    <div 
      className="relative h-72 bg-cover bg-center rounded-t-2xl overflow-hidden w-full"
      style={{
        backgroundImage: `url(${banner})`,
        backgroundColor: color,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
      
      {editPrivilege && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-sm z-10"
          onClick={onSelectBanner}
        >
          <Camera className="w-5 h-5 text-white" />
          <Input
            type="file"
            id="bannerfile"
            className="hidden"
            accept="image/*"
            onChange={onBannerChange}
          />
        </motion.button>
      )}
    </div>
  );
};