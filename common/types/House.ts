interface Point {
  certificateId: string;
  userId: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Social {
  instagram?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
}

interface House {
  _id: string;
  name: string;
  id: string;
  abstract: string;
  desc: string;
  logo: string;
  banner: string;
  color: string;
  facultyCordinator?: string | null;
  studentCordinator?: string | null;
  members: string[];
  points: Point[];
  social: Social;
  createdAt: Date;
  updatedAt: Date;
}

export type { House, Social, Point };