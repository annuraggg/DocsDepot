import { Flex, Input, InputGroup, InputLeftAddon, Link } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Mail, Linkedin, Github } from "lucide-react";
import { User } from "@shared-types/User";

const MotionFlex = motion(Flex);
const MotionInputGroup = motion(InputGroup);

interface SocialLinksProps {
  user?: User;
  privilege: boolean;
  email: string;
  linkedin: string;
  github: string;
  changeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEmailKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  changeLinkedin: (e: React.KeyboardEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => void;
  changeGithub: (e: React.KeyboardEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => void;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  user,
  privilege,
  changeEmail,
  handleEmailKeyPress,
  changeLinkedin,
  changeGithub,
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  if (privilege) {
    return (
      <MotionFlex
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        direction="column"
        gap="4"
        className="mt-6 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
      >
        <MotionInputGroup variants={itemVariants} className="group">
          <InputLeftAddon className="bg-purple-50 border-purple-100">
            <Mail className="text-purple-600" size={18} />
          </InputLeftAddon>
          <Input
            type="email"
            className="border-purple-100 focus:border-purple-300 focus:ring-purple-200"
            onChange={changeEmail}
            onKeyUp={handleEmailKeyPress}
            defaultValue={user?.social.email}
            placeholder="Enter email address"
          />
        </MotionInputGroup>

        <MotionInputGroup variants={itemVariants} className="group">
          <InputLeftAddon className="bg-blue-50 border-blue-100">
            <Linkedin className="text-blue-600" size={18} />
          </InputLeftAddon>
          <Input
            type="url"
            className="border-blue-100 focus:border-blue-300 focus:ring-blue-200"
            defaultValue={user?.social.linkedin}
            onKeyUp={changeLinkedin}
            placeholder="Enter LinkedIn URL"
          />
        </MotionInputGroup>

        <MotionInputGroup variants={itemVariants} className="group">
          <InputLeftAddon className="bg-gray-50 border-gray-100">
            <Github className="text-gray-600" size={18} />
          </InputLeftAddon>
          <Input
            type="url"
            className="border-gray-100 focus:border-gray-300 focus:ring-gray-200"
            defaultValue={user?.social.github}
            onKeyUp={changeGithub}
            placeholder="Enter GitHub URL"
          />
        </MotionInputGroup>
      </MotionFlex>
    );
  }

  return (
    <MotionFlex
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      direction="column"
      gap="4"
      className="mt-6 bg-white rounded-xl shadow-lg p-6"
    >
      <MotionFlex
        variants={itemVariants}
        className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 group hover:bg-purple-100 transition-colors"
      >
        <Mail className="text-purple-600" size={18} />
        <Link
          href={"mailto:" + user?.social.email}
          target="_blank"
          className="text-purple-700 hover:text-purple-800 transition-colors truncate"
        >
          {user?.social.email}
        </Link>
      </MotionFlex>

      <MotionFlex
        variants={itemVariants}
        className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 group hover:bg-blue-100 transition-colors"
      >
        <Linkedin className="text-blue-600" size={18} />
        <Link
          href={user?.social.linkedin}
          target="_blank"
          className="text-blue-700 hover:text-blue-800 transition-colors truncate"
        >
          {user?.social.linkedin}
        </Link>
      </MotionFlex>

      <MotionFlex
        variants={itemVariants}
        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group hover:bg-gray-100 transition-colors"
      >
        <Github className="text-gray-600" size={18} />
        <Link
          href={user?.social.github}
          target="_blank"
          className="text-gray-700 hover:text-gray-800 transition-colors truncate"
        >
          {user?.social.github}
        </Link>
      </MotionFlex>
    </MotionFlex>
  );
};