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
  Grid,
  useBreakpointValue,
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
  const isMobile = useBreakpointValue({ base: true, md: false });

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
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        }}
        gap={6}
      >
        {/* Points Distribution Card */}
        <Card gridColumn={{ md: '1 / 3' }} variant="elevated">
          <CardHeader pb={2}>
            <Heading size="md">Points Distribution - House Wise</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Box h={{ base: '300px', md: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockHouses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 12 : 14 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      boxShadow: 'md'
                    }}
                  />
                  <Bar 
                    dataKey="points" 
                    fill="#4ECDC4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Certifications Submissions Card */}
        <Card variant="elevated">
          <CardHeader pb={2}>
            <Heading size="md">Certification Submissions</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Box h={{ base: '300px', md: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                  />
                  <YAxis 
                    dataKey="year" 
                    type="category" 
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      boxShadow: 'md'
                    }}
                  />
                  <Bar 
                    dataKey="submissions" 
                    fill="#82ca9d"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Certifications Table Card */}
        <Card 
          gridColumn={{ base: '1', md: '1 / 3' }}
          variant="elevated"
          overflowX="auto"
        >
          <CardHeader>
            <Heading size="md">Certifications Overview</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>Sr No.</Th>
                  <Th>Certificate</Th>
                  <Th>Organization</Th>
                  {!isMobile && (
                    <>
                      <Th>Issue Date</Th>
                      <Th>Type</Th>
                      <Th>Level</Th>
                    </>
                  )}
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockCertifications.map((cert, index) => (
                  <Tr key={cert._id}>
                    <Td fontWeight="medium">{index + 1}</Td>
                    <Td>
                      <HStack spacing={3}>
                        <Icon as={Award} color="green.500" boxSize={5} />
                        <Text fontWeight="medium">{cert.name}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={3}>
                        <Icon as={Building2} color="gray.500" boxSize={5} />
                        <Text>{cert.issuingOrganization}</Text>
                      </HStack>
                    </Td>
                    {!isMobile && (
                      <>
                        <Td>
                          <HStack spacing={3}>
                            <Icon as={Calendar} color="blue.500" boxSize={5} />
                            <Text>
                              {cert.issueDate.month.charAt(0).toUpperCase() +
                              cert.issueDate.month.slice(1)} {cert.issueDate.year}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge
                            px={3}
                            py={1}
                            borderRadius="md"
                            {...getTypeProps(cert.type)}
                          >
                            {cert.type}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            px={3}
                            py={1}
                            borderRadius="md"
                            {...getLevelProps(cert.level)}
                          >
                            {cert.level}
                          </Badge>
                        </Td>
                      </>
                    )}
                    <Td>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="md"
                        {...getStatusProps(cert.status)}
                      >
                        {cert.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        rightIcon={<ChevronRight size={16} />}
                        _hover={{ transform: 'translateX(4px)' }}
                        transition="transform 0.2s"
                      >
                        {isMobile ? 'View' : 'Details'}
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* House Assessment Card */}
        <Card variant="elevated">
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center">
              <Heading size="md">House Progress</Heading>
              <Select
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
                w="fit-content"
                size="sm"
                variant="filled"
              >
                {mockHouses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.name}
                  </option>
                ))}
              </Select>
            </Flex>
          </CardHeader>
          <CardBody pt={0}>
            <Box h={{ base: '300px', md: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 12 : 14 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      boxShadow: 'md'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="points" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
};

export default Home;