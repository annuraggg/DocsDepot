import { Box, Flex, Heading, Image, Skeleton } from "@chakra-ui/react";
import { motion } from "framer-motion";
import {Event as IEvent} from "@shared-types/Event"

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
    >
      <Flex 
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
        alignItems="flex-start"
        gap={8}
      >
        <Image
          src={event?.image}
          fallback={<Skeleton width="300px" height="250px" rounded="lg" />}
          width="300px"
          height="300px"
          objectFit="cover"
          rounded="lg"
          className="shadow-md hover:shadow-xl transition-shadow duration-300"
        />
        
        <Box flex="1">
          <Heading 
            size="xl"
            mb={4}
            className="text-gray-800 font-bold"
          >
            {event?.name}
          </Heading>
          
          <Box
            className="prose prose-lg text-gray-600 max-w-none"
            overflowY="auto"
            maxHeight="270px"
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '24px',
              },
            }}
          >
            {event?.desc}
          </Box>
        </Box>
      </Flex>
    </motion.div>
  );
};