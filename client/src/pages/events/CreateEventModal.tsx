import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Modal,
  ModalOverlay,
  ModalContent,
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

interface DateTimeInputGroupProps {
  dateLabel: string;
  dateName: string;
  dateValue: string;
  timeLabel: string;
  timeName: string;
  timeValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        as={motion.div}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <Text fontSize="2xl" fontWeight="bold">Create New Event</Text>
            <ModalCloseButton position="static" />
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            <FormSection
              icon={<Tag className="w-5 h-5 text-blue-600" />}
              title="Basic Details"
            >
              <FormControl isRequired>
                <FormLabel>Event Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Image URL
                </FormLabel>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  placeholder="Enter event description"
                  rows={4}
                  size="lg"
                />
              </FormControl>
            </FormSection>

            <FormSection
              icon={<MapPin className="w-5 h-5 text-blue-600" />}
              title="Location & Mode"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormControl isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    size="lg"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Event Mode</FormLabel>
                  <Select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    placeholder="Select mode"
                    size="lg"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </Select>
                </FormControl>
              </div>
            </FormSection>

            <FormSection
              icon={<Calendar className="w-5 h-5 text-blue-600" />}
              title="Event Schedule"
            >
              <div className="space-y-4">
                <DateTimeInputGroup
                  dateLabel="Start Date"
                  dateName="eventStartDate"
                  dateValue={formData.eventStartDate}
                  timeLabel="Start Time"
                  timeName="eventStartTime"
                  timeValue={formData.eventStartTime}
                  onChange={handleChange}
                />

                <DateTimeInputGroup
                  dateLabel="End Date"
                  dateName="eventEndDate"
                  dateValue={formData.eventEndDate}
                  timeLabel="End Time"
                  timeName="eventEndTime"
                  timeValue={formData.eventEndTime}
                  onChange={handleChange}
                />
              </div>
            </FormSection>

            <FormSection
              icon={<Clock className="w-5 h-5 text-blue-600" />}
              title="Registration Details"
            >
              <div className="space-y-4">
                <FormControl isRequired>
                  <FormLabel>Registration Type</FormLabel>
                  <Select
                    name="registerationType"
                    value={formData.registerationType}
                    onChange={handleChange}
                    placeholder="Select type"
                    size="lg"
                  >
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                  </Select>
                </FormControl>

                {formData.registerationType === 'external' && (
                  <FormControl isRequired>
                    <FormLabel className="flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      External Link
                    </FormLabel>
                    <Input
                      name="link"
                      value={formData.link}
                      onChange={handleChange}
                      placeholder="Enter registration link"
                      size="lg"
                    />
                  </FormControl>
                )}

                <DateTimeInputGroup
                  dateLabel="Registration Start Date"
                  dateName="registrationStartDate"
                  dateValue={formData.registrationStartDate}
                  timeLabel="Start Time"
                  timeName="registrationStartTime"
                  timeValue={formData.registrationStartTime}
                  onChange={handleChange}
                />

                <DateTimeInputGroup
                  dateLabel="Registration End Date"
                  dateName="registrationEndDate"
                  dateValue={formData.registrationEndDate}
                  timeLabel="End Time"
                  timeName="registrationEndTime"
                  timeValue={formData.registrationEndTime}
                  onChange={handleChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormControl isRequired>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Email
                    </FormLabel>
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      type="email"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Phone
                    </FormLabel>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone"
                      size="lg"
                    />
                  </FormControl>
                </div>

                <FormControl isRequired>
                  <FormLabel className="flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Points
                  </FormLabel>
                  <Input
                    name="points"
                    value={formData.points}
                    onChange={handleChange}
                    type="number"
                    min={0}
                    placeholder="Enter points"
                    size="lg"
                  />
                </FormControl>
              </div>
            </FormSection>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={onClose}
              size="lg"
              className="px-8"
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Creating..."
              size="lg"
              className="px-8"
            >
              Create Event
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

const FormSection = ({ icon, title, children }: FormSectionProps) => (
  <Box>
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <Text fontSize="lg" fontWeight="semibold">{title}</Text>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </Box>
);

const DateTimeInputGroup = ({
  dateLabel,
  dateName,
  dateValue,
  timeLabel,
  timeName,
  timeValue,
  onChange
}: DateTimeInputGroupProps) => (
  <div className="grid grid-cols-2 gap-4">
    <FormControl isRequired>
      <FormLabel>{dateLabel}</FormLabel>
      <Input
        name={dateName}
        value={dateValue}
        onChange={onChange}
        type="date"
        size="lg"
      />
    </FormControl>

    <FormControl isRequired>
      <FormLabel>{timeLabel}</FormLabel>
      <Input
        name={timeName}
        value={timeValue}
        onChange={onChange}
        type="time"
        size="lg"
      />
    </FormControl>
  </div>
);