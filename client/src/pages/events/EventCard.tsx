import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ExternalLink, Clock, Tag } from 'lucide-react';
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
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={event.image || '/api/placeholder/400/320'}
          alt={event.name || 'Event'}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[status].color}`}>
            <StatusIcon className="w-4 h-4" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {event.name || 'Untitled Event'}
        </h3>
        
        <div className="space-y-3">
          {event.eventTimeline?.start && (
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <span>{new Date(event.eventTimeline.start).toLocaleDateString()}</span>
            </div>
          )}
          
          {event.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              <span>{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <Tag className="w-4 h-4 mr-2 text-blue-500" />
            <span className="capitalize">{event.registerationType} Registration</span>
          </div>

          {event.registerationType === "internal" && (
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              <span>{event.participants?.length || 0} registered</span>
            </div>
          )}
        </div>
        
        <Link 
          to={`/events/${event._id}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
          <ExternalLink className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </motion.div>
  );
};