interface Token {
  _id: string;
  house?: string;
  profilePicture?: string;
  mid: string;
  fname: string;
  lname: string;
  role: "A" | "S" | "F" | "";
  perms?: string[];
  ay?: number;
  branch?: string;
  certificateTheme?: string;
  theme?: string;
}

export type { Token };
