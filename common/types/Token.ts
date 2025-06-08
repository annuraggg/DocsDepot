interface Token {
  _id: string;
  house?: string | undefined;
  profilePicture?: string | undefined;
  mid: string;
  fname: string;
  lname: string;
  role: "A" | "S" | "F" | "";
  perms?: string[] | undefined;
  ay?: number | undefined;
  branch?: string | undefined;
  certificateTheme?: string | undefined;
  theme?: string | undefined;
}

export type { Token };
