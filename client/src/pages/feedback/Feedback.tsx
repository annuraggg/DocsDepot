import { Flex, Heading, Textarea } from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleRating = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRating(parseInt(e.target.value));
    console.log(e.target.value);
  };

  const sendFeedback = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/feedback`,
        { rating, review: feedback },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toaster.create({
          title: "Feedback Submitted",
          description: "Your feedback has been submitted successfully",
        });
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error(err);
      toaster.create({
        title: "Error",
        description: "Something went wrong",
      });
    }
  };

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
              id={`star${5 - i}`}
              name="rate"
              value={5 - i}
              onChange={handleRating}
              className="hidden"
            />
            <label
              htmlFor={`star${5 - i}`}
              title={`${5 - i} stars`}
              className={`cursor-pointer text-4xl ${
                rating >= 5 - i ? "text-yellow-400" : "text-gray-300"
              } hover:text-yellow-300`}
            >
              ★
            </label>
          </React.Fragment>
        ))}
      </div>

      <Textarea
        placeholder="Describe Your Issue / Problem / Feedback in this space"
        className="w-[40vw] bg-gray-100 focus:ring-2 focus:ring-teal-500 rounded-lg resize-none p-3"
        onChange={(e) => setFeedback(e.target.value)}
        value={feedback}
      ></Textarea>

      <Button colorScheme="teal" variant="solid" onClick={sendFeedback}>
        Submit Feedback
      </Button>
    </Flex>
  );
};

export default Feedback;
