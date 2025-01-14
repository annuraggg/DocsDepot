import { useToast as useChakraToast } from '@chakra-ui/react';

export const useToast = () => {
  const toast = useChakraToast();

  const showToast = (
    title: string,
    description: string,
    status: 'success' | 'error' | 'warning' | 'info'
  ) => {
    toast({
      title,
      description,
      status,
      duration: 5000,
      isClosable: true,
      position: "top-right"
    });
  };

  return showToast;
};