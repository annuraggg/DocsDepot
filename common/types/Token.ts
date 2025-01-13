interface Token {
  _id: string;
  house?: string;
  mid: string;
  fname: string;
  lname: string;
  picture: string;
  role: "A" | "S" | "F" | "";
  perms?: string[];
  ay?: number;
  branch?: string;
}

export type { Token };
