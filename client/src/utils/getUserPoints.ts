import { Certificate } from "@shared-types/Certificate";
import { House, Point } from "@shared-types/House";
import { User } from "@shared-types/User";

interface PointsResult {
  external: number;
  internal: number;
  events: number;
  total: number;
}

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

const getUserPoints = (userId: string, house: ExtendedHouse): PointsResult => {
  // Initialize result object
  const result: PointsResult = {
    external: 0,
    internal: 0,
    events: 0,
    total: 0,
  };

  console.log(house)

  // Filter points for the specific user
  const userPoints = house.points.filter((point) => point.userId === userId);

  // Calculate points by certificate type
  userPoints.forEach((point) => {
    const certificate = point.certificateId;

    switch (certificate.type) {
      case "external":
        result.external += point.points;
        break;
      case "internal":
        result.internal += point.points;
        break;
      case "event":
        result.events += point.points;
        break;
    }
  });

  // Calculate total
  result.total = result.external + result.internal + result.events;

  console.log(result)
  return result;
};

export { getUserPoints, type PointsResult };
