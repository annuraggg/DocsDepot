import React, { useEffect, useState } from 'react';
import { 
  Box,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  Badge,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  useBreakpointValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, ThumbsUp, AlertCircle } from 'lucide-react';
import useAxios from '@/config/axios';

interface Feedback {
  _id: string;
  rating: number;
  review: string;
  createdAt?: string;
  userName?: string;
}

const MotionCard = motion(Card);

const Feedback: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const axios = useAxios();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get('/feedback');
        setFeedback(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load feedback. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, []);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={20}
        fill={index < rating ? 'yellow.400' : 'transparent'}
        color={index < rating ? 'yellow.400' : 'gray.300'}
      />
    ));
  };

  const openFeedbackModal = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    onOpen();
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" thickness="4px" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" variant="left-accent" borderRadius="md">
          <AlertIcon as={AlertCircle} />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Box maxW="7xl" mx="auto">
        <Box textAlign="center" mb={12}>
          <Heading as="h1" size="2xl" mb={4} fontWeight="extrabold">
            Student/Faculty Feedback
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Real experiences from our valued users
          </Text>
        </Box>

        {feedback.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            bg="white"
            p={16}
            borderRadius="xl"
            boxShadow="xl"
          >
            <MessageCircle size={64} color="#CBD5E0" />
            <Heading size="lg" mt={6} mb={3}>
              No Feedback Yet
            </Heading>
            <Text textAlign="center" color="gray.600">
              Be the first to share your experience and help others!
            </Text>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {feedback.map((item, index) => (
              <MotionCard
                key={item._id}
                onClick={() => openFeedbackModal(item)}
                cursor="pointer"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <Heading size="sm">Feedback #{index + 1}</Heading>
                    <Badge colorScheme="blue" variant="subtle">
                      {item.createdAt 
                        ? new Date(item.createdAt).toLocaleDateString() 
                        : 'Recent'}
                    </Badge>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Flex align="center" mb={4}>
                    {renderStars(item.rating)}
                    <Text ml={2} fontSize="sm" color="gray.600">
                      ({item.rating}/5)
                    </Text>
                  </Flex>
                  <Text 
                    color="gray.700" 
                    noOfLines={3}
                    fontSize="md"
                    lineHeight="tall"
                  >
                    {item.review}
                  </Text>
                  <Flex mt={4} justify="space-between" align="center">
                    {item.userName && (
                      <Text fontSize="sm" color="blue.600" fontWeight="medium">
                        {item.userName}
                      </Text>
                    )}
                    <Box 
                      as={ThumbsUp} 
                      size={20} 
                      color="#CBD5E0" 
                      _hover={{ color: 'blue.500' }}
                    />
                  </Flex>
                </CardBody>
              </MotionCard>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {selectedFeedback && (
        <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "md"}>
          <ModalOverlay />
          <ModalContent mx={isMobile ? 0 : 4}>
            <ModalHeader>
              <Flex justify="space-between" align="center">
                <Text>Detailed Feedback</Text>
                <Badge colorScheme="blue">
                  {selectedFeedback.createdAt 
                    ? new Date(selectedFeedback.createdAt).toLocaleDateString() 
                    : 'Recent'}
                </Badge>
              </Flex>
            </ModalHeader>
            <ModalBody>
              <Flex align="center" mb={4}>
                {renderStars(selectedFeedback.rating)}
                <Text ml={2} fontSize="sm" color="gray.600">
                  ({selectedFeedback.rating}/5 Rating)
                </Text>
              </Flex>
              <Text color="gray.800" mb={4} lineHeight="tall">
                {selectedFeedback.review}
              </Text>
              {selectedFeedback.userName && (
                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                  - {selectedFeedback.userName}
                </Text>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default Feedback;