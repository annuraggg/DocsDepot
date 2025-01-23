import { Point, House } from "./House";
import { User } from "./User";
import { Certificate } from "./Certificate";

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
