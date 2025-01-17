import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  HStack,
  useToast,
  Box,
  Divider,
  Text,
} from '@chakra-ui/react';
import { Calendar, Image, Mail, MapPin, Link2, Phone, Clock } from 'lucide-react';
import { Event } from '@shared-types/Event';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Event>) => Promise<void>;
}

export const CreateEventModal = ({ isOpen, onClose, onSubmit }: CreateEventModalProps) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    desc: '',
    location: '',
    mode: '',
    link: '',
    email: '',
    phone: '',
    registerationType: '',
    eventStarts: '',
    eventEnds: '',
    registerationStarts: '',
    registerationEnds: '',
    eventStartTime: '',
    eventEndTime: '',
    registerationStartTime: '',
    registerationEndTime: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateDates = () => {
    const eventStart = new Date(`${formData.eventStarts}T${formData.eventStartTime}`);
    const eventEnd = new Date(`${formData.eventEnds}T${formData.eventEndTime}`);
    const regStart = new Date(`${formData.registerationStarts}T${formData.registerationStartTime}`);
    const regEnd = new Date(`${formData.registerationEnds}T${formData.registerationEndTime}`);

    if (eventStart > eventEnd) {
      toast({
        title: "Invalid Dates",
        description: "Event end date must be after start date",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    if (regStart > regEnd) {
      toast({
        title: "Invalid Dates",
        description: "Registration end date must be after start date",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    if (regEnd > eventStart) {
      toast({
        title: "Invalid Dates",
        description: "Registration must end before event starts",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateDates()) return;

    setIsLoading(true);
    try {
      const eventData: Partial<Event> = {
        name: formData.name,
        image: formData.image,
        desc: formData.desc,
        location: formData.location,
        mode: formData.mode as "online" | "offline",
        email: formData.email,
        phone: formData.phone,
        registerationType: formData.registerationType as "internal" | "external",
        link: formData.registerationType === "external" ? formData.link : undefined,
        eventStarts: new Date(`${formData.eventStarts}T${formData.eventStartTime}`),
        eventEnds: new Date(`${formData.eventEnds}T${formData.eventEndTime}`),
        registerationStarts: new Date(`${formData.registerationStarts}T${formData.registerationStartTime}`),
        registerationEnds: new Date(`${formData.registerationEnds}T${formData.registerationEndTime}`),
      };

      await onSubmit(eventData);
      setFormData({
        name: '',
        image: '',
        desc: '',
        location: '',
        mode: '',
        link: '',
        email: '',
        phone: '',
        registerationType: '',
        eventStarts: '',
        eventEnds: '',
        registerationStarts: '',
        registerationEnds: '',
        eventStartTime: '',
        eventEndTime: '',
        registerationStartTime: '',
        registerationEndTime: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay 
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      />
      <ModalContent as={motion.div} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <ModalHeader>Create New Event</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6}>
            {/* Basic Information */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="semibold" mb={4}>Basic Information</Text>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <HStack spacing={2}>
                    <FormLabel w="120px">Event Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter event name"
                    />
                  </HStack>
                </FormControl>

                <FormControl isRequired>
                  <HStack spacing={2}>
                    <FormLabel w="120px">
                      <HStack>
                        <Image size={16} />
                        <Text>Image URL</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="Enter image URL"
                    />
                  </HStack>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* Location and Mode */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="semibold" mb={4}>Location & Mode</Text>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <HStack spacing={2}>
                    <FormLabel w="120px">
                      <HStack>
                        <MapPin size={16} />
                        <Text>Location</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter event location"
                    />
                  </HStack>
                </FormControl>

                <FormControl isRequired>
                  <HStack spacing={2}>
                    <FormLabel w="120px">Event Mode</FormLabel>
                    <Select
                      name="mode"
                      value={formData.mode}
                      onChange={handleChange}
                      placeholder="Select event mode"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </Select>
                  </HStack>
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* Registration Details */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="semibold" mb={4}>Registration Details</Text>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <HStack spacing={2}>
                    <FormLabel w="120px">Type</FormLabel>
                    <Select
                      name="registerationType"
                      value={formData.registerationType}
                      onChange={handleChange}
                      placeholder="Select registration type"
                    >
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                    </Select>
                  </HStack>
                </FormControl>

                {formData.registerationType === 'external' && (
                  <FormControl isRequired>
                    <HStack spacing={2}>
                      <FormLabel w="120px">
                        <HStack>
                          <Link2 size={16} />
                          <Text>External Link</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        placeholder="Enter registration link"
                      />
                    </HStack>
                  </FormControl>
                )}

                <FormControl isRequired>
                  <HStack spacing={2}>
                    <FormLabel w="120px">
                      <HStack>
                        <Mail size={16} />
                        <Text>Email</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter contact email"
                      type="email"
                    />
                  </HStack>
                </FormControl>

                <FormControl isRequired>
                  <HStack spacing={2}>
                    <FormLabel w="120px">
                      <HStack>
                        <Phone size={16} />
                        <Text>Phone</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter contact phone"
                    />
                  </HStack>
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* Event Schedule */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="semibold" mb={4}>Event Schedule</Text>
              <VStack spacing={4}>
                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>
                      <HStack>
                        <Calendar size={16} />
                        <Text>Start Date</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      name="eventStarts"
                      value={formData.eventStarts}
                      onChange={handleChange}
                      type="date"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>
                      <HStack>
                        <Clock size={16} />
                        <Text>Start Time</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      name="eventStartTime"
                      value={formData.eventStartTime}
                      onChange={handleChange}
                      type="time"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      name="eventEnds"
                      value={formData.eventEnds}
                      onChange={handleChange}
                      type="date"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>End Time</FormLabel>
                    <Input
                      name="eventEndTime"
                      value={formData.eventEndTime}
                      onChange={handleChange}
                      type="time"
                    />
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Registration Period */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="semibold" mb={4}>Registration Period</Text>
              <VStack spacing={4}>
                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      name="registerationStarts"
                      value={formData.registerationStarts}
                      onChange={handleChange}
                      type="date"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Start Time</FormLabel>
                    <Input
                      name="registerationStartTime"
                      value={formData.registerationStartTime}
                      onChange={handleChange}
                      type="time"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      name="registerationEnds"
                      value={formData.registerationEnds}
                      onChange={handleChange}
                      type="date"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>End Time</FormLabel>
                    <Input
                      name="registerationEndTime"
                      value={formData.registerationEndTime}
                      onChange={handleChange}
                      type="time"
                    />
                  </FormControl>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Creating..."
          >
            Create Event
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};