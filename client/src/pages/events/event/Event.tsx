import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Image,
  useDisclosure,
  Skeleton,
  Table,
  Modal,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tbody,
  Td,
  Tr,
  useToast,
  Link,
  Button,
  Input,
  Select,
  FormControl,
  Textarea,
  InputGroup,
  InputLeftAddon,
  Text,
  Thead,
  Th,
} from "@chakra-ui/react";

import { useNavigate } from "react-router";
import papa from "papaparse";
import { Token } from "@shared-types/Token";
import { Event as IEvent } from "@shared-types/Event";
import { Role, User } from "@shared-types/User";
import useAxios from "@/config/axios";

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
  const [participants, setParticipants] = useState<User[]>([]);

  const [update, setUpdate] = useState(false);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const cancelDeleteRef = React.useRef<HTMLButtonElement>(null);
  const allocateRef = React.useRef<HTMLButtonElement>(null);

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

  const axios = useAxios();

  useEffect(() => {
    const id = window.location.pathname.split("/")[2];

    axios.get(`/events/${id}`).then((res) => {
      console.log(res.data);
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
      const registerationStartsDate = new Date(
        res.data.data.registerationStarts
      );
      const registerationEndsDate = new Date(res.data.data.registerationEnds);

      eventStartsDate.setHours(eventStartsDate.getHours() + 5);
      eventStartsDate.setMinutes(eventStartsDate.getMinutes() + 30);

      eventEndsDate.setHours(eventEndsDate.getHours() + 5);
      eventEndsDate.setMinutes(eventEndsDate.getMinutes() + 30);

      registerationStartsDate.setHours(registerationStartsDate.getHours() + 5);
      registerationStartsDate.setMinutes(
        registerationStartsDate.getMinutes() + 30
      );

      registerationEndsDate.setHours(registerationEndsDate.getHours() + 5);
      registerationEndsDate.setMinutes(registerationEndsDate.getMinutes() + 30);

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
  } as const;

  useEffect(() => {}, [registerationEnds]);

  const updateEvent = () => {
    if (eventStarts > eventEnds) {
      toast({
        title: "Error",
        description: "Event Start Date cannot be after Event End Date",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (registerationStarts > registerationEnds) {
      toast({
        title: "Error",
        description:
          "Registeration Start Date cannot be after Registeration End Date",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (registerationStarts > eventStarts) {
      toast({
        title: "Error",
        description:
          "Registeration Start Date cannot be after Event Start Date",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (registerationEnds > eventStarts) {
      toast({
        title: "Error",
        description: "Registeration End Date cannot be after Event Start Date",
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
      eventStarts: new Date(
        eventStarts + "T" + eventStartTime + ":00"
      ).toISOString(),
      eventEnds: new Date(eventEnds + "T" + eventEndTime + ":00").toISOString(),
      registerationStarts: new Date(
        registerationStarts + "T" + registerationStartTime + ":00"
      ).toISOString(),
      registerationEnds: new Date(
        registerationEnds + "T" + registerationEndTime + ":00"
      ).toISOString(),
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
          description: "Some error occured",
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
      } else {
        toast({
          title: "Error",
          description: "Some error occured",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
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
      } else {
        toast({
          title: "Error",
          description: "Some error occured",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    });
  };

  const [allocateLoading, setAllocateLoading] = useState(false);

  const allocate = () => {
    setAllocateLoading(true);

    axios
      .post(`/events/${event._id}/allocate`, { points: allocatePoints })
      .then((res) => {
        setAllocateLoading(false);
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
        } else {
          toast({
            title: "Error",
            description: "Some error occured",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Some error occured",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setAllocateLoading(false);
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

  if (!loading) {
    return (
      <>
        <Box className="GeneralEvents">
          <Flex mb="30px" className="top">
            <Image
              src={event?.image}
              fallback={<Skeleton width="300px" height="250px" />}
              width="300px"
              height="300px"
              className="image"
            ></Image>

            <Heading mb="30px" className="top-name">
              {event?.name}
            </Heading>

            <Box
              className="description"
              width="70%"
              ml="30px"
              overflowY="auto"
              height="270px"
            >
              {event?.desc}
            </Box>
          </Flex>
          <Box className="details">
            <Heading mb="30px" className="bottom-name">
              {event?.name}
            </Heading>
            <Flex justify="space-between" wrap="wrap" gap="30px">
              <Table width="fit-content" variant="unstyled" size="sm">
                <Tbody>
                  <Tr>
                    <Td>
                      <i className="fa-solid fa-calendar-days"></i>
                    </Td>
                    <Td>Start Date Time</Td>
                    <Td>
                      {new Date(event?.eventStarts).toLocaleDateString(
                        "en-US",
                        dateOptions
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <i className="fa-solid fa-location-crosshairs"></i>
                    </Td>
                    <Td>Location</Td>
                    <Td>
                      {event?.location?.slice(0, 1).toUpperCase() +
                        event?.location?.slice(1)}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <i className="fa-solid fa-lines-leaning"></i>
                    </Td>
                    <Td>Type</Td>
                    <Td>
                      {event?.mode?.slice(0, 1).toUpperCase() +
                        event?.mode?.slice(1)}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <i className="fa-duotone fa-circle-dot"></i>
                    </Td>
                    <Td>Status</Td>
                    <Td display="flex" alignItems="center">
                      <i
                        className="fa-duotone fa-circle-dot"
                        style={
                          {
                            "--fa-primary-color":
                              new Date(event.eventStarts) < new Date(date)
                                ? "red"
                                : "green",
                            "--fa-secondary-color":
                              new Date(event.eventStarts) < new Date(date)
                                ? "red"
                                : "green",
                            marginRight: "5px",
                            fontSize: "10px",
                          } as React.CSSProperties
                        }
                      ></i>
                      {new Date(event.eventStarts) < new Date(date)
                        ? "Expired"
                        : "Active"}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <i className="fa-solid fa-calendar-days"></i>
                    </Td>
                    <Td>End Date Time</Td>
                    <Td>
                      {new Date(event?.eventEnds).toLocaleDateString(
                        "en-US",
                        dateOptions
                      )}
                    </Td>
                  </Tr>
                </Tbody>
              </Table>

              <Table width="fit-content" variant="unstyled" size="sm">
                <Tbody>
                  <Tr>
                    <Td>
                      <i className="fa-solid fa-calendar-days"></i>
                    </Td>
                    <Td> Deadline</Td>
                    <Td>
                      {new Date(event?.registerationEnds).toLocaleDateString(
                        "en-US",
                        dateOptions
                      )}
                    </Td>
                  </Tr>
                  {event.registerationType === "external" ? (
                    <Tr>
                      <Td>
                        <i className="fa-solid fa-link"></i>
                      </Td>
                      <Td>Link to Register</Td>
                      <Td>
                        <Link
                          href={event?.link}
                          onClick={(e) => {
                            if (
                              new Date(event?.registerationEnds) <
                              new Date(date)
                            ) {
                              e.preventDefault();
                            } else {
                              navigate(event?.link || "/");
                            }
                          }}
                          color={
                            new Date(event?.registerationEnds) < new Date(date)
                              ? "red"
                              : "black"
                          }
                        >
                          {new Date(event?.registerationEnds) < new Date(date)
                            ? "Registeration has Ended"
                            : event?.link}
                        </Link>
                      </Td>
                    </Tr>
                  ) : null}
                  <Tr>
                    <Td>
                      <i className="fa-solid fa-envelope"></i>
                    </Td>
                    <Td>Contact Email</Td>
                    <Td>{event?.email}</Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <i className="fa-solid fa-phone"></i>
                    </Td>
                    <Td>Contact Phone</Td>
                    <Td>{event?.phone}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </Flex>
            {editPrivilege ? (
              <>
                <Button
                  float="right"
                  mt="15px"
                  colorScheme="blue"
                  onClick={onOpen}
                >
                  Edit This Event
                </Button>

                <Button
                  float="right"
                  mt="15px"
                  mr="10px"
                  colorScheme="red"
                  onClick={onDeleteOpen}
                >
                  Delete This Event
                </Button>
                <Button
                  float="right"
                  mt="15px"
                  mr="10px"
                  colorScheme="green"
                  onClick={onParticipantsOpen}
                >
                  View Participants
                </Button>

                {new Date(event?.eventEnds) < new Date(date) &&
                event?.pointsAllocated === false ? (
                  <Button
                    float="right"
                    mt="15px"
                    mr="10px"
                    colorScheme="orange"
                    onClick={onAllocateOpen}
                  >
                    Allocate Points to Participants
                  </Button>
                ) : null}
              </>
            ) : event.registerationType === "external" ? null : new Date(
                event?.registerationEnds
              ) < new Date(date) ? (
              <Text
                colorScheme="green"
                float="right"
                mt="25px"
                mr="10px"
                color="red"
                fontWeight="bold"
              >
                Registeration is Closed
              </Text>
            ) : role === "S" && !event?.registered?.includes(decoded?.mid) ? (
              <Button
                colorScheme="green"
                float="right"
                mt="15px"
                mr="10px"
                onClick={register}
                isLoading={registerLoading}
              >
                Register for this Event
              </Button>
            ) : role === "F" && !editPrivilege ? (
              <Text
                colorScheme="red"
                float="right"
                mt="25px"
                mr="10px"
                color="red"
                fontWeight="bold"
              >
                You cannot register for this event
              </Text>
            ) : event?.registered?.includes(decoded?.mid) &&
              new Date(event?.registerationEnds) > new Date(date) ? (
              <Button
                colorScheme="red"
                float="right"
                mt="25px"
                mr="10px"
                fontWeight="bold"
                onClick={deregister}
                isLoading={deregisterLoading}
              >
                De-register from this Event
              </Button>
            ) : (
              <Link
                colorScheme="green"
                float="right"
                mt="25px"
                mr="10px"
                color="red"
                fontWeight=""
                fontFamily="default"
                onClick={() =>
                  navigate(`/auth?redirect=${window?.location?.pathname}`)
                }
              >
                Sign in to register for this event
              </Link>
            )}
          </Box>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
          <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
          <ModalContent>
            <ModalHeader>Edit Event</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex gap="10px">
                <FormControl>
                  <InputGroup>
                    <InputLeftAddon>
                      <i className="fa-solid fa-input-text"></i>
                    </InputLeftAddon>
                    <Input
                      placeholder="Event Name"
                      mb="10px"
                      value={eventName}
                      onChange={(e) => setEventName(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <InputGroup>
                    <InputLeftAddon>
                      <i className="fa-solid fa-image"></i>
                    </InputLeftAddon>
                    <Input
                      placeholder="Event Image URL"
                      mb="10px"
                      value={eventImage}
                      onChange={(e) => setEventImage(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>
              </Flex>
              <FormControl>
                {" "}
                <InputGroup>
                  <Textarea
                    placeholder="Event Description"
                    mb="10px"
                    rows={2}
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e?.target?.value)}
                  />
                </InputGroup>
              </FormControl>
              <Flex gap="20px">
                <FormControl>
                  <InputGroup>
                    <InputLeftAddon>
                      <i className="fa-solid fa-location-dot"></i>
                    </InputLeftAddon>
                    <Input
                      placeholder="Event Location"
                      mb="10px"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  {" "}
                  <InputGroup>
                    <Select
                      placeholder="Event Mode"
                      mb="10px"
                      value={eventMode}
                      onChange={(e) => setEventMode(e?.target?.value)}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </Select>
                  </InputGroup>
                </FormControl>
              </Flex>
              <FormControl>
                <InputGroup>
                  <InputLeftAddon>
                    <i className="fa-solid fa-link"></i>
                  </InputLeftAddon>
                  <Input
                    placeholder="Event Link"
                    mb="10px"
                    value={eventLink}
                    onChange={(e) => setEventLink(e?.target?.value)}
                  />
                </InputGroup>
              </FormControl>
              <Flex gap="20px">
                <FormControl>
                  <InputGroup>
                    <InputLeftAddon>
                      <i className="fa-solid fa-envelope"></i>
                    </InputLeftAddon>
                    <Input
                      placeholder="Event Email"
                      mb="10px"
                      value={eventEmail}
                      onChange={(e) => setEventEmail(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  {" "}
                  <InputGroup>
                    <InputLeftAddon>
                      <i className="fa-solid fa-phone"></i>
                    </InputLeftAddon>
                    <Input
                      placeholder="Event Phone"
                      mb="10px"
                      value={eventPhone}
                      onChange={(e) => setEventPhone(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>
              </Flex>
              <Text mb="5px">Event Registeration</Text>
              <Flex gap="20px" align="center">
                <FormControl>
                  {" "}
                  <InputGroup>
                    <Input
                      type="date"
                      placeholder="Event Start Date"
                      mb="10px"
                      value={registerationStarts}
                      onChange={(e) => setRegisterationStarts(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <InputGroup>
                    <Input
                      type="time"
                      placeholder="Event Start Time"
                      mb="10px"
                      value={registerationStartTime}
                      onChange={(e) =>
                        setRegisterationStartTime(e?.target?.value)
                      }
                    />
                  </InputGroup>
                </FormControl>
                <p>To</p>
                <FormControl>
                  {" "}
                  <InputGroup>
                    <Input
                      type="date"
                      placeholder="Event End Date"
                      mb="10px"
                      value={registerationEnds}
                      onChange={(e) => setRegisterationEnds(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>{" "}
                <FormControl>
                  <InputGroup>
                    <Input
                      type="time"
                      placeholder="Event End Time"
                      mb="10px"
                      value={registerationEndTime}
                      onChange={(e) =>
                        setRegisterationEndTime(e?.target?.value)
                      }
                    />
                  </InputGroup>
                </FormControl>
              </Flex>
              <Text mb="5px">Event Schedule</Text>.
              <Flex gap="20px" align="center">
                <FormControl>
                  {" "}
                  <InputGroup>
                    <Input
                      type="date"
                      placeholder="Event Registeration Start Date"
                      mb="10px"
                      value={eventStarts}
                      onChange={(e) => setEventStarts(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>{" "}
                <FormControl>
                  <InputGroup>
                    <Input
                      type="time"
                      placeholder="Event Registeration End Time"
                      mb="10px"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>
                <p>To</p>
                <FormControl>
                  <InputGroup>
                    <Input
                      type="date"
                      placeholder="Event Registeration End Date"
                      mb="10px"
                      value={eventEnds}
                      onChange={(e) => setEventEnds(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>{" "}
                <FormControl>
                  <InputGroup>
                    <Input
                      type="time"
                      placeholder="Event Registeration End Time"
                      mb="10px"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e?.target?.value)}
                    />
                  </InputGroup>
                </FormControl>
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant="ghost" onClick={updateEvent}>
                Update
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelDeleteRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Event?
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? You can't undo this action afterwards.
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
          motionPreset="slideInBottom"
          leastDestructiveRef={allocateRef}
          onClose={onAllocateClose}
          isOpen={isAllocateOpen}
          isCentered
        >
          <AlertDialogOverlay />

          <AlertDialogContent>
            <AlertDialogHeader>Discard Changes?</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>
              <Text mb="20px">How Many Points to Allocate?</Text>
              <Input
                value={allocatePoints}
                onChange={(e) => setAllocatePoints(parseInt(e?.target?.value))}
                type="number"
              />
              <Button ref={allocateRef} onClick={onAllocateClose}>
                Cancel
              </Button>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onAllocateClose}>Cancel</Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={allocate}
                isLoading={allocateLoading}
              >
                Allocate!
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Modal
          isOpen={isParticipantsOpen}
          onClose={onParticipantsClose}
          size="3xl"
        >
          <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
          <ModalContent>
            <ModalHeader>Participants</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Table variant="striped" colorScheme="gray">
                <Thead>
                  <Tr>
                    <Th>Moodle ID</Th>
                    <Th>Name</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {participants?.map((participant) => {
                    return (
                      <Tr key={participant.mid}>
                        <Td>{participant?.mid}</Td>
                        <Td>
                          {participant?.fname} {participant?.lname}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onParticipantsClose}>
                Close
              </Button>
              <Button variant="ghost" onClick={exportCSV}>
                Export as CSV
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }
};

export default Event;
