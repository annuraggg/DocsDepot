import { Box, Table, Thead, Tbody, Tr, Td } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Certificate } from "@shared-types/Certificate";
import { Award, ExternalLink } from "lucide-react";

const MotionBox = motion(Box);
const MotionTr = motion(Tr);

interface CertificationsTableProps {
  certifications?: Certificate[];
}

export const CertificationsTable: React.FC<CertificationsTableProps> = ({
  certifications,
}) => {
  const navigate = useNavigate();

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 w-full h-[41.5vh] overflow-auto"
    >
      <Table>
        <Thead className="bg-gray-50 sticky top-0">
          <Tr>
            <Td className="font-semibold">Sr. No</Td>
            <Td className="font-semibold">Certificate</Td>
            <Td className="font-semibold">Organization</Td>
            <Td className="font-semibold">Type</Td>
            <Td className="font-semibold">Date</Td>
            <Td className="font-semibold">Action</Td>
          </Tr>
        </Thead>
        <Tbody>
          {certifications?.map((certification, index) => (
            <MotionTr
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
              className="group"
            >
              <Td>{index + 1}</Td>
              <Td className="flex items-center gap-2">
                <Award className="text-purple-500" size={16} />
                {certification?.name}
              </Td>
              <Td>{certification?.issuingOrganization}</Td>
              <Td>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  certification?.type === 'internal' ? 'bg-purple-100 text-purple-700' :
                  certification?.type === 'external' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {certification?.type}
                </span>
              </Td>
              <Td>
                {certification?.issueDate.month} {certification.issueDate.year}
              </Td>
              <Td>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
                  onClick={() => navigate(`/certificates/${certification._id}`)}
                >
                  View
                  <ExternalLink size={14} />
                </motion.button>
              </Td>
            </MotionTr>
          ))}
        </Tbody>
      </Table>
    </MotionBox>
  );
};