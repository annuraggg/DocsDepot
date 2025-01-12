import { Token } from "@shared-types/Token";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const useUser = () => {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    const decoded: Token = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default useUser;
