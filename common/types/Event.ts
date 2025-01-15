interface Contact {
  email: string;
  phone: string;
}

interface RegistrationTimeline {
  start: Date;
  end: Date;
}

interface EventTimeline {
  start: Date;
  end: Date;
}

type Mode = "online" | "offline";
type RegistrationType = "internal" | "external";

interface Event {
  name: string;
  desc: string;
  image: string;
  location: string;
  mode: Mode;
  link?: string;
  contact: Contact;
  registeration: RegistrationTimeline;
  eventTimeline: EventTimeline;
  registerationType: RegistrationType;
  pointsAllocated: boolean;
  points: number;
  participants: string[];
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
