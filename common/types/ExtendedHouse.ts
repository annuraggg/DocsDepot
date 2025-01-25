import type { Point, House } from "./House";
import type { User } from "./User";
import type { Certificate } from "./Certificate";

interface ExtendedPoint extends Omit<Point, "certificateId"> {
  certificateId: Certificate;
}

interface ExtendedHouse
  extends Omit<
    House,
    "members" | "facultyCordinator" | "studentCordinator" | "points"
  > {
  members: User[];
  facultyCordinator: User;
  studentCordinator: User;
  points: ExtendedPoint[];
}

export type { ExtendedHouse, ExtendedPoint };
