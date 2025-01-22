import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Box,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Button,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { Award, Building2, Calendar, ChevronRight } from 'lucide-react';

interface House {
  id: string;
  name: string;
  color: string;
  points: number;
}

interface Certification {
  _id: string;
  name: string;
  issuingOrganization: string;
  issueDate: {
    month: string;
    year: string;
  };
  type: 'internal' | 'external';
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'expired' | 'pending';
}

const mockHouses: House[] = [
  { id: '1', name: 'Slytherin', color: '#FF6B6B', points: 450 },
  { id: '2', name: 'Gryffindor', color: '#4ECDC4', points: 380 },
  { id: '3', name: 'Ravenclaw', color: '#45B7D1', points: 520 },
  { id: '4', name: 'Hufflepuff', color: '#96CEB4', points: 290 }
];

const mockCertifications: Certification[] = [
  {
    _id: '1',
    name: 'Web Development Fundamentals',
    issuingOrganization: 'TechCert Academy',
    issueDate: { month: 'january', year: '2024' },
    type: 'internal',
    level: 'beginner',
    status: 'active'
  },
  {
    _id: '2',
    name: 'Data Science Specialization',
    issuingOrganization: 'DataLearn Institute',
    issueDate: { month: 'december', year: '2023' },
    type: 'external',
    level: 'intermediate',
    status: 'pending'
  },
  {
    _id: '3',
    name: 'Advanced Cloud Architecture',
    issuingOrganization: 'CloudMasters',
    issueDate: { month: 'november', year: '2023' },
    type: 'external',
    level: 'advanced',
    status: 'expired'
  }
];

const monthlyData = [
  { month: 'Jan', points: 65 },
  { month: 'Feb', points: 85 },
  { month: 'Mar', points: 75 },
  { month: 'Apr', points: 95 },
  { month: 'May', points: 88 },
  { month: 'Jun', points: 76 },
  { month: 'Jul', points: 82 },
  { month: 'Aug', points: 91 },
  { month: 'Sep', points: 84 },
  { month: 'Oct', points: 78 },
  { month: 'Nov', points: 89 },
  { month: 'Dec', points: 92 }
];

const yearData = [
  { year: '1st Year', submissions: 45 },
  { year: '2nd Year', submissions: 38 },
  { year: '3rd Year', submissions: 52 },
  { year: '4th Year', submissions: 29 }
];

const Home: React.FC = () => {
  const [selectedHouse, setSelectedHouse] = useState<string>(mockHouses[0].id);

  const getLevelProps = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return { bg: "emerald.100", color: "emerald.800" };
      case "intermediate":
        return { bg: "orange.100", color: "orange.800" };
      case "advanced":
        return { bg: "red.100", color: "red.800" };
      default:
        return { bg: "gray.100", color: "gray.800" };
    }
  };

  const getTypeProps = (type: string) => {
    return type?.toLowerCase() === "internal"
      ? { bg: "blue.100", color: "blue.800" }
      : { bg: "purple.100", color: "purple.800" };
  };

  const getStatusProps = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { bg: "green.100", color: "green.800" };
      case "expired":
        return { bg: "red.100", color: "red.800" };
      case "pending":
        return { bg: "yellow.100", color: "yellow.800" };
      default:
        return { bg: "gray.100", color: "gray.800" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <Heading size="md">Points Distribution - House Wise</Heading>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockHouses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="points" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Certification Submissions</Heading>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="year" type="category" />
                  <Tooltip />
                  <Bar dataKey="submissions" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Box className="col-span-2 flex-wrap" bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr bg="gray.50" borderBottom="1px" borderColor="gray.200">
                  <Th py={4} px={4} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                    Sr No.
                  </Th>
                  <Th py={4} px={4} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                    Certificate
                  </Th>
                  <Th py={4} px={4} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                    Organization
                  </Th>
                  <Th py={4} px={4} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                    Issue Date
                  </Th>
                  <Th py={4} px={4} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                    Type
                  </Th>
                  <Th py={4} px={4} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                    Level
                  </Th>
                  <Th py={4} px={4} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                    Status
                  </Th>
                  <Th py={4} px={4} fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="initial">
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockCertifications.map((cert, index) => (
                  <Tr
                    key={cert._id}
                    _hover={{ bg: "gray.50" }}
                    transition="background 0.15s"
                    borderBottom="1px"
                    borderColor="gray.200"
                  >
                    <Td py={4} px={4} fontSize="sm" color="gray.900">
                      {index + 1}
                    </Td>
                    <Td py={4} px={4}>
                      <HStack spacing={2}>
                        <Icon as={Award} color="green.500" boxSize={5} />
                        <Text fontSize="sm" fontWeight="medium" color="gray.900">
                          {cert.name}
                        </Text>
                      </HStack>
                    </Td>
                    <Td py={4} px={4}>
                      <HStack spacing={2}>
                        <Icon as={Building2} color="gray.400" boxSize={5} />
                        <Text fontSize="sm" color="gray.600">
                          {cert.issuingOrganization}
                        </Text>
                      </HStack>
                    </Td>
                    <Td py={4} px={4}>
                      <HStack spacing={2}>
                        <Icon as={Calendar} color="blue.400" boxSize={5} />
                        <Text fontSize="sm" color="gray.600">
                          {cert.issueDate.month.charAt(0).toUpperCase() + 
                           cert.issueDate.month.slice(1)} {cert.issueDate.year}
                        </Text>
                      </HStack>
                    </Td>
                    <Td py={4} px={4}>
                      <Badge
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        fontSize="xs"
                        textTransform="initial"
                        fontWeight="medium"
                        {...getTypeProps(cert.type)}
                      >
                        {cert.type.charAt(0).toUpperCase() + cert.type.slice(1)}
                      </Badge>
                    </Td>
                    <Td py={4} px={4}>
                      <Badge
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        fontSize="xs"
                        textTransform="initial"
                        fontWeight="medium"
                        {...getLevelProps(cert.level)}
                      >
                        {cert.level.charAt(0).toUpperCase() + cert.level.slice(1)}
                      </Badge>
                    </Td>
                    <Td py={4} px={4}>
                      <Badge
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="medium"
                        textTransform="initial"
                        {...getStatusProps(cert.status)}
                      >
                        {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                      </Badge>
                    </Td>
                    <Td py={4} px={4}>
                      <Button
                        as="a"
                        href={`/certificates/${cert._id}`}
                        size="sm"
                        variant="ghost"
                        colorScheme="lightblue"
                        rightIcon={<ChevronRight size={16} />}
                        fontSize="sm"
                        fontWeight="medium"
                        _hover={{
                          bg: "blue.50",
                          transform: "translateX(4px)",
                        }}
                        transition="all 0.2s"
                      >
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">House Assessment</Heading>
              <Select
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
                w="150px"
              >
                {mockHouses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.name}
                  </option>
                ))}
              </Select>
            </Flex>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
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
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Home;