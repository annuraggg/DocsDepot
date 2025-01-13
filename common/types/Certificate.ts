interface Certificate {
  _id: string;
  mid: string;
  certificateName: string;
  issuingOrg: string;
  issueMonth: string;
  issueYear: number;
  expires: boolean;
  expiryMonth: string | null;
  expiryYear: number | null;
  certificateType: "external" | "internal" | "event";
  certificateLevel: "beginner" | "intermediate" | "advanced" | "Department";
  uploadType: "url" | "file" | "print";
  certificateURL: string | null;
  status: "approved" | "rejected" | "pending";
  house: string | null;
  name: string;
  submittedYear: number;
  submittedMonth: string;
  comments: string | null;
  xp: number;
  role: "F" | "M";
  points: number;
  date: Date;
  ext: string;
  sha256: string;
  md5: string;
}

export type { Certificate };
