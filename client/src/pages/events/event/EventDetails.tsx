import { Table, Tbody, Td, Tr, Text, Flex } from "@chakra-ui/react";
import { Calendar, MapPin, Activity, Circle } from "lucide-react";
import { motion } from "framer-motion";
import {Event as IEvent} from "@shared-types/Event"

interface EventDetailsProps {
  event: IEvent;
  date: string;
  dateOptions: Intl.DateTimeFormatOptions;
}

export const EventDetails = ({ event, date, dateOptions }: EventDetailsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <Table variant="simple" className="table-fixed">
        <Tbody>
          <Tr>
            <Td width="40px">
              <Calendar className="w-5 h-5 text-blue-500" />
            </Td>
            <Td className="text-gray-600">Start Date Time</Td>
            <Td className="text-gray-800">
              {new Date(event?.eventStarts).toLocaleDateString("en-US", dateOptions)}
            </Td>
          </Tr>
          <Tr>
            <Td>
              <MapPin className="w-5 h-5 text-red-500" />
            </Td>
            <Td className="text-gray-600">Location</Td>
            <Td className="text-gray-800">
              {event?.location?.slice(0, 1).toUpperCase() + event?.location?.slice(1)}
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Activity className="w-5 h-5 text-green-500" />
            </Td>
            <Td className="text-gray-600">Type</Td>
            <Td className="text-gray-800">
              {event?.mode?.slice(0, 1).toUpperCase() + event?.mode?.slice(1)}
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Circle className="w-5 h-5" />
            </Td>
            <Td className="text-gray-600">Status</Td>
            <Td>
              <Flex alignItems="center" gap={2}>
                <Circle 
                  className={`w-2 h-2 ${
                    new Date(event.eventStarts) < new Date(date)
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                  fill="currentColor"
                />
                <Text>
                  {new Date(event.eventStarts) < new Date(date)
                    ? "Expired"
                    : "Active"}
                </Text>
              </Flex>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </motion.div>
  );
};