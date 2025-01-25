import React from "react";
import { motion } from "framer-motion";
import { Mail, Link as LinkIcon, Github, UserCircle2 } from "lucide-react";

interface TeamMember {
  name: string;
  email: string;
  website: string | null;
  githubUsername?: string;
}

const TeamMemberCard: React.FC<TeamMember> = ({
  name,
  email,
  website,
  githubUsername,
}) => {
  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg group transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 h-24">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          {githubUsername ? (
            <img
              src={`https://github.com/${githubUsername}.png`}
              alt={`${name}'s avatar`}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <UserCircle2 className="w-24 h-24 text-white bg-blue-600 rounded-full p-2 border-4 border-white" />
          )}
        </div>
      </div>

      <div className="pt-16 p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{name}</h3>

        <div className="flex justify-center space-x-4 mb-4">
          <a
            href={`mailto:${email}`}
            className="text-blue-500 hover:text-blue-700 transition-colors"
            title="Email"
          >
            <Mail className="w-6 h-6" />
          </a>
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-700 transition-colors"
              title="Personal Website"
            >
              <LinkIcon className="w-6 h-6" />
            </a>
          )}
          {githubUsername && (
            <a
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-black transition-colors"
              title="GitHub Profile"
            >
              <Github className="w-6 h-6" />
            </a>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>{email}</p>
          {website && <p className="text-blue-500 truncate">{website}</p>}
        </div>
      </div>
    </motion.div>
  );
};

const About: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Anurag Sawant",
      email: "hello@anuragsawant.in",
      website: "https://anuragsawant.in/",
      githubUsername: "annuraggg",
    },
    {
      name: "Shravandeep Yadav",
      email: "dman1562001@gmail.com",
      website: "https://shravandeepyadav.com/",
      githubUsername: "Spy156",
    },
    {
      name: "Abdul Hadi Shah",
      email: "abdulhadishah2003@gmail.com",
      website: null,
      githubUsername: "abdulhadishah",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-12">
          <motion.h1
            className="text-5xl font-extrabold mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Docs Depot
          </motion.h1>
          <p className="text-xl opacity-80">By Team Scriptopia</p>
        </div>

        <div className="p-8 md:px-12 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} {...member} />
            ))}
          </div>

          <div className="text-center mt-8">
            <motion.a
              href="https://github.com/annuraggg/DocsDepot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-7 h-7 mr-3" />
              Open Source Repository
            </motion.a>
            <p className="mt-3 text-sm opacity-70">* We are open to open source contributions!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
