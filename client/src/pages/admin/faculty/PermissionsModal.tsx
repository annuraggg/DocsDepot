import React, { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Table,
  Tbody,
  Tr,
  Td,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Flex,
  List,
  ListItem,
  ListIcon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CheckCircleIcon, FileWarningIcon } from "lucide-react";
import { House } from "@shared-types/House";

export interface PermissionsModalProps {
  userid: string;
  isOpen: boolean;
  onClose: () => void;
  onEditOpen: () => void;
  houses: House[];
  perms: string[];
  setPerms: (perms: string[]) => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  userid,
  isOpen,
  onClose,
  onEditOpen,
  houses,
  perms,
  setPerms,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    console.log(userid);
    console.log(houses.find((house) => house.facultyCordinator === userid)?.id);
  }, [userid]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isMobile ? "full" : "3xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
      <ModalContent>
        <ModalHeader>Faculty Permissions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Table>
              <Tbody>
                <CheckboxGroup
                  value={perms}
                  onChange={(e) => setPerms(e as string[])}
                >
                  <Tr>
                    <Td>
                      <Checkbox value="UFC" readOnly>
                        Upload Faculty Certificates
                      </Checkbox>
                    </Td>
                    <Td>
                      <List>
                        <ListItem mb={2}>
                          <ListIcon as={FileWarningIcon} color="yellow.500" />
                          Default permission - Cannot be changed
                        </ListItem>
                        <ListItem mb={2}>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Add their own certifications to the system
                        </ListItem>
                      </List>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <Checkbox value="MHI">Manage Events</Checkbox>
                    </Td>
                    <Td>
                      <List>
                        <ListItem mb={2}>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Create Events
                        </ListItem>
                        <ListItem mb={2}>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Update Events
                        </ListItem>
                        <ListItem>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Manage / Edit Events
                        </ListItem>
                      </List>
                    </Td>
                  </Tr>
                </CheckboxGroup>

                <Tr>
                  <Td>
                    <RadioGroup
                      value={
                        perms.find((perm) => perm.startsWith("H")) ||
                        houses.find(
                          (house) => house.facultyCordinator === userid
                        )?.id ||
                        ""
                      }
                      onChange={(value) => {
                        console.log(value);
                        const updatedPerms = [
                          ...perms.filter((perm) => !perm.startsWith("H")),
                          value,
                        ].filter(Boolean);
                        console.log(perms);
                        setPerms(updatedPerms);
                      }}
                    >
                      <Flex direction="column" gap={3}>
                        {houses.map((house, index) => (
                          <Radio key={index} value={`H${index + 1}`}>
                            House Coordinator - {house.name}
                          </Radio>
                        ))}
                        <Radio value="">None</Radio>
                      </Flex>
                    </RadioGroup>
                  </Td>
                  <Td>
                    <List>
                      <ListItem>
                        <ListIcon as={CheckCircleIcon} color="green.500" />
                        Manage House Profile
                      </ListItem>
                      <ListItem>
                        <ListIcon as={CheckCircleIcon} color="green.500" />
                        Manage House Members
                      </ListItem>
                    </List>
                  </Td>
                </Tr>

                <CheckboxGroup
                  value={perms.filter((perm) => !perm.startsWith("H"))}
                  onChange={(values) => {
                    const nonHValues = values.filter(
                      (value) => !(value as string).startsWith("H")
                    );
                    setPerms([...nonHValues].map(String));
                  }}
                >
                  <Tr>
                    <Td>
                      <Checkbox value="SND">Send Notifications</Checkbox>
                    </Td>
                    <Td>
                      <List>
                        <ListItem>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Send Global Notifications to Users
                        </ListItem>
                      </List>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <Checkbox value="RSP">Reset Student Password</Checkbox>
                    </Td>
                    <Td>
                      <List>
                        <ListItem>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Assist in resetting student passwords when necessary
                        </ListItem>
                      </List>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <Checkbox value="AES">Add/Edit Student</Checkbox>
                    </Td>
                    <Td>
                      <List>
                        <ListItem mb={2}>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Add Students to the system
                        </ListItem>
                        <ListItem mb={2}>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Delete Students from the system
                        </ListItem>
                        <ListItem>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Edit Student Profiles
                        </ListItem>
                      </List>
                    </Td>
                  </Tr>
                </CheckboxGroup>
              </Tbody>
            </Table>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="green"
            onClick={() => {
              onClose();
              onEditOpen();
            }}
          >
            Set
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PermissionsModal;
