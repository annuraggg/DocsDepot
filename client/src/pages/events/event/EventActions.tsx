import { Button, ButtonGroup } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Event as IEvent } from "@shared-types/Event";
import { Award, Edit, Trash, Users } from "lucide-react";

interface EventActionsProps {
  editPrivilege: boolean;
  event: IEvent;
  onOpen: () => void;
  onDeleteOpen: () => void;
  onParticipantsOpen: () => void;
  onAllocateOpen: () => void;
  date: string;
}

export const EventActions = ({
  editPrivilege,
  event,
  onOpen,
  onDeleteOpen,
  onParticipantsOpen,
  onAllocateOpen,
  date,
}: EventActionsProps) => {
  const isEventEnded = event?.eventTimeline?.end ? new Date(event?.eventTimeline?.start) < new Date(date) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="sticky bottom-6 mt-8"
    >
      {editPrivilege && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-4 max-w-3xl mx-auto">
          <ButtonGroup spacing={4} className="flex flex-wrap gap-4 justify-center">
            <Button
              colorScheme="blue"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={onOpen}
              className="px-6 py-4 shadow-md hover:shadow-lg transition-all"
            >
              Edit Event
            </Button>
            
            <Button
              colorScheme="red"
              variant="outline"
              leftIcon={<Trash className="w-4 h-4" />}
              onClick={onDeleteOpen}
              className="px-6 py-4 hover:bg-red-50 transition-colors"
            >
              Delete Event
            </Button>
            
            <Button
              colorScheme="purple"
              leftIcon={<Users className="w-4 h-4" />}
              onClick={onParticipantsOpen}
              className="px-6 py-4 shadow-md hover:shadow-lg transition-all"
            >
              View Participants
            </Button>

            {isEventEnded && !event?.pointsAllocated && (
              <Button
                colorScheme="orange"
                leftIcon={<Award className="w-4 h-4" />}
                onClick={onAllocateOpen}
                className="px-6 py-4 shadow-md hover:shadow-lg transition-all"
              >
                Allocate Points
              </Button>
            )}
          </ButtonGroup>
        </div>
      )}
    </motion.div>
  );
};