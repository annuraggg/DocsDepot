import { User } from "@shared-types/User";
import { House } from "@shared-types/House";

export interface FacultyState {
  loading: boolean;
  faculty: User[];
  filteredFaculty: User[];
  houses: House[];
  searchQuery: string;
  delItem: any;
  mid: string;
  fname: string;
  lname: string;
  email: string;
  gender: string;
  facOID: string;
  perms: string[];
}

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermsOpen: () => void;
  facultyData: {
    fname: string;
    lname: string;
    email: string;
    gender: string;
  };
  setFacultyData: (data: any) => void;
  updateFaculty: () => void;
}

export interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditOpen: () => void;
  houses: House[];
  perms: string[];
  setPerms: (perms: string[]) => void;
}

export interface DeleteAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelRef: React.RefObject<any>;
}