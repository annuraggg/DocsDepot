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

interface FetchError {
  message: string;
  isError: boolean;
}

export const useCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FetchError>({ message: "", isError: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  const axios = useAxios();
  const toast = useToast();

  const fetchCertificates = async () => {
    setLoading(true);
    setError({ message: "", isError: false });

    try {
      const res = await axios.get("/certificates/user");
      if (res.status === 200) {
        setCertificates(res.data.data);
        setFilteredCertificates(res.data.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to fetch certificates";
      console.error("Error fetching certificates:", err);
      
      setError({ 
        message: errorMessage,
        isError: true 
      });
      
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      setCertificates([]);
      setFilteredCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters(initialFilterState);
    setSearchTerm("");
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some((filter) =>
      Array.isArray(filter) ? filter.length > 0 : !!filter
    );
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    if (error.isError) return;

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
            filters.expiryYears.includes((cert.expirationDate?.year || "").toString())
        );
      }

      setFilteredCertificates(filtered);
    } catch (err) {
      console.error("Error applying filters:", err);
      toast({
        title: "Error",
        description: "Failed to apply filters",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [certificates, searchTerm, filters, error.isError]);

  return {
    certificates: filteredCertificates,
    allCertificates: certificates,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    refreshCertificates: fetchCertificates,
  };
};