import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import Logo from "@/assets/img/logo.png";
import useAxios from "@/config/axios";
import { Spinner, useToast } from "@chakra-ui/react";

const IntroModal = () => {
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    about: "",
    technical: "",
    projects: "",
    cgpa: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const axios = useAxios();
  const toast = useToast();

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const incrementPage = () => {
    switch (page) {
      case 1:
        setPage(2);
        break;
      case 2:
        setPage(4);
        break;
      case 4:
        if (!formData.about || !formData.technical) {
          toast({
            title: "Error",
            description: "Please fill all fields",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        setPage(5);
        break;
      case 5:
        if (!formData.projects || !formData.cgpa) {
          toast({
            title: "Error",
            description: "Please fill all fields",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        if (Number(formData.cgpa) > 10 || Number(formData.cgpa) < 0) {
          toast({
            title: "Error",
            description: "CGPA should be between 0 and 10",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        sendData();
        break;
    }
  };

  const decrementPage = () => {
    switch (page) {
      case 2:
        setPage(1);
        break;
      case 4:
        setPage(2);
        break;
      case 5:
        setPage(4);
        break;
    }
  };

  const sendData = () => {
    setSubmitting(true);
    axios
      .post("/enrollment", formData)
      .then(() => {
        setIsAlertOpen(true);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to submit data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const logoutAndSave = () => {
    Cookies.remove("token");
    window.location.href = "/auth";
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      x: 300,
      scale: 0.8,
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      x: -300,
      scale: 0.8,
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  const renderModalContent = () => {
    switch (page) {
      case 1:
        return (
          <motion.div
            key="page1"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="text-center p-8 space-y-6"
          >
            <div className="flex items-center justify-center gap-3">
              <motion.h2
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold"
              >
                Welcome to
              </motion.h2>
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                src={Logo}
                alt="Logo"
                className="w-48 h-auto"
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg text-gray-600"
            >
              Our innovative house system, certificate uploads, and exciting
              events empower you to excel academically and personally. Join a
              house, showcase your achievements, participate in events, and earn
              XP to make your college experience truly unforgettable.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="italic text-blue-600"
            >
              Click Next to See How
            </motion.p>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="page2"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="p-8 space-y-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl mb-5 font-bold text-center"
            >
              Your Pathway to Coding Excellence and Collaboration
            </motion.h2>
            <div className="space-y-4">
              {[
                {
                  title: "Houses",
                  desc: "Join dynamic Houses, engage in coding events, and test teamwork. Accumulate House Points (HP) and XP for an exciting journey of growth.",
                },
                {
                  title: "Events",
                  desc: "Ignite Curiosity. Access real-world events and challenges that align with your studies. Participate to Win XP.",
                },
                {
                  title: "Certificates",
                  desc: "Hone your coding mastery through the certifications youve received.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="bg-blue-50 p-4 rounded-lg"
                >
                  <h3 className="font-bold text-xl mb-2 text-blue-700">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="page4"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="p-8 space-y-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-4"
            >
              A Few Things Before We Get Started
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4"
            >
              <p className="text-yellow-700">
                Note that you must fill certifications and Technical details
                correctly as they will be verified by the admin. Your house
                allotment will be based on this data.
              </p>
            </motion.div>
            <motion.textarea
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              id="about"
              placeholder="Write a Few Things About Yourself (Do not mention identifying details)"
              className="w-full p-3 border rounded-lg h-32 mb-4"
              value={formData.about}
              onChange={handleInputChange}
            />
            <motion.textarea
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              id="technical"
              placeholder="Write About Your Technical Skills"
              className="w-full p-3 border rounded-lg h-32"
              value={formData.technical}
              onChange={handleInputChange}
            />
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            key="page5"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="p-8 space-y-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-4"
            >
              A Few Things Before We Get Started
            </motion.h2>
            <motion.textarea
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              id="projects"
              placeholder="List your Projects, with a short description of each project separated by a comma (,)"
              className="w-full p-3 border rounded-lg h-48 mb-4"
              value={formData.projects}
              onChange={handleInputChange}
            />
            <motion.input
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              id="cgpa"
              type="number"
              placeholder="Enter your Average CGPA"
              className="w-full p-3 border rounded-lg"
              value={formData.cgpa}
              onChange={handleInputChange}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <AnimatePresence mode="wait">
                {renderModalContent()}
              </AnimatePresence>

              <div className="flex justify-between p-6 border-t">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={decrementPage}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  disabled={page === 1 || submitting}
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={incrementPage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={submitting}
                >
                  {page === 5 ? (
                    submitting ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      "Submit"
                    )
                  ) : (
                    "Next"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAlertOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center"
            >
              <motion.h2
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mb-4"
              >
                Thank You
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6 text-gray-600"
              >
                You will be logged out of the Portal Now. You can Login once the
                admin verifies your details and you have been allotted a House.
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logoutAndSave}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Okay
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default IntroModal;
