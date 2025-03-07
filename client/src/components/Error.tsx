import { Button, Heading, Text, VStack } from "@chakra-ui/react";
import { FallbackProps } from "react-error-boundary";

export default function ErrorPage({ error, resetErrorBoundary }: FallbackProps) {
  const handleReset = () => {
    resetErrorBoundary();
    window.location.href = "/";
  };

  return (
    <VStack spacing={4} justify="center" minH="100vh" p={8}>
      <Heading size="xl" textAlign="center">
        Oops! Something went wrong.
      </Heading>
      <Text fontSize="lg" color="red.500" textAlign="center">
        {error.message}
      </Text>
      <Button
        colorScheme="blue"
        onClick={handleReset}
        size="lg"
        mt={4}
      >
        Return to Safety
      </Button>
    </VStack>
  );
}