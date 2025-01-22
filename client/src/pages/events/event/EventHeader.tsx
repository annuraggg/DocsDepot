import { Box, Flex, Heading, Image, Skeleton } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Event as IEvent } from "@shared-types/Event";

interface EventHeaderProps {
  event: IEvent;
  loading: boolean;
}

export const EventHeader = ({ event, loading }: EventHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={event?.image}
            fallback={<Skeleton width="100%" height="100%" />}
            alt={event?.name}
            className="w-full h-full object-cover filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <Heading 
            size="2xl"
            className="mb-4 font-bold text-shadow-lg"
          >
            {event?.name}
          </Heading>
          
          <p className="text-lg text-gray-200 line-clamp-3 max-w-3xl">
            {event?.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
};