import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { 
  useDisclosure, 
  Box,
  Heading,
  Text,
} from '@chakra-ui/react';
import { EventCard } from './EventCard';
import { EventFilters } from './EventFilters';
import { CreateEventModal } from './CreateEventModal';
import { useEvents } from './useEvents';
import { Event } from '@shared-types/Event';
import Loader from '@/components/Loader';

export const Events = () => {
  const { events, isLoading, error, createEvent, editPrivilege } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedFilters, setSelectedFilters] = useState(['active', 'upcoming', 'expired']);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (events.length > 0) {
      setFilteredEvents([...events].reverse());
    }
  }, [events]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredEvents([...events].reverse());
      return;
    }

    const filtered = events.filter((event) =>
      event.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEvents(filtered);
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
    if (filters.length === 0) {
      setFilteredEvents([...events].reverse());
      return;
    }

    const date = new Date();
    const filtered = events.filter((event) => {
      const isActive = filters.includes('active') &&
        new Date(event.eventTimeline.start) <= date &&
        new Date(event.eventTimeline.end) >= date;
      
      const isUpcoming = filters.includes('upcoming') &&
        new Date(event.eventTimeline.start) > date;
      
      const isExpired = filters.includes('expired') &&
        new Date(event.eventTimeline.end) < date;

      return isActive || isUpcoming || isExpired;
    });

    setFilteredEvents([...filtered].reverse());
  };

  const handleCreateEvent = async (data: Partial<Event>) => {
    const success = await createEvent(data);
    if (success) {
      onClose();
    }
  };

  if (isLoading) return <Loader />;
  
  if (error) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Text className="text-red-500">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Heading as="h1" size="2xl" className="mb-4">Events</Heading>
          <Text className="text-gray-600">Discover and manage upcoming events</Text>
        </div>

        <EventFilters
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onModeFilterChange={() => {}}
          onPointsFilterChange={() => {}}
          selectedFilters={selectedFilters}
          selectedMode=""
          pointsRange={[0, 100]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {editPrivilege && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpen}
              className="h-full min-h-[400px] rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Create new event
              </span>
            </motion.button>
          )}
          
          <AnimatePresence>
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <CreateEventModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleCreateEvent}
      />
    </motion.div>
  );
};

export default Events;