import { useEffect, useState } from "react";
import { Button, useDisclosure, useToast } from "@chakra-ui/react";
import { Printer } from "lucide-react";
import Loader from "@/components/Loader";
import useAxios from "@/config/axios";
import type {
  Certificate as ICertificate,
  Comment,
} from "@shared-types/Certificate";
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

const Certificate = () => {
  const axios = useAxios();
  const user = useUser();
  const toast = useToast();
  const [certificate, setCertificate] = useState<ICertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [editPrivilege, setEditPrivilege] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { targetRef } = usePDF({ filename: "page.pdf" });

  useEffect(() => {
    const id = window.location.pathname.split("/")[2];
    axios
      .get(`/certificates/${id}`)
      .then((res) => {
        setCertificate(res.data.data);
        setEditPrivilege(user?._id ? user._id === res.data.data.user : false);
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
    link.setAttribute("download", `${certificate?.certificateName}.${certificate?.ext}`);
    document.body.appendChild(link);
    link.click();
  }

  const addComment = async (
    comment: Omit<Comment, "_id" | "createdAt">
  ): Promise<void> => {
    return Promise.resolve();
  };

  return (
    <div className="p-8 h-[100vh] flex gap-10 w-full">
      <div
        id="certificate-print-area"
        className="w-full bg-red-50 max-w-[70%] min-w-[70%]"
      >
        <GreenTheme certificate={certificate!} ref={targetRef} />
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
            onClick={() => window.open(certificate.certificateURL!)}
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

        {certificate?.sha256 || certificate?.md5 ? (
          <Button className="w-full mt-4" onClick={onOpen} colorScheme="teal">
            Verify Hashes
          </Button>
        ) : null}

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
              House Earned {certificate.xp} XP from this certificate
            </p>
          )}
        </div>

        {editPrivilege && (
          <div className="flex gap-3 mb-5">
            <Button
              colorScheme="red"
              className="w-full"
              disabled={certificate?.status === "approved"}
            >
              Edit this Certificate
            </Button>
            <Button colorScheme="green" className="w-full">
              Delete This Certificate
            </Button>
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
              <strong>MD5:</strong> {certificate?.md5}
              <Button
                size="xs"
                ml={2}
                variant="ghost"
                onClick={() => handleCopy(certificate?.md5 || "")}
              >
                <CopyIcon size={20} />
              </Button>
            </p>
            <p>
              <strong>SHA256:</strong> {certificate?.sha256}
              <Button
                size="xs"
                ml={2}
                paddingY={5}
                variant="ghost"
                onClick={() => handleCopy(certificate?.sha256 || "")}
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
