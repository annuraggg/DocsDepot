interface Points {
  internal: number;
  external: number;
}

type Role = "A" | "S" | "F";
interface Social {
  email: string;
  github: string;
  linkedin: string;
}

interface Settings {
  colorMode: "light" | "dark";
  certificateLayout: "green" | "classic";
}

interface Onboarding {
  firstTime: boolean;
  approved: boolean;
  defaultPW: boolean;
}

interface AcademicDetails {
  academicYear?: number;
  isDSE?: boolean;
  branch: string;
  admissionYear: number;
}

type Gender = "M" | "F" | "O";

interface User {
  _id: string;
  mid: string;
  password: string;
  fname: string;
  lname: string;
  profilePicture: string;
  gender: Gender;
  role: Role;
  house: string;
  academicDetails: AcademicDetails;
  social: Social;
  settings: Settings;
  onboarding: Onboarding;
  permissions: string[];
  points?: {
    [year: string]: {
      [month: string]: {
        internal: number;
        external: number;
        events: number;
      };
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export type {
  User,
  Points,
  Role,
  Gender,
  AcademicDetails,
  Social,
  Settings,
  Onboarding,
};
