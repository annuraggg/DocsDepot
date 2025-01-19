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
  useToast,
  Box,
  Text,
} from '@chakra-ui/react';
import { Calendar, Image, Mail, MapPin, Link2, Phone, Clock, Tag, Radio } from 'lucide-react';
import { Event, Mode, RegistrationType } from '@shared-types/Event';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Event>) => Promise<void>;
}

interface FormData {
  name: string;
  image: string;
  desc: string;
  location: string;
  mode: Mode | '';
  link?: string;
  email: string;
  phone: string;
  registerationType: RegistrationType | '';
  eventStartDate: string;
  eventEndDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  eventStartTime: string;
  eventEndTime: string;
  registrationStartTime: string;
  registrationEndTime: string;
  points: number;
}

export const CreateEventModal = ({ isOpen, onClose, onSubmit }: CreateEventModalProps) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    image: '',
    desc: '',
    location: '',
    mode: '',
    link: '',
    email: '',
    phone: '',
    registerationType: '',
    eventStartDate: '',
    eventEndDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    eventStartTime: '',
    eventEndTime: '',
    registrationStartTime: '',
    registrationEndTime: '',
    points: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateDates = () => {
    const eventStart = new Date(`${formData.eventStartDate}T${formData.eventStartTime}`);
    const eventEnd = new Date(`${formData.eventEndDate}T${formData.eventEndTime}`);
    const regStart = new Date(`${formData.registrationStartDate}T${formData.registrationStartTime}`);
    const regEnd = new Date(`${formData.registrationEndDate}T${formData.registrationEndTime}`);

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
        mode: formData.mode as Mode,
        contact: {
          email: formData.email,
          phone: formData.phone,
        },
        registerationType: formData.registerationType as RegistrationType,
        link: formData.registerationType === "external" ? formData.link : undefined,
        eventTimeline: {
          start: new Date(`${formData.eventStartDate}T${formData.eventStartTime}`).toISOString(),
          end: new Date(`${formData.eventEndDate}T${formData.eventEndTime}`).toISOString(),
        },
        registeration: {
          start: new Date(`${formData.registrationStartDate}T${formData.registrationStartTime}`),
          end: new Date(`${formData.registrationEndDate}T${formData.registrationEndTime}`),
        },
        points: Number(formData.points),
        pointsAllocated: false,
        participants: [],
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
        eventStartDate: '',
        eventEndDate: '',
        registrationStartDate: '',
        registrationEndDate: '',
        eventStartTime: '',
        eventEndTime: '',
        registrationStartTime: '',
        registrationEndTime: '',
        points: 0
      });
      onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      />
      <ModalContent
        as={motion.div}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-h-[90vh] overflow-y-auto"
      >
        <ModalHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 rounded-t-md">
          <Text fontSize="2xl">Create New Event</Text>
          <Text fontSize="sm" className="mt-2 opacity-80">Fill in the details below to create a new event</Text>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody className="py-6">
          <div className="space-y-8">
            <Box className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-blue-600" />
                <Text fontSize="lg" fontWeight="semibold">Basic Information</Text>
              </div>

              <FormControl isRequired>
                <FormLabel className="text-sm font-medium text-gray-700">Event Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  className="mt-1"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Image URL
                </FormLabel>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                  className="mt-1"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                <Textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  placeholder="Enter event description"
                  rows={4}
                  className="mt-1"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  Points
                </FormLabel>
                <Input
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  type="number"
                  min={0}
                  placeholder="Enter points for event"
                  className="mt-1"
                />
              </FormControl>
            </Box>

            <Box className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <Text fontSize="lg" fontWeight="semibold">Location & Mode</Text>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormControl isRequired>
                  <FormLabel className="text-sm font-medium text-gray-700">Location</FormLabel>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter event location"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel className="text-sm font-medium text-gray-700">Event Mode</FormLabel>
                  <Select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    placeholder="Select event mode"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </Select>
                </FormControl>
              </div>
            </Box>

            <Box className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-blue-600" />
                <Text fontSize="lg" fontWeight="semibold">Registration Details</Text>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormControl isRequired>
                  <FormLabel className="text-sm font-medium text-gray-700">Registration Type</FormLabel>
                  <Select
                    name="registerationType"
                    value={formData.registerationType}
                    onChange={handleChange}
                    placeholder="Select registration type"
                  >
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                  </Select>
                </FormControl>

                {formData.registerationType === 'external' && (
                  <FormControl isRequired>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      External Link
                    </FormLabel>
                    <Input
                      name="link"
                      value={formData.link}
                      onChange={handleChange}
                      placeholder="Enter registration link"
                    />
                  </FormControl>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormControl isRequired>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Email
                  </FormLabel>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter contact email"
                    type="email"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Phone
                  </FormLabel>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter contact phone"
                  />
                </FormControl>
              </div>
            </Box>

            <Box className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <Text fontSize="lg" fontWeight="semibold">Event Schedule</Text>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormControl isRequired>
                    <FormLabel className="text-sm font-medium text-gray-700">Start Date</FormLabel>
                    <Input
                      name="eventStartDate"
                      value={formData.eventStartDate}
                      onChange={handleChange}
                      type="date"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel className="text-sm font-medium text-gray-700">Start Time</FormLabel>
                    <Input
                      name="eventStartTime"
                      value={formData.eventStartTime}
                      onChange={handleChange}
                      type="time"
                    />
                  </FormControl>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormControl isRequired>
                    <FormLabel className="text-sm font-medium text-gray-700">End Date</FormLabel>
                    <Input
                      name="eventEndDate"
                      value={formData.eventEndDate}
                      onChange={handleChange}
                      type="date"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel className="text-sm font-medium text-gray-700">End Time</FormLabel>
                    <Input
                      name="eventEndTime"
                      value={formData.eventEndTime}
                      onChange={handleChange}
                      type="time"
                    />
                  </FormControl>
                </div>
              </div>
            </Box>

            <Box className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <Text fontSize="lg" fontWeight="semibold">Registration Period</Text>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormControl isRequired>
                    <FormLabel className="text-sm font-medium text-gray-700">Start Date</FormLabel>
                    <Input
                      name="registrationStartDate"
                      value={formData.registrationStartDate}
                      onChange={handleChange}
                      type="date"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel className="text-sm font-medium text-gray-700">Start Time</FormLabel>
                    <Input
                      name="registrationStartTime"
                      value={formData.registrationStartTime}
                      onChange={handleChange}
                      type="time"
                    />
                  </FormControl>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormControl isRequired>
                    <FormLabel className="text-sm font-medium text-gray-700">End Date</FormLabel>
                    <Input
                      name="registrationEndDate"
                      value={formData.registrationEndDate}
                      onChange={handleChange}
                      type="date"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel className="text-sm font-medium text-gray-700">End Time</FormLabel>
                    <Input
                      name="registrationEndTime"
                      value={formData.registrationEndTime}
                      onChange={handleChange}
                      type="time"
                    />
                  </FormControl>
                </div>
              </div>
            </Box>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-gray-100 bg-gray-50">
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Creating..."
            className="px-6"
          >
            Create Event
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};