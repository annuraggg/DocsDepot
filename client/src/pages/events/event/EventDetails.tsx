import { Grid, Text } from "@chakra-ui/react";
import { Calendar, MapPin, Activity, Circle, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { ExtendedEvent as IEvent } from "@shared-types/ExtendedEvent";
interface EventDetailsProps {
  event: IEvent;
  date: string;
  dateOptions: Intl.DateTimeFormatOptions;
}

export const EventDetails = ({
  event,
  date,
  dateOptions,
}: EventDetailsProps) => {
  const statusColor =
    event?.eventTimeline?.start &&
    new Date(event.eventTimeline.start) < new Date(date)
      ? "text-red-500"
      : "text-green-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Grid
        templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        gap={6}
        className="w-full"
      >
        <DetailCard
          icon={<Calendar className="w-6 h-6 text-blue-500" />}
          title="Event Timeline"
          value={
            <>
              <Text className="font-medium">
                Starts:{" "}
                {new Date(event?.eventTimeline?.start).toLocaleDateString(
                  "en-US",
                  dateOptions
                )}
              </Text>
              <Text className="font-medium">
                Ends:{" "}
                {new Date(event?.eventTimeline?.end).toLocaleDateString(
                  "en-US",
                  dateOptions
                )}
              </Text>
            </>
          }
        />

        <DetailCard
          icon={<Clock className="w-6 h-6 text-purple-500" />}
          title="Registration Period"
          value={
            <>
              <Text className="font-medium">
                Opens:{" "}
                {new Date(event?.registeration.start).toLocaleDateString(
                  "en-US",
                  dateOptions
                )}
              </Text>
              <Text className="font-medium">
                Closes:{" "}
                {new Date(event?.registeration.end).toLocaleDateString(
                  "en-US",
                  dateOptions
                )}
              </Text>
            </>
          }
        />

        <DetailCard
          icon={<MapPin className="w-6 h-6 text-red-500" />}
          title="Location"
          value={
            event?.location?.slice(0, 1).toUpperCase() +
            event?.location?.slice(1)
          }
        />

        <DetailCard
          icon={<Activity className="w-6 h-6 text-green-500" />}
          title="Event Type"
          value={event?.mode?.slice(0, 1).toUpperCase() + event?.mode?.slice(1)}
        />

        <DetailCard
          icon={<Users className="w-6 h-6 text-orange-500" />}
          title="Participants"
          value={`${event?.participants?.length || 0} registered`}
        />

        <DetailCard
          icon={<Circle className={`w-6 h-6 ${statusColor}`} />}
          title="Status"
          value={
            <div className="flex items-center gap-2">
              <Circle
                className={`w-3 h-3 ${statusColor}`}
                fill="currentColor"
              />
              <span className="font-medium">
                {event?.eventTimeline?.start &&
                new Date(event.eventTimeline.start) < new Date(date)
                  ? "Expired"
                  : "Active"}
              </span>
            </div>
          }
        />
      </Grid>
    </motion.div>
  );
};

const DetailCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <Text className="text-sm text-gray-500 mb-1">{title}</Text>
        <div className="text-gray-900">{value}</div>
      </div>
    </div>
  </div>
);
