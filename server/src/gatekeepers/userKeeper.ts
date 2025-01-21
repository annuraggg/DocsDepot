import { Token } from "docsdepot-types/Token";
import { User } from "docsdepot-types/User";

class UserKeeper {
  token: Token;
  user: User;

  constructor(token: Token, User) {
    this.token = token;
    this.user = User;
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
