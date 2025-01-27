import { useState, useEffect } from "react";
import { Certificate } from "@shared-types/Certificate";
import useAxios from "../../../config/axios";
import { useToast } from "@chakra-ui/react";

interface FilterState {
  types: string[];
  levels: string[];
  status: string[];
  issueYears: string[];
  expiryYears: string[];
}

const initialFilterState: FilterState = {
  types: [],
  levels: [],
  status: [],
  issueYears: [],
  expiryYears: [],
};

export const useCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const axios = useAxios();
  const toast = useToast();

  const fetchCertificates = async (showToast = true) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await axios.get("/certificates/user");
      if (res.status === 200) {
        setCertificates(res.data.data);
        if (showToast) {
          toast({
            title: "Success",
            description: "Certificates loaded successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to fetch certificates";
      setError(errorMessage);
      console.error("Error fetching certificates:", err);
      
      if (showToast) {
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshCertificates = async () => {
    setIsRefreshing(true);
    await fetchCertificates(false);
  };

  const resetFilters = () => {
    setFilters(initialFilterState);
    setSearchTerm("");
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some((filter) =>
      Array.isArray(filter) ? filter.length > 0 : !!filter
    );
  };

  useEffect(() => {
    fetchCertificates(false);
  }, []);

  useEffect(() => {
    try {
      let filtered = [...certificates];

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (cert) =>
            cert.name.toLowerCase().includes(searchLower) ||
            cert.issuingOrganization.toLowerCase().includes(searchLower)
        );
      }

      if (filters.types.length > 0) {
        filtered = filtered.filter((cert) => filters.types.includes(cert.type));
      }

      if (filters.levels.length > 0) {
        filtered = filtered.filter((cert) => filters.levels.includes(cert.level));
      }

      if (filters.status.length > 0) {
        filtered = filtered.filter((cert) => filters.status.includes(cert.status));
      }

      if (filters.issueYears.length > 0) {
        filtered = filtered.filter((cert) =>
          filters.issueYears.includes(cert.issueDate.year.toString())
        );
      }

      if (filters.expiryYears.length > 0) {
        filtered = filtered.filter(
          (cert) =>
            cert.expires &&
            cert.expirationDate?.year &&
            filters.expiryYears.includes(cert.expirationDate.year.toString())
        );
      }

      setFilteredCertificates(filtered);
    } catch (err) {
      console.error("Error applying filters:", err);
      toast({
        title: "Filter Error",
        description: "There was an error applying the filters",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [certificates, searchTerm, filters]);

  return {
    certificates: filteredCertificates,
    allCertificates: certificates,
    loading,
    isRefreshing,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    refreshCertificates,
  };
};