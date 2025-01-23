import React, { useState } from 'react';
import { Box, Container, useDisclosure, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useStudentManagement } from './useStudentManagement';
import { StudentFilters } from './StudentFilters';
import { StudentTable } from './StudentTable';
import { EditStudentModal } from './EditStudentModal';
import { DeleteStudentModal } from './DeleteStudentModal';
import { BulkDeleteModal } from './BulkDeleteModal';
import Loader from '../../../components/Loader';
import { User } from '@shared-types/User';
import { House } from '@shared-types/House';

const StudentsPage: React.FC = () => {
  const {
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
  } = useStudentManagement();

  const [currentStudent, setCurrentStudent] = useState<User | null>(null);
  const toast = useToast();

  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const bulkDeleteModal = useDisclosure();

  const handleEdit = (mid: string) => {
    const student = students.find(s => s.mid === mid);
    if (student) {
      setCurrentStudent(student);
      editModal.onOpen();
    }
  };

  const handleDelete = (mid: string) => {
    const student = students.find(s => s.mid === mid);
    if (student) {
      setCurrentStudent(student);
      deleteModal.onOpen();
    }
  };

  const performStudentUpdate = async (updatedStudent: Partial<User>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/faculty/students/update`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      });
      const data = await response.json();

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } else {
        toast({
          title: 'Success',
          description: 'Student Updated Successfully',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        fetchStudents();
        editModal.onClose();
      }
    } catch (error) {
      console.error('Update error', error);
      toast({
        title: 'Error',
        description: 'Failed to update student',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const performDelete = async () => {
    if (!currentStudent) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/faculty/students/delete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mid: currentStudent.mid })
      });
      const data = await response.json();

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } else {
        toast({
          title: 'Success',
          description: 'Student Deleted Successfully',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        fetchStudents();
        deleteModal.onClose();
      }
    } catch (error) {
      console.error('Delete error', error);
    }
  };

  const performBulkDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/faculty/students/bulkdelete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mids: deleteArr })
      });
      const data = await response.json();

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } else {
        toast({
          title: 'Success',
          description: 'Students Deleted Successfully',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        fetchStudents();
        setDeleteArr([]);
        bulkDeleteModal.onClose();
      }
    } catch (error) {
      console.error('Bulk delete error', error);
    }
  };

  if (loading) return <Loader />;

  return (
    <Container maxW="container.xl" py={8}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 min-h-screen"
      >
        <Box className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Student Management</h1>
          <StudentFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedHouse={selectedHouse}
            setSelectedHouse={setSelectedHouse}
            houses={houses}
            deleteArr={deleteArr}
            onBulkDelete={bulkDeleteModal.onOpen}
          />
          <Box className="mt-6">
            <StudentTable
              students={filteredStudents}
              selectAll={selectAll}
              deleteArr={deleteArr}
              onToggleSelectAll={toggleSelectAll}
              onCheckboxChange={handleCheckboxChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Box>
          <EditStudentModal
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
            student={currentStudent}
            houses={houses}
            onUpdate={performStudentUpdate}
          />
          <DeleteStudentModal
            isOpen={deleteModal.isOpen}
            onClose={deleteModal.onClose}
            onConfirmDelete={performDelete}
            studentName={currentStudent ? `${currentStudent.fname} ${currentStudent.lname}` : ''}
          />
          <BulkDeleteModal
            isOpen={bulkDeleteModal.isOpen}
            onClose={bulkDeleteModal.onClose}
            onConfirmDelete={performBulkDelete}
            studentCount={deleteArr.length}
          />
        </Box>
      </motion.div>
    </Container>
  );
};

export default StudentsPage;