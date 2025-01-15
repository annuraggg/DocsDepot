import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Twitter } from 'lucide-react';

export const HouseSocialLinks: React.FC = () => {
  return (
    <div className="flex gap-4 mb-8 mt-24">
      <motion.a
        whileHover={{ scale: 1.1 }}
        className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        href="#"
      >
        <Instagram className="w-5 h-5 text-gray-700" />
      </motion.a>
      <motion.a
        whileHover={{ scale: 1.1 }}
        className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        href="#"
      >
        <Linkedin className="w-5 h-5 text-gray-700" />
      </motion.a>
      <motion.a
        whileHover={{ scale: 1.1 }}
        className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        href="#"
      >
        <Twitter className="w-5 h-5 text-gray-700" />
      </motion.a>
    </div>
  );
};