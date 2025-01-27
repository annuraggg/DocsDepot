import { Button, Flex, Heading, Textarea, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import useAxios from "@/config/axios";
import Loader from "@/components/Loader";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRating(parseInt(e.target.value));
  };

  const toaster = useToast();

  const sendFeedback = async () => {
    if (rating === 0) {
      toaster({
        title: "Error",
        description: "Please select a rating",
        status: "error",
      });
      return;
    }

    setIsSubmitting(true);
    const axios = useAxios();
    
    axios
      .post("feedback", {
        rating,
        review: feedback || "No feedback provided",
      })
      .then(() => {
        toaster({
          title: "Feedback Submitted",
          description: "Your feedback has been submitted successfully",
          status: "success",
        });
        setFeedback("");
        setRating(0);
      })
      .catch((error) => {
        console.error(error);
        toaster({
          title: "Error",
          description: error.response?.data?.message || "Something went wrong",
          status: "error",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Flex
      align="center"
      justify="center"
      height="100vh"
      direction="column"
      gap="30px"
    >
      <Heading size="4xl">{import.meta.env.VITE_APP_NAME} Feedback</Heading>
      <div className="flex flex-row items-center gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <React.Fragment key={i + 1}>
            <input
              type="radio"
              id={`star${i + 1}`}
              name="rate"
              value={i + 1}
              onChange={handleRating}
              className="hidden"
            />
            <label
              htmlFor={`star${i + 1}`}
              title={`${i + 1} stars`}
              className={`cursor-pointer text-4xl ${
                rating >= i + 1 ? "text-yellow-400" : "text-gray-300"
              } hover:text-yellow-300`}
            >
              ★
            </label>
          </React.Fragment>
        ))}
      </div>

      <Textarea
        placeholder="Describe Your Issue / Problem / Feedback in this space"
        className="max-w-[40vw] bg-gray-100 focus:ring-2 focus:ring-teal-500 rounded-lg resize-none p-3"
        onChange={(e) => setFeedback(e.target.value)}
        value={feedback}
      ></Textarea>

      <Button 
        colorScheme="teal" 
        variant="solid" 
        onClick={sendFeedback}
        isLoading={isSubmitting}
        loadingText="Submitting"
      >
        Submit Feedback
      </Button>
    </Flex>
  );
};

export default Feedback;