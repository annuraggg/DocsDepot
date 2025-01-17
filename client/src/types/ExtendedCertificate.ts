import { Certificate } from "../../../common/types/Certificate";
import { User } from "../../../common/types/User";

interface ExtendedCertificate extends Omit<Certificate, "user"> {
  user: User;
}

export type { ExtendedCertificate };
