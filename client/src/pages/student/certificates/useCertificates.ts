import { useState, useEffect } from 'react';
import { Certificate } from '@shared-types/Certificate';
import useAxios from '../../../config/axios';

interface FilterState {
    types: string[];
    levels: string[];
    status: string[];
    issueYears: string[];
    expiryYears: string[];
}

export const useCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    levels: [],
    status: [],
    issueYears: [],
    expiryYears: [],
  });

  const axios = useAxios();

  const fetchCertificates = async () => {
    try {
      const res = await axios.get("/certificates/user");
      if (res.status === 200) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    let filtered = [...certificates];

    // search filter
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuingOrg.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter(cert => filters.types.includes(cert.certificateType));
    }

    // level filter
    if (filters.levels.length > 0) {
      filtered = filtered.filter(cert => filters.levels.includes(cert.certificateLevel));
    }

    // status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(cert => filters.status.includes(cert.status));
    }

    // issue year filter
    if (filters.issueYears.length > 0) {
      filtered = filtered.filter(cert => filters.issueYears.includes(cert.issueYear.toString()));
    }

    // expiry year filter
    if (filters.expiryYears.length > 0) {
      filtered = filtered.filter(cert => cert.expires && filters.expiryYears.includes((cert.expiryYear || '').toString()));
    }

    setFilteredCertificates(filtered);
  }, [certificates, searchTerm, filters]);

  return {
    certificates: filteredCertificates,
    loading,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    refreshCertificates: fetchCertificates,
  };
};