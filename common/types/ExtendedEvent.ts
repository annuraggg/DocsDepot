import type { Event } from "./Event";
import type { User } from "./User";

interface ExtendedEvent extends Omit<Event, "participants"> {
  participants: ExtendedUser[];
}

interface ExtendedUser extends User {
  registeredAt: Date;
}

export type { ExtendedEvent, ExtendedUser };
