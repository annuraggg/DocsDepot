interface Comment {
  user: string;
  comment: string;
  createdAt?: Date;
}

interface IssueDate {
  month: string;
  year: number;
}

interface ExpirationDate {
  month: string | null;
  year: number | null;
}

type CertificateType = "external" | "internal" | "event";
type CertificateLevel = "beginner" | "intermediate" | "advanced" | "department";
type UploadType = "url" | "print" | "file";
type CertificateStatus = "approved" | "rejected" | "pending";

interface Hashes {
  sha256?: string;
  md5?: string;
}

interface Certificate {
  _id?: string
  user: string;
  name: string;
  issuingOrganization: string;
  issueDate: IssueDate;
  expires: boolean;
  expirationDate?: ExpirationDate;
  type: CertificateType;
  level: CertificateLevel;
  uploadType: UploadType;
  url?: string | null;
  extension?: string;
  status: string;
  earnedXp: number;
  comments: Comment[];
  hashes?: Hashes;
  createdAt?: Date;
  updatedAt?: Date;
}

export type {
  Certificate,
  Comment,
  IssueDate,
  ExpirationDate,
  CertificateType,
  CertificateLevel,
  UploadType,
  CertificateStatus,
  Hashes,
};
