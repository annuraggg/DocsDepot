import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User2,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ChevronRightIcon,
} from "lucide-react";
import { Container, Heading } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import useAxios from "@/config/axios";
import Loader from "@/components/Loader";

interface Enrollment {
  _id: string;
  about: string;
  cgpa: number;
  technical: string;
  projects: string;
  createdAt: string;
}

const Enrollments: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [update, setUpdate] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [cgpaFilter, setCgpaFilter] = useState("");
  const [sortBy, setSortBy] = useState<"cgpa" | "recent">("recent");

  const toast = useToast();
  const axios = useAxios();

  const filteredAndSortedEnrollments = useMemo(() => {
    let result = enrollments.filter(
      (enrollment) =>
        enrollment.about.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.technical.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (cgpaFilter) {
      result = result.filter((enrollment) => {
        const cgpa = parseFloat(enrollment.cgpa.toString());
        switch (cgpaFilter) {
          case "high":
            return cgpa >= 8.0;
          case "medium":
            return cgpa >= 6.0 && cgpa < 8.0;
          case "low":
            return cgpa < 6.0;
          default:
            return true;
        }
      });
    }

    if (sortBy === "cgpa") {
      result.sort(
        (a, b) => parseFloat(b.cgpa.toString()) - parseFloat(a.cgpa.toString())
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [enrollments, searchTerm, cgpaFilter, sortBy]);

  useEffect(() => {
    axios
      .get("/enrollment")
      .then((res) => {
        setLoading(false);
        setEnrollments(res.data.data);
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
        setLoading(false);
      });
  }, [update]);

  const acceptDude = () => {
    if (!selectedEnrollment) return;

    axios
      .post("/enrollment/accept", { id: selectedEnrollment._id })
      .then(() => {
        setUpdate((prev) => prev + 1);
        setSelectedEnrollment(null);
        toast({
          title: "Success",
          description: "Enrollment accepted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
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
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <Container maxW="7xl" py={4} px={{ base: 2, md: 4 }}>
      <div className="container mx-auto px-0 py-4 md:py-6">
        <Heading
          size="lg"
          className="mb-4 md:mb-8 px-2 md:px-0 text-xl md:text-2xl"
        >
          Enrollment Requests
        </Heading>

        <div className="mb-6 space-y-4 md:space-y-0 px-2 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search enrollments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
            </div>

            <select
              value={cgpaFilter}
              onChange={(e) => setCgpaFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            >
              <option value="">All CGPA</option>
              <option value="high">High (8.0+)</option>
              <option value="medium">Medium (6.0-8.0)</option>
              <option value="low">Low (Below 6.0)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "cgpa" | "recent")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            >
              <option value="recent">Most Recent</option>
              <option value="cgpa">Highest CGPA</option>
            </select>
          </div>
        </div>

        {filteredAndSortedEnrollments.length === 0 ? (
          <div className="text-center py-8 md:py-10 px-2">
            <p className="text-base md:text-xl text-gray-500">
              No enrollment requests found
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3 md:space-y-4 px-2 md:px-0">
              {filteredAndSortedEnrollments.map((enrollment, index) => (
                <motion.div
                  key={enrollment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                  }}
                  className="bg-white border rounded-lg p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-shadow"
                >
                  <div className="w-full md:w-3/4 mb-4 md:mb-0">
                    <h2 className="text-base md:text-lg font-semibold mb-2 flex items-center">
                      <User2 className="mr-2 text-blue-600 h-4 w-4 md:h-5 md:w-5" />
                      Enrollment Request {index + 1}
                    </h2>
                    <p className="text-gray-600 line-clamp-2 text-sm md:text-base mb-2">
                      {enrollment.about}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs md:text-sm flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                        CGPA: {enrollment.cgpa}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs md:text-sm flex items-center">
                        <BookOpen className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                        <span className="truncate max-w-[120px] md:max-w-none">
                          {enrollment.technical}
                        </span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEnrollment(enrollment)}
                    className="w-full md:w-auto bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center text-sm md:text-base"
                  >
                    View Details <ChevronRightIcon className="ml-2 h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
        <AnimatePresence>
          {selectedEnrollment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                  <XCircle size={24} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h1 className="font-bold mb-4 flex items-center text-lg md:text-xl">
                      <FileText className="mr-2 text-blue-600 h-5 w-5" />
                      Enrollment Details
                    </h1>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center">
                          <User2 className="mr-2 text-green-600 h-4 w-4 md:h-5 md:w-5" />
                          About
                        </h3>
                        <p className="bg-gray-100 p-3 rounded-lg text-sm md:text-base">
                          {selectedEnrollment.about}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center">
                          <TrendingUp className="mr-2 text-blue-600 h-4 w-4 md:h-5 md:w-5" />
                          CGPA
                        </h3>
                        <p className="bg-gray-100 p-3 rounded-lg text-sm md:text-base">
                          {selectedEnrollment.cgpa}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center">
                          <BookOpen className="mr-2 text-purple-600 h-4 w-4 md:h-5 md:w-5" />
                          Technical Skills
                        </h3>
                        <p className="bg-gray-100 p-3 rounded-lg text-sm md:text-base">
                          {selectedEnrollment.technical}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center">
                          <BookOpen className="mr-2 text-indigo-600 h-4 w-4 md:h-5 md:w-5" />
                          Projects
                        </h3>
                        <p className="bg-gray-100 p-3 rounded-lg text-sm md:text-base">
                          {selectedEnrollment.projects}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-8 flex flex-col-reverse md:flex-row justify-end gap-3 md:space-x-4">
                  <button
                    onClick={() => setSelectedEnrollment(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm md:text-base"
                  >
                    Close
                  </button>
                  <button
                    onClick={acceptDude}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center text-sm md:text-base"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Container>
  );
};

export default Enrollments;
