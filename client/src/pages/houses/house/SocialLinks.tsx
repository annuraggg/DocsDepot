import { motion } from "framer-motion";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { ExtendedHouse } from "@shared-types/ExtendedHouse";

export const SocialLinks = ({ house }: { house: ExtendedHouse }) => {
  return (
    <div className="flex gap-4 mb-8 mt-24">
      {house.social.instagram && (
        <motion.a
          whileHover={{ scale: 1.1 }}
          className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          href={house.social.instagram}
        >
          <Instagram className="w-5 h-5 text-gray-700" />
        </motion.a>
      )}
      {house.social.linkedin && (
        <motion.a
          whileHover={{ scale: 1.1 }}
          className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          href={house.social.linkedin}
        >
          <Linkedin className="w-5 h-5 text-gray-700" />
        </motion.a>
      )}
      {house.social.twitter && (
        <motion.a
          whileHover={{ scale: 1.1 }}
          className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          href={house.social.twitter}
        >
          <Twitter className="w-5 h-5 text-gray-700" />
        </motion.a>
      )}
    </div>
  );
};
