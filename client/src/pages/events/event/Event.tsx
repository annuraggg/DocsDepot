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
  Text,
  Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { EventHeader } from "./EventHeader";
import { EventDetails } from "./EventDetails";
import { EventActions } from "./EventActions";
import { EditEventModal } from "./EditEventModal";
import { Token } from "@shared-types/Token";
import {
  ExtendedEvent as IEvent,
  ExtendedUser,
} from "@shared-types/ExtendedEvent";
import useAxios from "../../../config/axios";
import { Download, UserMinus, UserPlus } from "lucide-react";
import Loader from "@/components/Loader";
import { useParams } from "react-router";

const Event = () => {
  const navigate = useNavigate();
  const [decoded, setDecoded] = useState<Token>({} as Token);
  const [editPrivilege, setEditPrivilege] = useState(false);
  const [event, setEvent] = useState<IEvent>({} as IEvent);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [deregisterLoading, setDeregisterLoading] = useState(false);
  const [allocatePoints, setAllocatePoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<ExtendedUser[]>([]);
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
      if (decoded.role === "A" || decoded.perms?.includes("MHI")) {
        setEditPrivilege(true);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Session expired. Please login again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/login");
    }
  }, []);

  const { id } = useParams();
  useEffect(() => {
    setLoading(true);

    axios
      .get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data.data);
        setEventName(res.data.data.name);
        setEventImage(res.data.data.image);
        setEventDesc(res.data.data.desc);
        setEventLocation(res.data.data.location);
        setEventMode(res.data.data.mode);
        setEventLink(res.data.data.link);
        setEventEmail(res.data.data.contact.email);
        setEventPhone(res.data.data.contact.phone);
        setParticipants(res.data.data.participants);

        const eventStartsDate = new Date(res.data.data.eventTimeline.start);
        const eventEndsDate = new Date(res.data.data.eventTimeline.end);
        const registerationStartsDate = new Date(
          res.data.data.registrationTimeline.start
        );
        const registerationEndsDate = new Date(
          res.data.data.registrationTimeline.end
        );

        [
          eventStartsDate,
          eventEndsDate,
          registerationStartsDate,
          registerationEndsDate,
        ].forEach((date) => {
          date.setHours(date.getHours() + 5);
          date.setMinutes(date.getMinutes() + 30);
        });

        setEventStarts(eventStartsDate.toISOString().split("T")[0]);
        setEventEnds(eventEndsDate.toISOString().split("T")[0]);
        setRegisterationStarts(
          registerationStartsDate.toISOString().split("T")[0]
        );
        setRegisterationEnds(registerationEndsDate.toISOString().split("T")[0]);

        setEventStartTime(
          eventStartsDate.toISOString().split("T")[1].slice(0, 5)
        );
        setEventEndTime(eventEndsDate.toISOString().split("T")[1].slice(0, 5));
        setRegisterationStartTime(
          registerationStartsDate.toISOString().split("T")[1].slice(0, 5)
        );
        setRegisterationEndTime(
          registerationEndsDate.toISOString().split("T")[1].slice(0, 5)
        );
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description:
            err.response?.data?.message || "Failed to fetch event details",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        navigate("/events");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [update]);

  const updateEvent = () => {
    if (
      eventStarts > eventEnds ||
      registerationStarts > registerationEnds ||
      registerationStarts > eventStarts ||
      registerationEnds > eventStarts
    ) {
      toast({
        title: "Error",
        description: "Invalid date configuration",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    const data: Partial<IEvent> = {
      name: eventName,
      image: eventImage,
      desc: eventDesc,
      location: eventLocation,
      mode: eventMode as "online" | "offline",
      link: eventLink,
      contact: {
        email: eventEmail,
        phone: eventPhone,
      },

      eventTimeline: {
        start: new Date(`${eventStarts}T${eventStartTime}:00`).toISOString(),
        end: new Date(`${eventEnds}T${eventEndTime}:00`).toISOString(),
      },

      registrationTimeline: {
        start: new Date(`${registerationStarts}T${registerationStartTime}:00`),
        end: new Date(`${registerationEnds}T${registerationEndTime}:00`),
      },
    };

    axios
      .put(`/events/${event._id}`, { ...data })
      .then(() => {
        toast({
          title: "Success",
          description: "Event Updated Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setUpdate(!update);
        onClose();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to update event",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteEvent = () => {
    setLoading(true);
    axios
      .delete(`/events/${event._id}`)
      .then(() => {
        toast({
          title: "Success",
          description: "Event Deleted Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        navigate("/events");
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to delete event",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const register = () => {
    setRegisterLoading(true);
    axios
      .post(`/events/${event._id}/register`)
      .then(() => {
        toast({
          title: "Success",
          description: "Registered Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setUpdate(!update);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to register",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setRegisterLoading(false);
      });
  };

  const deregister = () => {
    setDeregisterLoading(true);
    axios
      .post(`/events/${event._id}/deregister`)
      .then(() => {
        toast({
          title: "Success",
          description: "De-registered Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setUpdate(!update);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to de-register",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setDeregisterLoading(false);
      });
  };

  const allocate = () => {
    setLoading(true);
    axios
      .post(`/events/${event._id}/allocate`, { points: allocatePoints })
      .then(() => {
        toast({
          title: "Success",
          description: "Points Allocated Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setUpdate(!update);
        onAllocateClose();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description:
            err.response?.data?.message || "Failed to allocate points",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
        setAllocatePoints(0);
      });
  };

  const exportCSV = () => {
    const users = participants.map((participant) => ({
      name: `${participant?.user?.fname} ${participant?.user?.lname}`,
      email: participant?.user?.social?.email,
      registeredAt: new Date(
        participant?.registeredAt || ""
      ).toLocaleDateString("en-US", dateOptions),
    }));

    const csv = papa.unparse(users);
    const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "participants.csv");
    tempLink.click();
  };

  const date = new Date().toISOString();
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <EventHeader event={event} loading={loading} />

      <Flex gap={8} className="mb-8 flex-col md:flex-row">
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

      <Modal
        isOpen={isParticipantsOpen}
        onClose={onParticipantsClose}
        size="xl"
      >
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
                  <Th>Registration</Th>
                </Tr>
              </Thead>
              <Tbody>
                {participants.map((participant) => (
                  <Tr key={participant?.user?._id}>
                    <Td>
                      {participant?.user?.fname} {participant?.user?.lname}
                    </Td>
                    <Td>{participant?.user?.social?.email}</Td>

                    <Td>
                      {new Date(
                        participant?.registeredAt || ""
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
          {decoded._id && (
            <Box mt={6}>
              {event?.participants?.some(
                (participant) => participant?.user?._id === decoded._id
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
                    new Date(date) <
                      new Date(event?.registrationTimeline?.start) ||
                    new Date(date) > new Date(event?.registrationTimeline?.end)
                  }
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  Register
                </Button>
              )}

              {new Date(date) <
                new Date(event?.registrationTimeline?.start) && (
                <Text mt={4} color="red.500">
                  Registration has not started yet
                </Text>
              )}

              {new Date(date) > new Date(event?.registrationTimeline?.end) && (
                <Text mt={4} color="red.500">
                  Registration has ended
                </Text>
              )}

              {new Date(date) > new Date(event?.eventTimeline?.end) && (
                <Text mt={4} color="red.500">
                  Event has ended
                </Text>
              )}
            </Box>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Event;
