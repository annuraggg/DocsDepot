interface Event {
  name: string;
  image: string;
  desc: string;
  location: string;
  mode: "online" | "offline";
  link?: string;
  email: string;
  phone: string;
  eventStarts: Date;
  eventEnds: Date;
  registerationStarts: Date;
  registerationEnds: Date;
  createdAt: Date;
  registerationType: "internal" | "external";
  pointsAllocated: boolean;
  registered: string[];
  points: number;
  participants: string[]; // Assuming ObjectId is used for references
}

export type { Event };
