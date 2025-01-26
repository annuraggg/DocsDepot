import { useEffect, useState } from "react";
import { Button, useDisclosure, useToast } from "@chakra-ui/react";
import { Printer } from "lucide-react";
import Loader from "@/components/Loader";
import useAxios from "@/config/axios";
import type { ExtendedCertificate as ICertificate } from "@/types/ExtendedCertificate";
import { Comment } from "@shared-types/Certificate";
import GreenTheme from "./GreenTheme";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { CopyIcon } from "lucide-react";
import CommentSection from "./CommentSection";
import useUser from "@/config/user";
import generatePDF, { usePDF } from "react-to-pdf";
import ClassicTheme from "./ClassicTheme";
import { User } from "@shared-types/User";
import DeleteCertificateModal from "./DeleteCertificateModal";
import EditCertificateModal from "./EditCertificateModal";
import { useNavigate } from "react-router";

interface ExtendedComment extends Omit<Comment, "user"> {
  user: User | string;
}

const Certificate = () => {
  const axios = useAxios();
  const user = useUser();
  const toast = useToast();
  const [certificate, setCertificate] = useState<ICertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [editPrivilege, setEditPrivilege] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { targetRef } = usePDF({ filename: "page.pdf" });
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.location.pathname.split("/")[2];
    axios
      .get(`/certificates/${id}`)
      .then((res) => {
        setCertificate(res.data.data);
        setEditPrivilege(
          user?._id ? user._id === res.data.data.user?._id : false
        );
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Something went wrong",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDownload = async () => {
    const res = await axios.get(`/certificates/${certificate!._id}/download`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${certificate?.name}.${certificate?.extension}`
    );
    document.body.appendChild(link);
    link.click();
  };

  const addComment = async (comment: ExtendedComment) => {
    axios
      .post(`/certificates/${certificate!._id}/comment`, {
        comment: comment,
      })
      .then(() => {
        toast({
          title: "Comment posted",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch((e) => {
        console.error(e);
        toast({
          title: "Error posting comment",
          description: "Please try again later",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const approveCertificate = async () => {
    axios
      .put(`/certificates/${certificate!._id}/accept`)
      .then(() => {
        toast({
          title: "Certificate Approved",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        setCertificate({ ...certificate!, status: "approved" });
      })
      .catch((e) => {
        console.error(e);
        toast({
          title: "Error approving certificate",
          description: "Please try again later",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const rejectCertificate = async () => {
    axios
      .put(`/certificates/${certificate!._id}/reject`)
      .then(() => {
        toast({
          title: "Certificate Rejected",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        setCertificate({ ...certificate!, status: "rejected", earnedXp: 10 });
      })
      .catch((e) => {
        console.error(e);
        toast({
          title: "Error rejecting certificate",
          description: "Please try again later",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  return (
    <div className="p-8 h-[100vh] flex gap-10 w-full">
      <div
        id="certificate-print-area"
        className="w-fullmax-w-[70%] min-w-[70%]"
      >
        {user?.certificateTheme === "classic" ? (
          <ClassicTheme certificate={certificate!} ref={targetRef} />
        ) : (
          <GreenTheme certificate={certificate!} ref={targetRef} />
        )}
      </div>
      <div className="w-full">
        <Button
          className="w-full"
          onClick={() =>
            generatePDF(targetRef, {
              method: "open",
              page: {
                format: "letter",
                orientation: "landscape",
              },
            })
          }
          leftIcon={<Printer size={20} />}
          colorScheme="green"
        >
          Print / Download this Certificate
        </Button>

        {certificate?.uploadType === "url" && (
          <Button
            className="w-full mt-4"
            onClick={() => window.open(certificate.url!)}
            colorScheme="blue"
          >
            View Certificate
          </Button>
        )}

        {certificate?.uploadType === "file" && (
          <Button
            className="w-full mt-4"
            onClick={handleDownload}
            colorScheme="blue"
          >
            Download Original Certficate
          </Button>
        )}

        {certificate?.hashes?.sha256 || certificate?.hashes?.md5 ? (
          <Button className="w-full mt-4" onClick={onOpen} colorScheme="teal">
            Verify Hashes
          </Button>
        ) : null}

        {user?.role === "A" &&
          certificate?.user?.role === "F" &&
          certificate?.status === "pending" && (
            <div className="mt-3 border p-3">
              <p className="text-red-500 mb-3 font-bold">* Admin Controls</p>
              <div className="flex gap-3">
                <Button
                  colorScheme="green"
                  className="w-full"
                  onClick={approveCertificate}
                >
                  Approve Certificate
                </Button>
                <Button
                  colorScheme="red"
                  className="w-full"
                  onClick={rejectCertificate}
                >
                  Reject Certificate
                </Button>
              </div>
            </div>
          )}

        {user?.role === "F" &&
          certificate?.user?.role === "S" &&
          certificate?.status === "pending" &&
          user?.house === certificate?.user?.house && (
            <div className="mt-3 border p-3">
              <p className="text-red-500 mb-3 font-bold">
                * House Cordinator Controls
              </p>
              <div className="flex gap-3">
                <Button
                  colorScheme="green"
                  className="w-full"
                  onClick={approveCertificate}
                >
                  Approve Certificate
                </Button>
                <Button
                  colorScheme="red"
                  className="w-full"
                  onClick={rejectCertificate}
                >
                  Reject Certificate
                </Button>
              </div>
            </div>
          )}

        <div className="my-5">
          {certificate?.status === "pending" && (
            <p className="text-yellow-500 text-sm">
              This certificate is pending approval
            </p>
          )}

          {certificate?.status === "rejected" && (
            <p className="text-red-500 text-sm">
              This certificate has been rejected
            </p>
          )}

          {certificate?.status === "approved" && (
            <p className="text-green-500 text-sm">
              {certificate?.user?.role === "S"
                ? `House Earned ${certificate.earnedXp} XP from this certificate`
                : "This certificate has been approved"}
            </p>
          )}
        </div>

        {editPrivilege && (
          <div className="flex gap-3 mb-5">
            <Button
              colorScheme="blue"
              className="w-full"
              disabled={certificate?.status === "approved"}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit this Certificate
            </Button>
            <Button
              colorScheme="red"
              className="w-full"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={certificate?.status === "approved"}
            >
              Delete This Certificate
            </Button>

            <DeleteCertificateModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              certificate={certificate!}
              onDelete={() => {
                navigate("/certificates");
              }}
            />

            <EditCertificateModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              certificate={certificate!}
              onUpdate={(updatedCertificate) => {
                // Update local state or parent component state
                setCertificate(updatedCertificate);
              }}
            />
          </div>
        )}

        <CommentSection certificate={certificate!} onCommentAdd={addComment} />
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Verify Hashes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>
              <strong>MD5:</strong> {certificate?.hashes?.md5}
              <Button
                size="xs"
                ml={2}
                variant="ghost"
                onClick={() => handleCopy(certificate?.hashes?.md5 || "")}
              >
                <CopyIcon size={20} />
              </Button>
            </p>
            <p>
              <strong>SHA256:</strong> {certificate?.hashes?.sha256}
              <Button
                size="xs"
                ml={2}
                paddingY={5}
                variant="ghost"
                onClick={() => handleCopy(certificate?.hashes?.sha256 || "")}
              >
                <CopyIcon size={20} />
              </Button>
            </p>
            <p className="mt-4">
              To verify these hashes, run the following command:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>
                <strong>Windows:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 flex justify-between items-center">
                  certutil -hashfile path\to\your\certificate.pdf MD5
                  <Button
                    size="xs"
                    ml={2}
                    variant="ghost"
                    onClick={() =>
                      handleCopy(
                        "certutil -hashfile path\\to\\your\\certificate.pdf MD5"
                      )
                    }
                  >
                    <CopyIcon size={20} />
                  </Button>
                </pre>
                <pre className="bg-gray-100 p-2 rounded mt-1 flex justify-between items-center">
                  certutil -hashfile path\to\your\certificate.pdf SHA256
                  <Button
                    size="xs"
                    ml={2}
                    variant="ghost"
                    onClick={() =>
                      handleCopy(
                        "certutil -hashfile path\\to\\your\\certificate.pdf SHA256"
                      )
                    }
                  >
                    <CopyIcon size={20} />
                  </Button>
                </pre>
              </li>
              <li className="mt-2">
                <strong>macOS/Linux:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 flex justify-between items-center">
                  md5 path/to/your/certificate.pdf
                  <Button
                    size="xs"
                    ml={2}
                    variant="ghost"
                    onClick={() =>
                      handleCopy("md5 path/to/your/certificate.pdf")
                    }
                  >
                    <CopyIcon size={20} />
                  </Button>
                </pre>
                <pre className="bg-gray-100 p-2 rounded mt-1 flex justify-between items-center">
                  sha256sum path/to/your/certificate.pdf
                  <Button
                    size="xs"
                    ml={2}
                    variant="ghost"
                    onClick={() =>
                      handleCopy("sha256sum path/to/your/certificate.pdf")
                    }
                  >
                    <CopyIcon size={20} />
                  </Button>
                </pre>
              </li>
            </ul>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Certificate;
