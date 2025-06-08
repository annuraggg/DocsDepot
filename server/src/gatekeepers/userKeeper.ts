import { type Token } from "@shared-types/Token.js";
import { type User } from "@shared-types/User.js";

class UserKeeper {
  token: Token;
  user: User;

  constructor(token: Token, user: User) {
    this.token = token;
    this.user = user;
    if (!this.token) throw new Error("Token not found");
  }

  delete = async () => {
    if (this.token.role === "F") {
      if (this.token.perms?.includes("AES") && this.user.role === "S") {
        return "Success";
      }

      if (this.token.perms?.includes("AEF") && this.user.role === "F") {
        return "Success";
      }
    }

    if (this.token.role === "A") {
      return "Success";
    }

    throw new Error("Unauthorized");
  };

  update = async () => {
    if (this.token.mid === this.user.mid) {
      return "Success";
    }

    if (this.token.role === "F") {
      if (this.token.perms?.includes("AES") && this.user.role === "S") {
        return "Success";
      }

      if (this.token.perms?.includes("AEF") && this.user.role === "F") {
        return "Success";
      }
    }

    if (this.token.role === "A") {
      return "Success";
    }

    throw new Error("Unauthorized");
  };

  create = async () => {
    if (this.token.role === "F") {
      if (this.token.perms?.includes("AES") && this.user.role === "S") {
        return "Success";
      }

      if (this.token.perms?.includes("AEF") && this.user.role === "F") {
        return "Success";
      }
    }

    if (this.token.role === "A") {
      return "Success";
    }

    throw new Error("Unauthorized");
  };

  reset = async () => {
    if (this.token.role === "F") {
      if (this.token.perms?.includes("RSP") && this.user.role === "S") {
        return "Success";
      }

      if (this.token.perms?.includes("RFP") && this.user.role === "F") {
        return "Success";
      }
    }

    if (this.token.role === "A") {
      return "Success";
    }

    throw new Error("Unauthorized");
  };
}

export default UserKeeper;
