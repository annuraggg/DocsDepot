interface Otp {
  mid: string;
  otp: string;
  createdOn: Date;
  expiresAt: Date;
}

export type { Otp };
