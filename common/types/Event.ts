interface Contact {
  email: string;
  phone: string;
}

interface RegistrationTimeline {
  start: Date;
  end: Date;
}

interface EventTimeline {
  start: string;
  end: string;
}

type Mode = "online" | "offline";
type RegistrationType = "internal" | "external";

interface Participant {
  user: string;
  registeredAt: Date;
}

interface Event {
  _id: string;
  name: string;
  desc: string;
  image: string;
  location: string;
  mode: Mode;
  link?: string;
  contact: Contact;
  registrationTimeline: RegistrationTimeline;
  eventTimeline: EventTimeline;
  registerationType: RegistrationType;
  pointsAllocated: boolean;
  points: number;
  participants?: Participant[];
  createdAt: Date;
  updatedAt: Date;
}

export type {
  Event,
  Contact,
  RegistrationTimeline,
  EventTimeline,
  Mode,
  RegistrationType,
};
