import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, ThumbsUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@chakra-ui/react';
import { Card, CardHeader, CardBody, Heading } from '@chakra-ui/react';
import { Badge } from '@chakra-ui/react';
import useAxios from '@/config/axios';

interface Feedback {
  rating: number;
  review: string;
  createdAt?: string;
}

const Feedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const axios = useAxios();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get('/feedback');
        setFeedback(response.data.data);
      } catch (err) {
        setError('Failed to load feedback. Please try again later.');
      } finally {
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
            Customer Feedback
          </h1>
          <p className="text-lg text-gray-600">
            See what our customers are saying about us
          </p>
        </div>

        {feedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-12 shadow-lg">
            <MessageCircle className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-xl font-medium text-gray-600">No feedback yet</p>
            <p className="mt-2 text-gray-500">Be the first to leave a review!</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {feedback.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Heading as="h3" size="sm" className="text-sm font-medium">
                      Feedback #{index + 1}
                    </Heading>
                    <Badge 
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </Badge>
                  </CardHeader>
                  <CardBody>
                    <div className="mb-4 flex items-center space-x-1">
                      {renderStars(item.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({item.rating}/5)
                      </span>
                    </div>
                    <p className="text-gray-700">{item.review}</p>
                    <div className="mt-4 flex items-center justify-end">
                      <ThumbsUp className="h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-500" />
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Feedback;