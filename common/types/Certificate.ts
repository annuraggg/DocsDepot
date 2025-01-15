interface Comment {
  _id: string;
  comment: string;
  user: string;
  createdAt: string;
}

interface Certificate {
  _id: string;
  user: string;
  certificateName: string;
  issuingOrg: string;
  issueMonth: string;
  issueYear: number;
  expires: boolean;
  expiryMonth: string | null;
  expiryYear: number | null;
  certificateType: "external" | "internal" | "event";
  certificateLevel: "beginner" | "intermediate" | "advanced" | "department";
  uploadType: "url" | "file" | "print";
  certificateURL: string | null;
  status: "approved" | "rejected" | "pending";
  comments: Comment[];
  xp: number;
  points: number;
  ext?: string;
  sha256?: string;
  md5?: string;
}

export type { Certificate, Comment };
