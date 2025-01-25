import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  Input,
  Select,
  Textarea,
  InputGroup,
  InputLeftAddon,
  VStack,
  Text,
  Flex,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Link as LinkIcon, MapPin, Type } from "lucide-react";
import { ExtendedEvent as IEvent } from "@shared-types/ExtendedEvent";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent;
  eventName: string;
  setEventName: (value: string) => void;
  eventImage: string;
  setEventImage: (value: string) => void;
  eventDesc: string;
  setEventDesc: (value: string) => void;
  eventLocation: string;
  setEventLocation: (value: string) => void;
  eventMode: string;
  setEventMode: (value: string) => void;
  eventLink: string;
  setEventLink: (value: string) => void;
  eventEmail: string;
  setEventEmail: (value: string) => void;
  eventPhone: string;
  setEventPhone: (value: string) => void;
  eventStarts: string;
  setEventStarts: (value: string) => void;
  eventEnds: string;
  setEventEnds: (value: string) => void;
  registerationStarts: string;
  setRegisterationStarts: (value: string) => void;
  registerationEnds: string;
  setRegisterationEnds: (value: string) => void;
  eventStartTime: string;
  setEventStartTime: (value: string) => void;
  eventEndTime: string;
  setEventEndTime: (value: string) => void;
  registerationStartTime: string;
  setRegisterationStartTime: (value: string) => void;
  registerationEndTime: string;
  setRegisterationEndTime: (value: string) => void;
  updateEvent: () => void;
}

export const EditEventModal = ({
  isOpen,
  onClose,
  eventName,
  setEventName,
  eventImage,
  setEventImage,
  eventDesc,
  setEventDesc,
  eventLocation,
  setEventLocation,
  eventMode,
  setEventMode,
  eventLink,
  setEventLink,
  eventEmail,
  setEventEmail,
  eventPhone,
  setEventPhone,
  eventStarts,
  setEventStarts,
  eventEnds,
  setEventEnds,
  registerationStarts,
  setRegisterationStarts,
  registerationEnds,
  setRegisterationEnds,
  eventStartTime,
  setEventStartTime,
  eventEndTime,
  setEventEndTime,
  registerationStartTime,
  setRegisterationStartTime,
  registerationEndTime,
  setRegisterationEndTime,
  updateEvent,
}: EditEventModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
          <ModalOverlay backdropFilter="blur(10px)" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ModalContent className="bg-white rounded-2xl shadow-2xl">
              <ModalHeader className="border-b border-gray-100 pb-4 px-6">
                <Text className="text-2xl font-bold text-gray-900">
                  Edit Event
                </Text>
              </ModalHeader>
              <ModalCloseButton className="text-gray-500 hover:text-gray-700" />

              <ModalBody className="py-8 px-6 space-y-8">
                <VStack spacing={8}>
                  <Flex gap={6} className="w-full">
                    <FormControl>
                      <Text className="text-sm font-medium text-gray-700 mb-2">
                        Event Name
                      </Text>
                      <InputGroup>
                        <InputLeftAddon>
                          <Type className="w-4 h-4 text-gray-500" />
                        </InputLeftAddon>
                        <Input
                          placeholder="Event Name"
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <Text className="text-sm font-medium text-gray-700 mb-2">
                        Event Image
                      </Text>
                      <InputGroup>
                        <InputLeftAddon>
                          <LinkIcon className="w-4 h-4 text-gray-500" />
                        </InputLeftAddon>
                        <Input
                          placeholder="Event Image URL"
                          value={eventImage}
                          onChange={(e) => setEventImage(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </InputGroup>
                    </FormControl>
                  </Flex>

                  <FormControl>
                    <Textarea
                      placeholder="Event Description"
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      rows={3}
                      className="focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </FormControl>

                  <Flex gap={4}>
                    <FormControl>
                      <InputGroup>
                        <InputLeftAddon>
                          <MapPin className="w-4 h-4" />
                        </InputLeftAddon>
                        <Input
                          placeholder="Event Location"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <Select
                        value={eventMode}
                        onChange={(e) => setEventMode(e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Mode</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </Select>
                    </FormControl>
                  </Flex>

                  <FormControl>
                    <InputGroup>
                      <InputLeftAddon>
                        <LinkIcon className="w-4 h-4" />
                      </InputLeftAddon>
                      <Input
                        placeholder="Event Link"
                        value={eventLink}
                        onChange={(e) => setEventLink(e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </InputGroup>
                  </FormControl>

                  <Flex gap={4}>
                    <FormControl>
                      <InputGroup>
                        <InputLeftAddon>
                          <Mail className="w-4 h-4" />
                        </InputLeftAddon>
                        <Input
                          placeholder="Contact Email"
                          value={eventEmail}
                          onChange={(e) => setEventEmail(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <InputGroup>
                        <InputLeftAddon>
                          <Phone className="w-4 h-4" />
                        </InputLeftAddon>
                        <Input
                          placeholder="Contact Phone"
                          value={eventPhone}
                          onChange={(e) => setEventPhone(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </InputGroup>
                    </FormControl>
                  </Flex>

                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="medium" className="text-gray-700">
                      Event Registration Period
                    </Text>
                    <Flex gap={4} align="center">
                      <FormControl>
                        <Input
                          type="date"
                          value={registerationStarts}
                          onChange={(e) =>
                            setRegisterationStarts(e.target.value)
                          }
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          type="time"
                          value={registerationStartTime}
                          onChange={(e) =>
                            setRegisterationStartTime(e.target.value)
                          }
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <Text>to</Text>
                      <FormControl>
                        <Input
                          type="date"
                          value={registerationEnds}
                          onChange={(e) => setRegisterationEnds(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          type="time"
                          value={registerationEndTime}
                          onChange={(e) =>
                            setRegisterationEndTime(e.target.value)
                          }
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                    </Flex>
                  </VStack>

                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="medium" className="text-gray-700">
                      Event Schedule
                    </Text>
                    <Flex gap={4} align="center">
                      <FormControl>
                        <Input
                          type="date"
                          value={eventStarts}
                          onChange={(e) => setEventStarts(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          type="time"
                          value={eventStartTime}
                          onChange={(e) => setEventStartTime(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <Text>to</Text>
                      <FormControl>
                        <Input
                          type="date"
                          value={eventEnds}
                          onChange={(e) => setEventEnds(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          type="time"
                          value={eventEndTime}
                          onChange={(e) => setEventEndTime(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                    </Flex>
                  </VStack>
                </VStack>
              </ModalBody>

              <ModalFooter className="border-t border-gray-100 pt-4 px-6">
                <Button
                  variant="ghost"
                  mr={3}
                  onClick={onClose}
                  className="text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={updateEvent}
                  className="px-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  Update Event
                </Button>
              </ModalFooter>
            </ModalContent>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
