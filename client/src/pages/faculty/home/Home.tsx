import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  BookUser,
  TrophyIcon,
  CheckCircle2,
  Award,
  Building2,
  Calendar,
  ChevronRight
} from 'lucide-react';

const houseData = [
  { name: 'Phoenix', points: 450, color: '#FF6384' },
  { name: 'Griffin', points: 380, color: '#36A2EB' },
  { name: 'Dragon', points: 420, color: '#FFCE56' },
  { name: 'Unicorn', points: 390, color: '#4BC0C0' }
];

const monthlyHouseData = [
  { month: 'Jan', points: 35 },
  { month: 'Feb', points: 45 },
  { month: 'Mar', points: 40 },
  { month: 'Apr', points: 50 },
  { month: 'May', points: 55 },
  { month: 'Jun', points: 60 },
  { month: 'Jul', points: 52 },
  { month: 'Aug', points: 48 },
  { month: 'Sep', points: 42 },
  { month: 'Oct', points: 38 },
  { month: 'Nov', points: 36 },
  { month: 'Dec', points: 33 }
];

const certificationData = {
  internal: [
    { 
      id: 1,
      name: 'Python Certification', 
      org: 'Coursera', 
      points: 20, 
      date: '2023-01-15', 
      status: 'Approved',
      type: 'internal',
      level: 'intermediate'
    },
    { 
      id: 2,
      name: 'Web Development', 
      org: 'edX', 
      points: 25, 
      date: '2023-02-20', 
      status: 'Pending',
      type: 'internal',
      level: 'beginner'
    },
    { 
      id: 3,
      name: 'Data Science', 
      org: 'Udacity', 
      points: 30, 
      date: '2023-03-10', 
      status: 'Approved',
      type: 'internal',
      level: 'advanced'
    }
  ],
  events: [
    { 
      id: 4,
      name: 'Hackathon', 
      org: 'Local Tech Society', 
      points: 15, 
      date: '2023-04-05', 
      status: 'Completed',
      type: 'external',
      level: 'intermediate'
    },
    { 
      id: 5,
      name: 'Innovation Challenge', 
      org: 'University', 
      points: 25, 
      date: '2023-05-12', 
      status: 'Approved',
      type: 'external',
      level: 'beginner'
    }
  ],
  external: [
    { 
      id: 6,
      name: 'Machine Learning', 
      org: 'Google', 
      points: 35, 
      date: '2023-06-22', 
      status: 'Approved',
      type: 'external',
      level: 'advanced'
    },
    { 
      id: 7,
      name: 'Cloud Computing', 
      org: 'AWS', 
      points: 40, 
      date: '2023-07-18', 
      status: 'Pending',
      type: 'external',
      level: 'intermediate'
    }
  ]
};

const permissionsList = [
  'View Student Profile',
  'View Faculty Profile',
  'Manage House Events',
  'Generate Reports',
  'Co-ordinator - House One'
];

const FacultyDashboard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('all');

  const getLevelProps = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return { className: "bg-emerald-100 text-emerald-800" };
      case "intermediate":
        return { className: "bg-orange-100 text-orange-800" };
      case "advanced":
        return { className: "bg-red-100 text-red-800" };
      default:
        return { className: "bg-gray-100 text-gray-800" };
    }
  };

  const getTypeProps = (type: string) => {
    return type?.toLowerCase() === "internal"
      ? { className: "bg-blue-100 text-blue-800" }
      : { className: "bg-purple-100 text-purple-800" };
  };

  const getStatusProps = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return { className: "bg-green-100 text-green-800" };
      case "pending":
        return { className: "bg-yellow-100 text-yellow-800" };
      case "completed":
        return { className: "bg-blue-100 text-blue-800" };
      default:
        return { className: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 space-y-4 md:space-y-6"
        >
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-lg md:text-xl font-semibold flex items-center">
                <TrophyIcon className="mr-2 w-5 h-5" /> Points Distribution - House Wise
              </h2>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-40"
                size="sm"
              >
                <option value="all">All Months</option>
                {['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <option key={month} value={month.toLowerCase()}>{month}</option>
                  ))}
              </Select>
            </div>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={houseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="points" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <Tabs variant="enclosed">
              <TabList className="flex flex-wrap">
                <Tab className="text-sm px-3 py-2">Internal</Tab>
                <Tab className="text-sm px-3 py-2">Events</Tab>
                <Tab className="text-sm px-3 py-2">External</Tab>
              </TabList>

              <TabPanels>
                {(['internal', 'events', 'external'] as const).map((type) => (
                  <TabPanel key={type} className="p-0 pt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate</th>
                            <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                            <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                            <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {certificationData[type].map((cert, index) => (
                            <motion.tr
                              key={cert.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ 
                                delay: index * 0.1,
                                duration: 0.3
                              }}
                              className="hover:bg-gray-50 transition-colors border-b"
                            >
                              <td className="p-2 md:p-4 text-xs md:text-sm text-gray-900">{index + 1}</td>
                              <td className="p-2 md:p-4">
                                <div className="flex items-center space-x-2">
                                  <Award className="text-green-500 w-4 h-4 md:w-5 md:h-5" />
                                  <span className="text-xs md:text-sm font-medium text-gray-900">{cert.name}</span>
                                </div>
                              </td>
                              <td className="p-2 md:p-4">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                                  <span className="text-xs md:text-sm text-gray-600">{cert.org}</span>
                                </div>
                              </td>
                              <td className="p-2 md:p-4">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="text-blue-400 w-4 h-4 md:w-5 md:h-5" />
                                  <span className="text-xs md:text-sm text-gray-600">
                                    {new Date(cert.date).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      year: 'numeric' 
                                    })}
                                  </span>
                                </div>
                              </td>
                              <td className="p-2 md:p-4">
                                <span 
                                  className={`px-2 py-1 rounded-full text-xs ${getTypeProps(cert.type).className}`}
                                >
                                  {cert.type.charAt(0).toUpperCase() + cert.type.slice(1)}
                                </span>
                              </td>
                              <td className="p-2 md:p-4">
                                <span 
                                  className={`px-2 py-1 rounded-full text-xs ${getLevelProps(cert.level).className}`}
                                >
                                  {cert.level.charAt(0).toUpperCase() + cert.level.slice(1)}
                                </span>
                              </td>
                              <td className="p-2 md:p-4">
                                <span 
                                  className={`px-2 py-1 rounded-full text-xs ${getStatusProps(cert.status).className}`}
                                >
                                  {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                </span>
                              </td>
                              <td className="p-2 md:p-4">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  View
                                  <ChevronRight className="ml-1 w-3 h-3 md:w-4 md:h-4" />
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 md:space-y-6"
        >
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
              <BookUser className="mr-2 w-5 h-5" /> House Performance
            </h2>
            <div className="h-52 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyHouseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="points" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
              <CheckCircle2 className="mr-2 w-5 h-5" /> Your Permissions
            </h2>
            <div className="space-y-2">
              {permissionsList.map((permission, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center text-xs md:text-sm text-gray-700"
                >
                  <Award className="mr-2 text-blue-500 w-4 h-4" />
                  {permission}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FacultyDashboard;