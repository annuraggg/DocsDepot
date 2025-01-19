import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import { User } from "@shared-types/User";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

interface FacultyTableProps {
  filteredFaculty: User[];
  openEdit: (id: string) => void;
  deleteCustomer: (id: string) => void;
}

const MotionBox = motion.div;

const FacultyTable: React.FC<FacultyTableProps> = ({
  filteredFaculty,
  openEdit,
  deleteCustomer,
}) => {
  return (
    <AnimatePresence>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table className="w-full">
            <Thead>
              <Tr className="bg-gray-50 border-b border-gray-200">
                <Th className="py-4 px-6 text-sm font-semibold text-gray-900 text-left">MOODLE ID</Th>
                <Th className="py-4 px-6 text-sm font-semibold text-gray-900 text-left">NAME</Th>
                <Th className="py-4 px-6 text-sm font-semibold text-gray-900 text-left">EMAIL</Th>
                <Th className="py-4 px-6 text-sm font-semibold text-gray-900 text-left">DEPARTMENT</Th>
                <Th className="py-4 px-6 text-sm font-semibold text-gray-900 text-left">ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFaculty.map((faculty) => (
                <Tr
                  key={faculty.mid}
                  className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200"
                >
                  <Td className="py-4 px-6">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {faculty.mid}
                    </span>
                  </Td>
                  <Td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {`${faculty.fname} ${faculty.lname}`}
                      </span>
                    </div>
                  </Td>
                  <Td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {faculty.social.email}
                      </span>
                    </div>
                  </Td>
                  <Td className="py-4 px-6">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {faculty.academicDetails.branch}
                    </span>
                  </Td>
                  <Td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEdit(faculty.mid)}
                        className="p-1 hover:bg-blue-50 rounded-full transition-colors duration-200"
                        title="Edit faculty"
                      >
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => deleteCustomer(faculty._id)}
                        className="p-1 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete faculty"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </MotionBox>
    </AnimatePresence>
  );
};

export default FacultyTable;