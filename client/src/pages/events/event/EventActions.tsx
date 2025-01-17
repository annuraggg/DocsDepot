import { Button, ButtonGroup } from "@chakra-ui/react";
import { motion } from "framer-motion";
import {Event as IEvent} from "@shared-types/Event"
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {editPrivilege && (
        <ButtonGroup spacing={4} className="mt-6">
          <Button
            colorScheme="blue"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={onOpen}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            Edit Event
          </Button>
          
          <Button
            colorScheme="red"
            leftIcon={<Trash className="w-4 h-4" />}
            onClick={onDeleteOpen}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            Delete Event
          </Button>
          
          <Button
            colorScheme="green"
            leftIcon={<Users className="w-4 h-4" />}
            onClick={onParticipantsOpen}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            View Participants
          </Button>

          {new Date(event?.eventEnds) < new Date(date) && !event?.pointsAllocated && (
            <Button
              colorScheme="orange"
              leftIcon={<Award className="w-4 h-4" />}
              onClick={onAllocateOpen}
              className="shadow-md hover:shadow-lg transition-shadow"  
            >
              Allocate Points
            </Button>
          )}
        </ButtonGroup>
      )}
    </motion.div>
  );
};