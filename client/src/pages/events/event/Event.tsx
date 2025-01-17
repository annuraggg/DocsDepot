import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import papa from "papaparse";
import {
  Box,
  Button,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Text,
  Flex,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { EventHeader } from "./EventHeader";
import { EventDetails } from "./EventDetails";
import { EventActions } from "./EventActions";
import { EditEventModal } from "./EditEventModal";
import { Token } from "@shared-types/Token";
import { Event as IEvent } from "@shared-types/Event";
import { Role, User } from "@shared-types/User";
import useAxios from "../../../config/axios";
import { Download, UserMinus, UserPlus } from "lucide-react";

const Event = () => {
  const navigate = useNavigate();
  const [decoded, setDecoded] = useState<Token>({} as Token);
  const [editPrivilege, setEditPrivilege] = useState(false);
  const [role, setRole] = useState<Role>("S");
  const [event, setEvent] = useState<IEvent>({} as IEvent);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [deregisterLoading, setDeregisterLoading] = useState(false);
  const [allocatePoints, setAllocatePoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<User[]>([]);
  const [update, setUpdate] = useState(false);

  // Form state
  const [eventName, setEventName] = useState("");
  const [eventImage, setEventImage] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventMode, setEventMode] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [eventEmail, setEventEmail] = useState("");
  const [eventPhone, setEventPhone] = useState("");
  const [eventStarts, setEventStarts] = useState("");
  const [eventEnds, setEventEnds] = useState("");
  const [registerationStarts, setRegisterationStarts] = useState("");
  const [registerationEnds, setRegisterationEnds] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [registerationStartTime, setRegisterationStartTime] = useState("");
  const [registerationEndTime, setRegisterationEndTime] = useState("");

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAllocateOpen,
    onOpen: onAllocateOpen,
    onClose: onAllocateClose,
  } = useDisclosure();
  const {
    isOpen: isParticipantsOpen,
    onOpen: onParticipantsOpen,
    onClose: onParticipantsClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const allocateRef = useRef<HTMLButtonElement>(null);
  const axios = useAxios();

  useEffect(() => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const decoded = jwtDecode(token) as Token;
      setDecoded(decoded);
      if (decoded.role === "") return;
      setRole(decoded.role);
      if (decoded.role === "A" || decoded.perms?.includes("MHI")) {
        setEditPrivilege(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const id = window.location.pathname.split("/")[2];

    axios.get(`/events/${id}`).then((res) => {
      setEvent(res.data.data);
      setEventName(res.data.data.name);
      setEventImage(res.data.data.image);
      setEventDesc(res.data.data.desc);
      setEventLocation(res.data.data.location);
      setEventMode(res.data.data.mode);
      setEventLink(res.data.data.link);
      setEventEmail(res.data.data.email);
      setEventPhone(res.data.data.phone);
      setParticipants(res.data.data.participants);

      const eventStartsDate = new Date(res.data.data.eventStarts);
      const eventEndsDate = new Date(res.data.data.eventEnds);
      const registerationStartsDate = new Date(res.data.data.registerationStarts);
      const registerationEndsDate = new Date(res.data.data.registerationEnds);

      // Adjust for timezone
      [eventStartsDate, eventEndsDate, registerationStartsDate, registerationEndsDate].forEach(date => {
        date.setHours(date.getHours() + 5);
        date.setMinutes(date.getMinutes() + 30);
      });

      setEventStarts(eventStartsDate.toISOString().split("T")[0]);
      setEventEnds(eventEndsDate.toISOString().split("T")[0]);
      setRegisterationStarts(registerationStartsDate.toISOString().split("T")[0]);
      setRegisterationEnds(registerationEndsDate.toISOString().split("T")[0]);

      setEventStartTime(eventStartsDate.toISOString().split("T")[1].slice(0, 5));
      setEventEndTime(eventEndsDate.toISOString().split("T")[1].slice(0, 5));
      setRegisterationStartTime(registerationStartsDate.toISOString().split("T")[1].slice(0, 5));
      setRegisterationEndTime(registerationEndsDate.toISOString().split("T")[1].slice(0, 5));

      setLoading(false);
    });
  }, [update]);

  const date = new Date().toISOString();
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const updateEvent = () => {
    if (eventStarts > eventEnds ||
      registerationStarts > registerationEnds ||
      registerationStarts > eventStarts ||
      registerationEnds > eventStarts) {
      toast({
        title: "Error",
        description: "Invalid date configuration",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    axios.put(`/events/${event._id}`, {
      name: eventName,
      image: eventImage,
      desc: eventDesc,
      location: eventLocation,
      mode: eventMode,
      link: eventLink,
      email: eventEmail,
      phone: eventPhone,
      eventStarts: new Date(`${eventStarts}T${eventStartTime}:00`).toISOString(),
      eventEnds: new Date(`${eventEnds}T${eventEndTime}:00`).toISOString(),
      registerationStarts: new Date(`${registerationStarts}T${registerationStartTime}:00`).toISOString(),
      registerationEnds: new Date(`${registerationEnds}T${registerationEndTime}:00`).toISOString(),
    });
  };

  const deleteEvent = () => {
    axios.delete(`/events/${event._id}`).then((res) => {
      if (res.status === 200) {
        toast({
          title: "Success",
          description: "Event Deleted Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        navigate("/events");
      } else {
        toast({
          title: "Error",
          description: "Some error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    });
  };

  const register = () => {
    setRegisterLoading(true);
    axios.post(`/events/${event._id}/register`).then((res) => {
      setRegisterLoading(false);
      if (res.status === 200) {
        toast({
          title: "Success",
          description: "Registered Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setUpdate(!update);
      }
    });
  };

  const deregister = () => {
    setDeregisterLoading(true);
    axios.post(`/events/${event._id}/deregister`).then((res) => {
      setDeregisterLoading(false);
      if (res.status === 200) {
        toast({
          title: "Success",
          description: "De-registered Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setUpdate(!update);
      }
    });
  };

  const allocate = () => {
    axios
      .post(`/events/${event._id}/allocate`, { points: allocatePoints })
      .then((res) => {
        if (res.status === 200) {
          toast({
            title: "Success",
            description: "Points Allocated Successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setUpdate(!update);
          onAllocateClose();
        }
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Some error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const exportCSV = () => {
    const csv = papa.unparse(participants);
    const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "participants.csv");
    tempLink.click();
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <EventHeader event={event} loading={loading} />

      <Flex gap={8} className="mb-8">
        <Box flex={1}>
          <EventDetails event={event} date={date} dateOptions={dateOptions} />
        </Box>
      </Flex>

      <EventActions
        editPrivilege={editPrivilege}
        event={event}
        onOpen={onOpen}
        onDeleteOpen={onDeleteOpen}
        onParticipantsOpen={onParticipantsOpen}
        onAllocateOpen={onAllocateOpen}
        date={date}
      />

      <EditEventModal
        isOpen={isOpen}
        onClose={onClose}
        event={event}
        eventName={eventName}
        setEventName={setEventName}
        eventImage={eventImage}
        setEventImage={setEventImage}
        eventDesc={eventDesc}
        setEventDesc={setEventDesc}
        eventLocation={eventLocation}
        setEventLocation={setEventLocation}
        eventMode={eventMode}
        setEventMode={setEventMode}
        eventLink={eventLink}
        setEventLink={setEventLink}
        eventEmail={eventEmail}
        setEventEmail={setEventEmail}
        eventPhone={eventPhone}
        setEventPhone={setEventPhone}
        eventStarts={eventStarts}
        setEventStarts={setEventStarts}
        eventEnds={eventEnds}
        setEventEnds={setEventEnds}
        registerationStarts={registerationStarts}
        setRegisterationStarts={setRegisterationStarts}
        registerationEnds={registerationEnds}
        setRegisterationEnds={setRegisterationEnds}
        eventStartTime={eventStartTime}
        setEventStartTime={setEventStartTime}
        eventEndTime={eventEndTime}
        setEventEndTime={setEventEndTime}
        registerationStartTime={registerationStartTime}
        setRegisterationStartTime={setRegisterationStartTime}
        registerationEndTime={registerationEndTime}
        setRegisterationEndTime={setRegisterationEndTime}
        updateEvent={updateEvent}
      />

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Event</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>
              Are you sure? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={deleteEvent} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isAllocateOpen}
        leastDestructiveRef={allocateRef}
        onClose={onAllocateClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Allocate Points</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>
              <Text mb={4}>How many points would you like to allocate?</Text>
              <Input
                type="number"
                value={allocatePoints}
                onChange={(e) => setAllocatePoints(parseInt(e.target.value))}
              />
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={allocateRef} onClick={onAllocateClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={allocate} ml={3}>
                Allocate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={isParticipantsOpen} onClose={onParticipantsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Participants</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Registration</Th>
                </Tr>
              </Thead>
              <Tbody>
                {participants.map((participant) => (
                  <Tr key={participant._id}>
                    <Td>{participant.name}</Td>
                    <Td>{participant.email}</Td>
                    <Td>{participant.phone}</Td>
                    <Td>
                      {new Date(
                        participant.registeredAt || ""
                      ).toLocaleDateString("en-US", dateOptions)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={exportCSV}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Button variant="ghost" onClick={onParticipantsClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {!editPrivilege && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {decoded.id && (
            <Box mt={6}>
              {event?.participants?.some(
                (participant) => participant._id === decoded.id
              ) ? (
                <Button
                  colorScheme="red"
                  onClick={deregister}
                  isLoading={deregisterLoading}
                  leftIcon={<UserMinus className="w-4 h-4" />}
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  De-register
                </Button>
              ) : (
                <Button
                  colorScheme="blue"
                  onClick={register}
                  isLoading={registerLoading}
                  isDisabled={
                    new Date(date) < new Date(event.registerationStarts) ||
                    new Date(date) > new Date(event.registerationEnds)
                  }
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  Register
                </Button>
              )}
            </Box>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Event;