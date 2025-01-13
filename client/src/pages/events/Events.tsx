import { useState, useEffect, SetStateAction } from "react";

import {
  Badge,
  Box,
  Flex,
  Heading,
  useToast,
  Text,
  Button,
  ButtonGroup,
  Stack,
  Divider,
  Card,
  CardBody,
  CardFooter,
  Image,
  Skeleton,
  FormControl,
  InputGroup,
  InputLeftAddon,
  Input,
  Textarea,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  CheckboxGroup,
  Checkbox,
} from "@chakra-ui/react";
import { Link } from "react-router";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Loader from "../../components/Loader";
import { Event } from "@shared-types/Event";
import useAxios from "@/config/axios";
import { Token } from "@shared-types/Token";

const Events = () => {
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [editPrivilege, setEditPrivilege] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

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
  const [registerationMode, setRegisterationMode] = useState("");

  const [update, setUpdate] = useState(false);
  const [loading, setLoading] = useState(true);

  const axios = useAxios();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode(token) as Token;

      if (decoded.perms?.includes("MHI") || decoded.role === "A") {
        setEditPrivilege(true);
      }
    }
  }, []);

  useEffect(() => {
    axios
      .get("/events")
      .then((res) => {
        if (res.status === 200) {
          setEvents(res.data.data);
          setLoading(false);
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
      .finally(() => setLoading(false));
  }, [update]);

  const date = new Date();

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const [createLoading, setCreateLoading] = useState(false);
  const createEvent = () => {
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
      console.error(registerationStarts, eventStarts);
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
    /* if (eventStarts < date) {
      toast({
        title: "Error",
        description: "Event Start Date cannot be before today",
        status: "error  ",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (eventEnds < date) {
      toast({
        title: "Error",
        description: "Event End Date cannot be before today",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      return;
    }
*/
    setCreateLoading(true);

    axios
      .post("/events", {
        name: eventName,
        image: eventImage,
        desc: eventDesc,
        location: eventLocation,
        mode: eventMode,
        link: eventLink,
        email: eventEmail,
        phone: eventPhone,
        registerationMode: registerationMode,
        eventStarts: new Date(eventStarts + "T" + eventStartTime + ":00"),
        eventEnds: new Date(eventEnds + "T" + eventEndTime + ":00"),
        registerationStarts: new Date(
          registerationStarts + "T" + registerationStartTime + ":00"
        ),
        registerationEnds: new Date(
          registerationEnds + "T" + registerationEndTime + ":00"
        ),
      })
      .then((res) => {
        if (res.status === 200) {
          toast({
            title: "Success",
            description: "Event Created Successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setUpdate(!update);
          onClose();
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
      .finally(() => setCreateLoading(false));
  };

  useEffect(() => {
    if (events.length === 0) return;
    setFilteredEvents(events?.reverse());
  }, [events]);

  const search = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const query = e?.target?.value;

    if (query === "") {
      setFilteredEvents(events); // Reset the events to their original state
      return;
    }

    const fe = filteredEvents.filter((event) => {
      return event?.name?.toLowerCase().includes(query.toLowerCase());
    });
    setFilteredEvents(fe);
  };

  const filterEvents = (e: string) => {
    const query = e;
    if (query.length === 3) {
      setFilteredEvents(events); // Reset the events to their original state
      return;
    }

    let fe: SetStateAction<Event[]> = [];

    events.filter((event) => {
      if (query.includes("active")) {
        if (
          new Date(event?.eventStarts) < date &&
          new Date(event?.eventEnds) > date
        ) {
          fe.push(event);
        }
      }
      if (query.includes("upcoming")) {
        if (event?.eventStarts > date) {
          fe.push(event);
        }
      }
      if (query.includes("expired")) {
        if (event?.eventEnds < date) {
          fe.push(event);
        }
      }
    });
    setFilteredEvents(fe);
  };

  if (!loading) {
    return (
      <>
        <Box className="AdminEvents">
          <Heading textAlign="center">Events </Heading>
          <Flex align="center" justify="center" gap="20px">
            <Input
              placeholder="Search Events"
              mb="10px"
              onChange={search}
              width="50%"
            />
            <Text>Type: </Text>
            <CheckboxGroup
              colorScheme="green"
              onChange={(e) => filterEvents(e.toString())}
              defaultValue={["active", "upcoming", "expired"]}
            >
              <Checkbox value="active">Active</Checkbox>
              <Checkbox value="upcoming">Upcoming</Checkbox>
              <Checkbox value="expired">Expired</Checkbox>
            </CheckboxGroup>
          </Flex>
          <Box className="events">
            {editPrivilege ? (
              <Card
                w="320px"
                maxW="sm"
                maxH="md"
                overflow="hidden"
                cursor="pointer"
                onClick={onOpen}
              >
                <Flex
                  justify="center"
                  align="center"
                  height="100%"
                  direction="column"
                >
                  <Text fontSize="100px" color="lightgray">
                    +
                  </Text>{" "}
                  <Text color="lightgray">Add Event</Text>
                </Flex>
              </Card>
            ) : null}
            {filteredEvents?.map((event) => (
              <Card
                w="320px"
                maxW="sm"
                maxH="md"
                overflow="hidden"
                key={event?._id}
              >
                <CardBody>
                  <Image
                    fallback={<Skeleton height="150px" />}
                    src={event?.image}
                    borderRadius="lg"
                    height="150px"
                    objectFit="cover"
                    width="100%"
                  />

                  <Stack mt="6" spacing="3">
                    <Divider />
                    <Heading size="md">{event?.name}</Heading>
                    <Text>
                      {new Date(event?.eventStarts).toLocaleDateString(
                        "en-US",
                        dateOptions
                      )}
                    </Text>
                    <Text>{event?.location}</Text>
                    <Text color="blue.600">
                      {event?.mode?.charAt(0).toUpperCase() +
                        event?.mode?.slice(1)}
                      <Badge
                        color={
                          event?.eventStarts > date
                            ? "green"
                            : event?.eventEnds > date
                            ? "blue"
                            : "red"
                        }
                        ml="15px"
                        fontSize="13px"
                      >
                        {event?.eventStarts > date
                          ? "Upcoming"
                          : event?.eventEnds > date
                          ? "Ongoing"
                          : "Expired"}
                      </Badge>
                    </Text>
                  </Stack>
                </CardBody>
                <Divider />
                <CardFooter
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <ButtonGroup spacing="2">
                    <Link to={`/events/${event?._id}`}>
                      <Button variant="solid" colorScheme="blue">
                        View Event
                      </Button>
                    </Link>
                  </ButtonGroup>

                  <Flex
                    justifySelf="flex-end"
                    align="center"
                    justifyContent="flex-end"
                  >
                    {event.registerationType === "internal" ? (
                      <i
                        className="fa-regular fa-users"
                        style={{ marginRight: "10px" }}
                      ></i>
                    ) : null}
                    <Text justifySelf="flex-end">
                      {event?.registerationType === "internal"
                        ? event?.registered?.length
                        : null}
                    </Text>
                  </Flex>
                </CardFooter>
              </Card>
            ))}
          </Box>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
          <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)/" />
          <ModalContent>
            <ModalHeader>Add Event</ModalHeader>
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

              <Flex gap="20px">
                <FormControl width="200px">
                  {" "}
                  <InputGroup>
                    <Select
                      placeholder="Registeration Mode"
                      mb="10px"
                      value={registerationMode}
                      onChange={(e) => setRegisterationMode(e?.target?.value)}
                    >
                      <option value="internal">From Scriptopia</option>
                      <option value="external">External</option>
                    </Select>
                  </InputGroup>
                </FormControl>

                {registerationMode === "external" ? (
                  <FormControl>
                    <InputGroup>
                      <InputLeftAddon>
                        <i className="fa-solid fa-link"></i>
                      </InputLeftAddon>
                      <Input
                        placeholder="Registeration Link"
                        mb="10px"
                        value={eventLink}
                        onChange={(e) => setEventLink(e?.target?.value)}
                      />
                    </InputGroup>
                  </FormControl>
                ) : null}
              </Flex>

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

              <Text mb="5px">Event Schedule</Text>
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
              <Button
                variant="ghost"
                onClick={createEvent}
                isLoading={createLoading}
              >
                Create
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  } else {
    return <Loader />;
  }
};

export default Events;
