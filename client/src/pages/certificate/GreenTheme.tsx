import type { ExtendedCertificate as Certificate } from "@/types/ExtendedCertificate";
import CertificateBg from "@/assets/img/certificate-bg.svg";
import React from "react";

const certificateStyle = {
  backgroundImage: `url(${CertificateBg})`,
  backgroundSize: "cover",
};

const titleCase = (str?: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const GreenTheme = (
  { certificate }: { certificate: Certificate },
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  return (
    <div
      className="w-[1024px] h-[680px] bg-white relative overflow-hidden shadow-2xl rounded-xl border-2 border-gray-300"
      style={certificateStyle}
      ref={ref}
    >
      {/* Content */}
      <div className="h-full flex flex-col items-center justify-center px-24 text-center">
        <div className="absolute top-20 right-20">
          {certificate?.status === "approved" && (
            <div className="w-24 h-24 border-8 border-green-600 rounded-full flex items-center justify-center rotate-[-15deg]">
              <span className="text-green-600 font-bold text-sm">VERIFIED</span>
            </div>
          )}

          {certificate?.status === "rejected" && (
            <div className="w-24 h-24 border-8 border-red-600 rounded-full flex items-center justify-center rotate-[-15deg]">
              <span className="text-red-600 font-bold text-sm">REJECTED</span>
            </div>
          )}
        </div>

        <div className="mb-12">
          <p className="text-gray-500">
            {titleCase(certificate?.type)} Certificate -
            {titleCase(certificate?.level)} Level
          </p>
        </div>

        <div className="mb-12">
          <p className="text-lg text-gray-600 font-serif">
            This certificate is issued to
          </p>
          <p className="text-7xl  text-green-500 font-rouge">
            {certificate?.user?.fname} {certificate?.user?.lname}
          </p>

          <p className="text-xl text-gray-600 font-serif mt-5">for</p>

          <h3>{certificate?.name}</h3>
          <p className=" text-gray-700">
            Issued by {certificate?.issuingOrganization}
          </p>
        </div>

        <div className="flex justify-center gap-24 text-gray-600 font-serif">
          <div>
            <p className="text-sm">Issue Date</p>
            <p className="text-lg">
              {titleCase(certificate?.issueDate?.month)}{" "}
              {certificate?.issueDate?.year}
            </p>
          </div>
          {certificate?.expires && (
            <div>
              <p className="text-sm">Valid Until</p>
              <p className="text-lg">
                {titleCase(certificate?.expirationDate?.month || "")}{" "}
                {certificate?.expirationDate?.year}
              </p>
            </div>
          )}
        </div>

        <div className="absolute bottom-12 text-sm text-gray-500">
          <p>Certificate ID: {certificate?._id}</p>
        </div>
      </div>
    </div>
  );
};

export default React.forwardRef(GreenTheme);
