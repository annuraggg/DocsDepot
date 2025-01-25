import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, ThumbsUp, AlertCircle } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Heading, 
  Badge, 
  Alert, 
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import useAxios from '@/config/axios';

interface Feedback {
  _id: string;
  rating: number;
  review: string;
  createdAt?: string;
  userName?: string;
}

const Feedback: React.FC = () => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const openFeedbackModal = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    onOpen();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert status="error" variant="left-accent">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight">
            Student/Faculty Feedback
          </h1>
          <p className="text-xl opacity-80">
            Real experiences from our valued users
          </p>
        </div>

        {feedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-16 shadow-2xl">
            <MessageCircle className="mb-6 h-16 w-16" />
            <p className="text-2xl font-semibold mb-3">
              No Feedback Yet
            </p>
            <p className="text-center">
              Be the first to share your experience and help others!
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {feedback.map((item, index) => (
              <motion.div 
                key={item._id} 
                variants={itemVariants}
                onClick={() => openFeedbackModal(item)}
                className="cursor-pointer"
              >
                <Card 
                  className="group h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  variant="elevated"
                >
                  <CardHeader className="flex justify-between items-center pb-2">
                    <Heading size="sm">
                      Feedback #{index + 1}
                    </Heading>
                    <Badge 
                      colorScheme="blue" 
                      variant="subtle"
                    >
                      {item.createdAt 
                        ? new Date(item.createdAt).toLocaleDateString() 
                        : 'Recent'}
                    </Badge>
                  </CardHeader>
                  <CardBody>
                    <div className="flex items-center mb-4">
                      {renderStars(item.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({item.rating}/5)
                      </span>
                    </div>
                    <p className="text-gray-700 line-clamp-3">
                      {item.review}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      {item.userName && (
                        <span className="text-sm text-blue-600 font-medium">
                          {item.userName}
                        </span>
                      )}
                      <ThumbsUp className="ml-auto h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {selectedFeedback && (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <div className="flex justify-between items-center">
                <span>Detailed Feedback</span>
                <Badge colorScheme="blue">
                  {selectedFeedback.createdAt 
                    ? new Date(selectedFeedback.createdAt).toLocaleDateString() 
                    : 'Recent'}
                </Badge>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="flex items-center mb-4">
                {renderStars(selectedFeedback.rating)}
                <span className="ml-2 text-sm text-gray-600">
                  ({selectedFeedback.rating}/5 Rating)
                </span>
              </div>
              <p className="text-gray-800 mb-4">{selectedFeedback.review}</p>
              {selectedFeedback.userName && (
                <div className="text-sm text-blue-600 font-medium">
                  - {selectedFeedback.userName}
                </div>
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
    </div>
  );
};

export default Feedback;