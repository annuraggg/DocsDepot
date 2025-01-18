import React from 'react';
import type { ExtendedCertificate as Certificate } from "@/types/ExtendedCertificate";

const titleCase = (str?: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ClassicTheme = (
  { certificate }: { certificate: Certificate },
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  return (
    <div className="w-[1024px] h-[680px] bg-white relative overflow-hidden shadow-2xl" ref={ref}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/api/placeholder/1024/768')] opacity-10" />

      {/* Border Design */}
      <div className="absolute inset-0 border-[16px] border-double border-gray-200" />

      {/* Corner Ornaments */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-blue-800 m-8" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-blue-800 m-8" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-blue-800 m-8" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-blue-800 m-8" />

      {/* Content */}
      <div className="h-full flex flex-col items-center justify-center px-24 text-center">
        <div className="absolute top-20 right-20">
          {certificate?.status === "approved" && (
            <div className="w-24 h-24 border-8 border-green-600 rounded-full flex items-center justify-center rotate-[-15deg]">
              <span className="text-green-600 font-bold text-sm">VERIFIED</span>
            </div>
          )}
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-serif text-blue-900 mb-2">
            {titleCase(certificate?.type)} Certificate
          </h1>
          <p className="text-xl text-gray-600 font-serif">
            {titleCase(certificate?.level)} Level
          </p>
        </div>

        <div className="space-y-8 mb-12">
          <p className="text-xl text-gray-600 font-serif">This certifies that</p>
          <h2 className="text-4xl font-serif text-blue-800">
            {certificate?.user?.fname} {certificate?.user?.lname}
          </h2>
          <h3 className="text-3xl font-serif text-gray-800">{certificate?.name}</h3>
          <p className="text-xl text-gray-700">
            Issued by {certificate?.issuingOrganization}
          </p>
        </div>

        <div className="flex justify-center gap-24 text-gray-600 font-serif">
          <div>
            <p className="text-sm">Issue Date</p>
            <p className="text-lg">
              {titleCase(certificate?.issueDate?.month)} {certificate?.issueDate?.year}
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

export default React.forwardRef(ClassicTheme);