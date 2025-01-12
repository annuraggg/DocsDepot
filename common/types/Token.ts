interface Token {
  mid: string;
  fname: string;
  lname: string;
  picture: string;
  role: "A" | "S" | "F";
}

export type { Token };
