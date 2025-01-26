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
        <Modal 
          isOpen={isOpen} 
          onClose={onClose} 
          size={{ base: "full", md: "4xl" }}
          scrollBehavior="inside"
        >
          <ModalOverlay backdropFilter="blur(10px)" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ModalContent className="bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
              <ModalHeader className="border-b border-gray-100 pb-4 px-4 sm:px-6">
                <Text className="text-xl sm:text-2xl font-bold text-gray-900">Edit Event</Text>
              </ModalHeader>
              <ModalCloseButton className="text-gray-500 hover:text-gray-700 top-3 right-3" />

              <ModalBody className="py-6 px-4 sm:px-6 space-y-6">
                <VStack spacing={6}>
                  <Flex 
                    gap={4} 
                    className="w-full flex-col sm:flex-row items-start"
                  >
                    <FormControl className="w-full">
                      <Text className="text-sm font-medium text-gray-700 mb-2">Event Name</Text>
                      <InputGroup>
                        <InputLeftAddon className="bg-gray-50">
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

                    <FormControl className="w-full mt-4 sm:mt-0">
                      <Text className="text-sm font-medium text-gray-700 mb-2">Event Image</Text>
                      <InputGroup>
                        <InputLeftAddon className="bg-gray-50">
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

                  <Flex 
                    gap={4} 
                    className="flex-col sm:flex-row w-full"
                  >
                    <FormControl className="w-full">
                      <InputGroup>
                        <InputLeftAddon className="bg-gray-50">
                          <MapPin className="w-4 h-4 text-gray-500" />
                        </InputLeftAddon>
                        <Input
                          placeholder="Event Location"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl className="w-full mt-4 sm:mt-0">
                      <Select
                        value={eventMode}
                        onChange={(e) => setEventMode(e.target.value)}
                        placeholder="Select Mode"
                        className="focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </Select>
                    </FormControl>
                  </Flex>

                  <FormControl>
                    <InputGroup>
                      <InputLeftAddon className="bg-gray-50">
                        <LinkIcon className="w-4 h-4 text-gray-500" />
                      </InputLeftAddon>
                      <Input
                        placeholder="Event Link"
                        value={eventLink}
                        onChange={(e) => setEventLink(e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </InputGroup>
                  </FormControl>

                  <Flex 
                    gap={4} 
                    className="flex-col sm:flex-row w-full"
                  >
                    <FormControl className="w-full">
                      <InputGroup>
                        <InputLeftAddon className="bg-gray-50">
                          <Mail className="w-4 h-4 text-gray-500" />
                        </InputLeftAddon>
                        <Input
                          placeholder="Contact Email"
                          value={eventEmail}
                          onChange={(e) => setEventEmail(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl className="w-full mt-4 sm:mt-0">
                      <InputGroup>
                        <InputLeftAddon className="bg-gray-50">
                          <Phone className="w-4 h-4 text-gray-500" />
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

                  <VStack 
                    spacing={4} 
                    align="stretch" 
                    className="w-full"
                  >
                    <Text 
                      fontWeight="medium" 
                      className="text-gray-700 text-sm"
                    >
                      Event Registration Period
                    </Text>
                    <Flex 
                      gap={2} 
                      className="flex-col sm:flex-row items-center w-full"
                    >
                      <FormControl className="w-full">
                        <Input
                          type="date"
                          value={registerationStarts}
                          onChange={(e) => setRegisterationStarts(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormControl className="w-full mt-2 sm:mt-0">
                        <Input
                          type="time"
                          value={registerationStartTime}
                          onChange={(e) => setRegisterationStartTime(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <Text className="hidden sm:block">to</Text>
                      <FormControl className="w-full mt-2 sm:mt-0">
                        <Input
                          type="date"
                          value={registerationEnds}
                          onChange={(e) => setRegisterationEnds(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormControl className="w-full mt-2 sm:mt-0">
                        <Input
                          type="time"
                          value={registerationEndTime}
                          onChange={(e) => setRegisterationEndTime(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                    </Flex>
                  </VStack>

                  <VStack 
                    spacing={4} 
                    align="stretch" 
                    className="w-full"
                  >
                    <Text 
                      fontWeight="medium" 
                      className="text-gray-700 text-sm"
                    >
                      Event Schedule
                    </Text>
                    <Flex 
                      gap={2} 
                      className="flex-col sm:flex-row items-center w-full"
                    >
                      <FormControl className="w-full">
                        <Input
                          type="date"
                          value={eventStarts}
                          onChange={(e) => setEventStarts(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormControl className="w-full mt-2 sm:mt-0">
                        <Input
                          type="time"
                          value={eventStartTime}
                          onChange={(e) => setEventStartTime(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <Text className="hidden sm:block">to</Text>
                      <FormControl className="w-full mt-2 sm:mt-0">
                        <Input
                          type="date"
                          value={eventEnds}
                          onChange={(e) => setEventEnds(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormControl className="w-full mt-2 sm:mt-0">
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

              <ModalFooter className="border-t border-gray-100 pt-4 px-4 sm:px-6 flex-col sm:flex-row">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto mb-2 sm:mb-0 sm:mr-3 text-gray-600 hover:bg-gray-50"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={updateEvent}
                  className="w-full sm:w-auto px-6 shadow-md hover:shadow-lg transition-shadow"
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