interface Points {
  internal: number;
  external: number;
}

interface House {
  id: string;
  points: {
    [key: number]: {
      [key: string]: {
        internal: number;
        external: number;
        events: number;
      };
    };
  };
}

interface Certificates {
  external: number;
  internal: number;
  event: number;
}

type Role = "A" | "S" | "F";

interface User {
  mid: string;
  password: string;
  fname: string;
  lname: string;
  profilePicture: string;
  email: string;
  gender: "M" | "F" | "Male" | "Female";
  role: Role;
  XP: number;
  AY?: number;
  dse: boolean;
  createdOn: Date;
  branch: string;
  house: House | null;
  firstTime: boolean;
  approved: boolean;
  defaultPW: boolean;
  registeredEvents: string[];
  certificates: Certificates;
  github: string;
  linkedin: string;
  colorMode: "light" | "dark";
  perms: any[];
}

export type { House, Certificates, User, Points, Role };
