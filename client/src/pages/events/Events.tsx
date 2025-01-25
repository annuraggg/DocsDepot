import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import {
  Box,
  Heading,
  Text,
} from '@chakra-ui/react';
import { EventCard } from './EventCard';
import { EventFilters } from './EventFilters';
import { CreateEventModal } from './CreateEventModal';
import { useEvents } from './useEvents';
import { Event, Mode } from '@shared-types/Event';
import Loader from '@/components/Loader';

export const Events = () => {
  const { events, isLoading, error, createEvent, editPrivilege } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['active', 'upcoming', 'expired']);
  const [selectedMode, setSelectedMode] = useState<Mode | ''>('');
  const [pointsRange, setPointsRange] = useState<[number, number]>([0, 100]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (events?.length > 0) {
      applyFilters(events, '', selectedFilters, selectedMode, pointsRange);
    }
  }, [events]);


  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
    applyFilters(events, '', filters, selectedMode, pointsRange);
  };

  const handleModeFilterChange = (mode: Mode | '') => {
    setSelectedMode(mode);
    applyFilters(events, '', selectedFilters, mode, pointsRange);
  };

  const handlePointsFilterChange = (range: [number, number]) => {
    setPointsRange(range);
    applyFilters(events, '', selectedFilters, selectedMode, range);
  };

  const getEventStatus = (event: Event) => {
    if (!event.eventTimeline?.start || !event.eventTimeline?.end) return null;

    const date = new Date();
    const startDate = new Date(event.eventTimeline.start);
    const endDate = new Date(event.eventTimeline.end);

    if (startDate > date) return 'upcoming';
    if (endDate >= date) return 'active';
    return 'expired';
  };

  const applyFilters = (
    eventsList: Event[],
    searchQuery: string,
    filters: string[],
    mode: Mode | '',
    points: [number, number]
  ) => {
    if (!eventsList) return;

    let filtered = [...eventsList];

    if (searchQuery) {
      filtered = filtered.filter((event) =>
        event.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.length > 0) {
      filtered = filtered.filter((event) => {
        const status = getEventStatus(event);
        if (!status) return false;
        return filters.includes(status);
      });
    }

    if (mode) {
      filtered = filtered.filter((event) => event.mode === mode);
    }

    filtered = filtered.filter((event) => {
      const eventPoints = event.points || 0;
      return eventPoints >= points[0] && eventPoints <= points[1];
    });

    filtered.sort((a, b) => {
      const aStart = a.eventTimeline?.start ? new Date(a.eventTimeline.start).getTime() : 0;
      const bStart = b.eventTimeline?.start ? new Date(b.eventTimeline.start).getTime() : 0;
      return bStart - aStart;
    });

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = async (data: Partial<Event>) => {
    const success = await createEvent(data);
    if (success) {
      setIsModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Loader />
      </Box>
    );
  }

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

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-80">
            <EventFilters
              onSearch={(query) =>
                applyFilters(events, query, selectedFilters, selectedMode, pointsRange)
              }
              onFilterChange={handleFilterChange}
              onModeFilterChange={handleModeFilterChange}
              onPointsFilterChange={handlePointsFilterChange}
              selectedFilters={selectedFilters}
              selectedMode={selectedMode}
              pointsRange={pointsRange}
            />
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {editPrivilege && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsModalOpen(true)}
                  className="h-full min-h-[400px] rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Create new event
                  </span>
                </motion.button>
              )}

              <AnimatePresence mode="popLayout">
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

              {filteredEvents.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center p-12 text-center"
                >
                  <Text className="text-xl font-medium text-gray-900 mb-2">
                    No events found
                  </Text>
                  <Text className="text-gray-500">
                    Try adjusting your filters or search terms
                  </Text>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </motion.div>
  );
};

export default Events;