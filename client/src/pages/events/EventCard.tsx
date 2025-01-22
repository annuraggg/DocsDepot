import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ExternalLink, Clock, User } from 'lucide-react';
import { Link } from 'react-router';
import { Event } from '@shared-types/Event';

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const date = new Date();

  const getEventStatus = () => {
    if (!event.eventTimeline) return 'unknown';

    try {
      if (new Date(event.eventTimeline.start) > date) return 'upcoming';
      if (new Date(event.eventTimeline.end) > date) return 'ongoing';
      return 'expired';
    } catch (error) {
      console.error('Error parsing event dates:', error);
      return 'unknown';
    }
  };

  const statusConfig = {
    upcoming: { color: 'bg-emerald-100 text-emerald-800', icon: Clock },
    ongoing: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
    expired: { color: 'bg-red-100 text-red-800', icon: Clock },
    unknown: { color: 'bg-gray-100 text-gray-800', icon: Clock }
  };

  const status = getEventStatus();
  const StatusIcon = statusConfig[status].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        <img
          src={event.image || '/api/placeholder/400/320'}
          alt={event.name || 'Event'}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {event.name || 'Untitled Event'}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-md ${statusConfig[status].color}`}>
              <StatusIcon className="w-4 h-4" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {event.mode && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/90 text-gray-800">
                <User className="w-4 h-4" />
                {event.mode.charAt(0).toUpperCase() + event.mode.slice(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-gray-600 line-clamp-2 min-h-[3rem]">
          {event.desc || 'No description available'}
        </p>

        <div className="space-y-3">
          {event.eventTimeline?.start && (
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
              <span className="text-sm">
                {new Date(event.eventTimeline.start).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}

          {event.registerationType === "internal" && (
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
              <span className="text-sm">{event.participants?.length || 0} registered</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Link
            to={`/events/${event._id}`}
            className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Details
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};