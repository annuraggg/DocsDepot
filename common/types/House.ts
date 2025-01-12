interface Certificates {
  internal: number;
  external: number;
  events: number;
}

interface House {
  name: string;
  logo: string;
  points: {
    [key: number]: {
      [key: string]: {
        internal: number;
        external: number;
        events: number;
      };
    };
  };
  color: string;
  fc: string[];
  sc: string;
  members: string[];
  ig: string;
  lk: string;
  tw: string;
  abstract: string;
  desc: string;
  certificates: Certificates;
  no: number;
  banner: string;
  createdAt: Date;
}

export type { House, Certificates };
