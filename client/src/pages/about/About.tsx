import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Icon,
  useColorModeValue,
  Link,
  Center,
  Tooltip,
  IconButton,
  Divider,
  Button,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  Mail,
  ExternalLink,
  Github,
  Users,
  Code,
  Heart,
  Award,
  BookOpen,
  Shield,
  Zap,
  Star,
  Sparkles,
} from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  email: string;
  website: string | null;
  githubUsername?: string;
  bio: string;
}

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const TeamMemberCard: React.FC<TeamMember> = ({
  name,
  role,
  email,
  website,
  githubUsername,
  bio,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const gradientBg = useColorModeValue(
    "linear(135deg, blue.400, purple.500, pink.400)",
    "linear(135deg, blue.600, purple.700, pink.600)"
  );

  return (
    <MotionCard
      bg={cardBg}
      borderRadius="3xl"
      border="1px"
      borderColor={borderColor}
      overflow="hidden"
      position="relative"
      _hover={{
        transform: "translateY(-12px) rotateY(3deg)",
        boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.25)",
        borderColor: "blue.300",
      }}
      h="full"
    >
      {/* Decorative Background */}
      <Box
        position="absolute"
        top={0}
        right={0}
        w="120px"
        h="120px"
        bgGradient={gradientBg}
        borderBottomLeftRadius="full"
        opacity={0.1}
      />

      {/* Avatar Section */}
      <Box bgGradient={gradientBg} h="160px" position="relative">
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.100"
          backdropFilter="blur(1px)"
        />
        <Center
          position="absolute"
          bottom="-50px"
          left="50%"
          transform="translateX(-50%)"
        >
          <Box position="relative">
            <Avatar
              size="2xl"
              src={
                githubUsername
                  ? `https://github.com/${githubUsername}.png`
                  : undefined
              }
              name={name}
              border="6px solid white"
              boxShadow="0 12px 40px rgba(0, 0, 0, 0.15)"
            />
            <Box
              position="absolute"
              bottom="8px"
              right="8px"
              bg="green.400"
              borderRadius="full"
              w="24px"
              h="24px"
              border="4px solid white"
            />
          </Box>
        </Center>
      </Box>

      <CardBody pt="60px" pb={8}>
        <VStack spacing={6} align="center">
          <VStack spacing={3} textAlign="center">
            <Heading
              size="lg"
              fontWeight="800"
              bgGradient={gradientBg}
              bgClip="text"
            >
              {name}
            </Heading>
            <Badge
              bgGradient={gradientBg}
              color="white"
              variant="solid"
              borderRadius="full"
              px={5}
              py={2}
              fontSize="sm"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {role}
            </Badge>
          </VStack>

          <Text
            fontSize="sm"
            color="gray.600"
            textAlign="center"
            lineHeight="relaxed"
            px={4}
          >
            {bio}
          </Text>

          <HStack spacing={4}>
            <Tooltip label="Send Email" hasArrow>
              <IconButton
                as={Link}
                href={`mailto:${email}`}
                aria-label="Email"
                icon={<Mail size={20} />}
                colorScheme="blue"
                variant="ghost"
                size="lg"
                borderRadius="full"
                _hover={{ transform: "scale(1.2)", bg: "blue.50" }}
                transition="all 0.2s"
              />
            </Tooltip>
            {website && (
              <Tooltip label="Visit Website" hasArrow>
                <IconButton
                  as={Link}
                  href={website}
                  isExternal
                  aria-label="Website"
                  icon={<ExternalLink size={20} />}
                  colorScheme="green"
                  variant="ghost"
                  size="lg"
                  borderRadius="full"
                  _hover={{ transform: "scale(1.2)", bg: "green.50" }}
                  transition="all 0.2s"
                />
              </Tooltip>
            )}
            {githubUsername && (
              <Tooltip label="GitHub Profile" hasArrow>
                <IconButton
                  as={Link}
                  href={`https://github.com/${githubUsername}`}
                  isExternal
                  aria-label="GitHub"
                  icon={<Github size={20} />}
                  colorScheme="gray"
                  variant="ghost"
                  size="lg"
                  borderRadius="full"
                  _hover={{ transform: "scale(1.2)", bg: "gray.50" }}
                  transition="all 0.2s"
                />
              </Tooltip>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

const About: React.FC = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  const teamMembers: TeamMember[] = [
    {
      name: "Anurag Sawant",
      role: "Full Stack Developer",
      email: "hello@anuragsawant.in",
      website: "https://anuragsawant.in/",
      githubUsername: "annuraggg",
      bio: "Passionate full-stack developer who loves creating innovative solutions for educational technology and document management systems.",
    },
    {
      name: "Shravandeep Yadav",
      role: "Frontend Developer",
      email: "dman1562001@gmail.com",
      website: "https://shravandeepyadav.com/",
      githubUsername: "Spy156",
      bio: "Creative frontend developer focused on delivering exceptional user experiences and modern interface design.",
    },
    {
      name: "Abdul Hadi Shah",
      role: "Designer",
      email: "abdulhadishah2003@gmail.com",
      website: null,
      githubUsername: "abdulhadishah",
      bio: "Talented designer dedicated to creating beautiful, intuitive interfaces and seamless user experience flows.",
    },
  ];

  return (
    <Box bg={bgColor} minH="100vh" position="relative" overflow="hidden">
      {/* Animated Background Elements */}
      <MotionBox
        position="absolute"
        top="15%"
        right="10%"
        w="400px"
        h="400px"
        bgGradient="radial(circle, blue.100, transparent)"
        borderRadius="full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <MotionBox
        position="absolute"
        bottom="20%"
        left="5%"
        w="300px"
        h="300px"
        bgGradient="radial(circle, purple.100, transparent)"
        borderRadius="full"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <Container maxW="8xl" py={8} position="relative">
        {/* Credits Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            bg={cardBg}
            borderRadius="3xl"
            border="1px"
            borderColor={borderColor}
            mb={12}
            position="relative"
            overflow="hidden"
          >
            {/* Decorative Elements */}
            <Box
              position="absolute"
              top={0}
              right={0}
              w="200px"
              h="200px"
              bgGradient="linear(135deg, blue.400, purple.500)"
              borderBottomLeftRadius="full"
              opacity={0.1}
            />
            <Box
              position="absolute"
              bottom={0}
              left={0}
              w="150px"
              h="150px"
              bgGradient="linear(135deg, pink.400, purple.500)"
              borderTopRightRadius="full"
              opacity={0.1}
            />

            <CardBody p={10} position="relative">
              <VStack spacing={8} textAlign="center">
                {/* Project Title */}
                <VStack spacing={4}>
                  <HStack spacing={3}>
                    <MotionBox
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Icon as={Sparkles} color="blue.500" boxSize={12} />
                    </MotionBox>
                    <Heading
                      size="4xl"
                      fontWeight="900"
                      bgGradient="linear(135deg, blue.500, purple.600, pink.500)"
                      bgClip="text"
                    >
                      Docs Depot
                    </Heading>
                  </HStack>
                  <Text fontSize="2xl" color="gray.600" fontWeight="600">
                    Crafted with{" "}
                    <Icon as={Heart} color="red.500" boxSize={6} mx={2} /> by
                    Team Scriptopia
                  </Text>
                </VStack>

                {/* Feature Icons */}
                <HStack spacing={12} justify="center">
                  <Tooltip label="Secure" hasArrow>
                    <Box
                      p={3}
                      borderRadius="full"
                      bg="blue.50"
                      _hover={{ bg: "blue.100", transform: "scale(1.1)" }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <Icon as={Shield} color="blue.500" boxSize={8} />
                    </Box>
                  </Tooltip>
                  <Tooltip label="Fast" hasArrow>
                    <Box
                      p={3}
                      borderRadius="full"
                      bg="green.50"
                      _hover={{ bg: "green.100", transform: "scale(1.1)" }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <Icon as={Zap} color="green.500" boxSize={8} />
                    </Box>
                  </Tooltip>
                  <Tooltip label="Intuitive" hasArrow>
                    <Box
                      p={3}
                      borderRadius="full"
                      bg="purple.50"
                      _hover={{ bg: "purple.100", transform: "scale(1.1)" }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <Icon as={Users} color="purple.500" boxSize={8} />
                    </Box>
                  </Tooltip>
                  <Tooltip label="Modern" hasArrow>
                    <Box
                      p={3}
                      borderRadius="full"
                      bg="orange.50"
                      _hover={{ bg: "orange.100", transform: "scale(1.1)" }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <Icon as={Code} color="orange.500" boxSize={8} />
                    </Box>
                  </Tooltip>
                </HStack>

                <Divider />

                {/* Project Links */}
                <HStack spacing={6}>
                  <Button
                    as={Link}
                    href="https://github.com/annuraggg/DocsDepot"
                    isExternal
                    leftIcon={<Github />}
                    colorScheme="gray"
                    variant="outline"
                    size="lg"
                    borderRadius="full"
                    _hover={{ transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                  >
                    View Source Code
                  </Button>
                  <Button
                    as={Link}
                    href="mailto:hello@anuragsawant.in"
                    leftIcon={<Mail />}
                    colorScheme="blue"
                    variant="outline"
                    size="lg"
                    borderRadius="full"
                    _hover={{ transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                  >
                    Contact Us
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Mission Section */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          mb={12}
        >
          <Card
            bg={cardBg}
            borderRadius="3xl"
            border="1px"
            borderColor={borderColor}
            position="relative"
            overflow="hidden"
          >
            <CardBody p={10}>
              <VStack spacing={8} textAlign="center">
                <VStack spacing={4}>
                  <Icon as={BookOpen} color="blue.500" boxSize={16} />
                  <Heading size="2xl" fontWeight="800">
                    Revolutionizing Document Management
                  </Heading>
                </VStack>

                <Text
                  fontSize="xl"
                  color="gray.700"
                  lineHeight="tall"
                  maxW="4xl"
                >
                  Docs Depot transforms how educational institutions handle
                  certificates and documents. We've built a comprehensive
                  platform that combines security, efficiency, and user
                  experience to create the ultimate document management
                  solution.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Team Section */}
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <HStack spacing={4}>
              <MotionBox
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Icon as={Star} color="gold" boxSize={10} />
              </MotionBox>
              <Heading
                size="2xl"
                fontWeight="800"
                bgGradient="linear(135deg, blue.500, purple.600)"
                bgClip="text"
              >
                Meet the Dream Team
              </Heading>
              <MotionBox
                animate={{
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Icon as={Star} color="gold" boxSize={10} />
              </MotionBox>
            </HStack>
            <Text
              fontSize="xl"
              color="gray.600"
              maxW="3xl"
              lineHeight="relaxed"
            >
              Three passionate creators united by a shared vision: making
              document management effortless, secure, and delightful for
              everyone.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={10} w="full">
            {teamMembers.map((member, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <TeamMemberCard {...member} />
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>

        {/* Footer Stats */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          mt={16}
        >
          <Card
            bg={cardBg}
            borderRadius="3xl"
            border="1px"
            borderColor={borderColor}
          >
            <CardBody p={8}>
              <VStack spacing={6} textAlign="center">
                <VStack spacing={2}>
                  <HStack spacing={3}>
                    <Icon as={Award} color="gold" boxSize={8} />
                    <Heading size="lg" fontWeight="700">
                      Open Source
                    </Heading>
                  </HStack>
                  <Text color="gray.600" maxW="2xl">
                    Built with transparency, collaboration, and community at its
                    core
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default About;
