import { useState, useEffect } from 'react';
import { User } from '@shared-types/User';
import { House } from '@shared-types/House';
import { useToast } from '@chakra-ui/react';

export const useStudentManagement = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [students, setStudents] = useState<User[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedHouse, setSelectedHouse] = useState<string>('all');
  const [deleteArr, setDeleteArr] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const toast = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/faculty/students`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      const processedStudents = processStudentYears(data.students);
      setStudents(processedStudents);
      setHouses(data.houses);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Error fetching students',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
    }
  };

  const processStudentYears = (students: User[]) => {
    const currentYear = new Date().getFullYear();
    return students.map(student => ({
      ...student,
      academicDetails: {
        ...student.academicDetails,
        academicYear: student.academicDetails.admissionYear !== undefined
          ? currentYear - student.academicDetails.admissionYear + 1 + 
            (student.academicDetails.isDSE ? 1 : 0)
          : undefined
      }
    }));
  };

  useEffect(() => {
    const filtered = students.filter(
      student =>
        (selectedYear === 'all' || 
         (student.academicDetails.admissionYear !== undefined && 
          student.academicDetails.admissionYear === Number(selectedYear))) &&
        (selectedHouse === 'all' || student.house === selectedHouse) &&
        Object.values(student).some(value =>
          value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students, selectedYear, selectedHouse]);

  const handleCheckboxChange = (studentMid: string) => {
    setDeleteArr(prev =>
      prev.includes(studentMid)
        ? prev.filter(mid => mid !== studentMid)
        : [...prev, studentMid]
    );
  };

  const toggleSelectAll = () => {
    setSelectAll(prev => !prev);
    setDeleteArr(prev =>
      prev.length === filteredStudents.length
        ? []
        : filteredStudents.map(student => student.mid)
    );
  };

  return {
    loading,
    students,
    houses,
    filteredStudents,
    searchQuery,
    setSearchQuery,
    selectedYear,
    setSelectedYear,
    selectedHouse,
    setSelectedHouse,
    deleteArr,
    setDeleteArr,
    selectAll,
    handleCheckboxChange,
    toggleSelectAll,
    fetchStudents
  };
};