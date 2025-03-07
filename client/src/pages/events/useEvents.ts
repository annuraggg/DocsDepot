import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import useAxios from "@/config/axios";
import { Event } from "@shared-types/Event";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Token } from "@shared-types/Token";

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editPrivilege, setEditPrivilege] = useState(false);
  const toast = useToast();
  const axios = useAxios();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode(token) as Token;
      if (decoded.perms?.includes("MHI") || decoded.role === "A") {
        setEditPrivilege(true);
      }
    }
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    return axios
      .get("/events")
      .then((response) => {
        setEvents(response.data.data);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch events";
        console.error("Error fetching events:", error);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const createEvent = async (eventData: Partial<Event>) => {
    setIsSubmitting(true);

    return axios
      .post("/events", eventData)
      .then(() => {
        toast({
          title: "Success",
          description: "Event created successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchEvents();
        return true;
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          "Something went wrong while creating the event";
        console.error("Error creating event:", error);
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    isLoading,
    isSubmitting,
    error,
    createEvent,
    editPrivilege,
    refreshEvents: fetchEvents,
  };
};
