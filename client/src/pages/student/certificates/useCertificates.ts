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
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<FilterState>(initialFilterState);
  
    const axios = useAxios();

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/certificates/user");
            if (res.status === 200) {
                setCertificates(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching certificates:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFilters(initialFilterState);
        setSearchTerm('');
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some(filter => 
            Array.isArray(filter) ? filter.length > 0 : !!filter
        );
    };
    useEffect(() => {
        fetchCertificates();
    }, []);
    useEffect(() => {
        let filtered = [...certificates];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(cert =>
                cert.certificateName.toLowerCase().includes(searchLower) ||
                cert.issuingOrg.toLowerCase().includes(searchLower)
            );
        }
        if (filters.types.length > 0) {
            filtered = filtered.filter(cert => 
                filters.types.includes(cert.certificateType)
            );
        }
        if (filters.levels.length > 0) {
            filtered = filtered.filter(cert => 
                filters.levels.includes(cert.certificateLevel)
            );
        }
        if (filters.status.length > 0) {
            filtered = filtered.filter(cert => 
                filters.status.includes(cert.status)
            );
        }
        if (filters.issueYears.length > 0) {
            filtered = filtered.filter(cert => 
                filters.issueYears.includes(cert.issueYear.toString())
            );
        }
        if (filters.expiryYears.length > 0) {
            filtered = filtered.filter(cert => 
                cert.expires && 
                filters.expiryYears.includes((cert.expiryYear || '').toString())
            );
        }
        setFilteredCertificates(filtered);
    }, [certificates, searchTerm, filters]);

    return {
        certificates: filteredCertificates,
        allCertificates: certificates,
        loading,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        resetFilters,
        hasActiveFilters,
        refreshCertificates: fetchCertificates,
    };
};