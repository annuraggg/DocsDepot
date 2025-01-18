interface Social {
  instagram?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
}

interface PointData {
  internal: number;
  external: number;
  events: number;
}

interface YearlyPoints {
  [key: string]: {
    january?: PointData;
    february?: PointData;
    march?: PointData;
    april?: PointData;
    may?: PointData;
    june?: PointData;
    july?: PointData;
    august?: PointData;
    september?: PointData;
    october?: PointData;
    november?: PointData;
    december?: PointData;
  }
}

interface Point {
  certificateId: string;
  points: number | YearlyPoints;
  createdAt: Date;
  updatedAt: Date;
}

interface House {
  _id: string;
  name: string;
  abstract: string;
  desc: string;
  logo: string;
  banner: string;
  color: string;
  facultyCordinator: string;
  studentCordinator?: string | null;
  members: string[];
  points: Point[]
  social: Social;
  createdAt: Date;
  updatedAt: Date;
}

export type { House, Social, Point };
