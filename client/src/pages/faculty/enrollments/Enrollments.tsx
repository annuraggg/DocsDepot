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

  const renderEnrollmentModal = () => {
    if (!selectedEnrollment) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white w-11/12 max-w-4xl rounded-xl shadow-2xl p-8 relative"
        >
          <button
            onClick={() => setSelectedEnrollment(null)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <XCircle size={24} />
          </button>

          <h1 className="font-bold mb-4 flex items-center">
            <FileText className="mr-2 text-blue-600" />
            Enrollment Details
          </h1>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <User2 className="mr-2 text-green-600" /> About
                  </h3>
                  <p className="bg-gray-100 p-4 rounded-lg">
                    {selectedEnrollment.about}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <TrendingUp className="mr-2 text-blue-600" /> CGPA
                  </h3>
                  <p className="bg-gray-100 p-4 rounded-lg">
                    {selectedEnrollment.cgpa}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <BookOpen className="mr-2 text-purple-600" /> Technical
                    Skills
                  </h3>
                  <p className="bg-gray-100 p-4 rounded-lg">
                    {selectedEnrollment.technical}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <BookOpen className="mr-2 text-indigo-600" /> Projects
                  </h3>
                  <p className="bg-gray-100 p-4 rounded-lg">
                    {selectedEnrollment.projects}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => setSelectedEnrollment(null)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Close
            </button>
            <button
              onClick={acceptDude}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
            >
              <CheckCircle2 className="mr-2" /> Accept
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderFilterSection = () => (
    <div className="mb-6 flex justify-between items-center">
      <div className="flex items-center space-x-4 w-full">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search enrollments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <select
          value={cgpaFilter}
          onChange={(e) => setCgpaFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All CGPA</option>
          <option value="high">High (8.0+)</option>
          <option value="medium">Medium (6.0-8.0)</option>
          <option value="low">Low (Below 6.0)</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "cgpa" | "recent")}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="recent">Most Recent</option>
          <option value="cgpa">Highest CGPA</option>
        </select>
      </div>
    </div>
  );

  return (
    <Container maxW="7xl" py={4}>
      <div className="container mx-auto px-4 py-6">
        <Heading size="lg" className="mb-8">
          Enrollment Requests
        </Heading>

        {renderFilterSection()}

        {filteredAndSortedEnrollments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500">
              No enrollment requests found
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {filteredAndSortedEnrollments.map((enrollment, index) => (
                <motion.div
                  key={enrollment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                  }}
                  className="bg-white border rounded-lg p-6 flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <div>
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                      <User2 className="mr-2 text-blue-600" />
                      Enrollment Request {index + 1}
                    </h2>
                    <p className="text-gray-600 line-clamp-2 mb-2">
                      {enrollment.about}
                    </p>
                    <div className="flex space-x-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
                        <TrendingUp className="mr-1" size={16} />
                        CGPA: {enrollment.cgpa}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center">
                        <BookOpen className="mr-1" size={16} />
                        {enrollment.technical}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEnrollment(enrollment)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
                  >
                    View Details <ChevronRightIcon className="ml-2" />
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        <AnimatePresence>
          {selectedEnrollment && renderEnrollmentModal()}
        </AnimatePresence>
      </div>
    </Container>
  );
};

export default Enrollments;
