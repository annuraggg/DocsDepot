import { type Token } from "@shared-types/Token.js";

class AdminKeeper {
  token: Token;

  constructor(token: Token) {
    this.token = token;
  }

  check = async () => {
    if (this.token.role === "A") {
      return "Success";
    }

    throw new Error("Unauthorized");
  };
}

export default AdminKeeper;
