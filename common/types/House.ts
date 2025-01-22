interface Social {
  instagram?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
}

interface Point {
  certificateId: string;
  userId: string;
  points: number;
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
  points: Point[];
  social: Social;
  createdAt: Date;
  updatedAt: Date;
}

export type { House, Social, Point };
