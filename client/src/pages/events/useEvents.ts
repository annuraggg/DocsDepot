import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import useAxios from '@/config/axios';
import { Event } from '@shared-types/Event';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { Token } from '@shared-types/Token';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    try {
      const response = await axios.get("/events");
      if (response.status === 200) {
        setEvents(response.data.data);
      } else {
        throw new Error("Failed to fetch events");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to fetch events",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (eventData: Partial<Event>) => {
    try {
      const response = await axios.post("/events", eventData);
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Event created successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        await fetchEvents();
        return true;
      }
      throw new Error("Failed to create event");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create event",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    isLoading,
    error,
    createEvent,
    editPrivilege,
    refreshEvents: fetchEvents,
  };
};