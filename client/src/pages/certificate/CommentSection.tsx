import React, { useState } from "react";
import {
  Box,
  VStack,
  Text,
  Textarea,
  Button,
  Flex,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@chakra-ui/react";
import type { Comment } from "@shared-types/Certificate";
import { ExtendedCertificate as Certificate } from "@/types/ExtendedCertificate";
import useUser from "@/config/user";
import { User } from "@shared-types/User";

interface ExtendedComment extends Omit<Comment, "user"> {
  user: User | string;
}

interface ExtendedCertificate extends Omit<Certificate, "comments"> {
  comments: ExtendedComment[];
}

interface CommentSectionProps {
  certificate: ExtendedCertificate;
  onCommentAdd: (comment: ExtendedComment) => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  certificate,
  onCommentAdd,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUser();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) return;

    setIsSubmitting(true);
    try {
      await onCommentAdd({
        comment: newComment,
        user: user._id,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card variant="outline" w="full">
      <CardHeader>
        <Text fontSize="xl" fontWeight="semibold">
          Comments
        </Text>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {user?._id && user?._id !== certificate?.user?._id ? (
            <Box as="form" onSubmit={handleSubmitComment}>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                maxLength={500}
                mb={2}
                resize="vertical"
                minH="100px"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "outline",
                }}
              />
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.500">
                  {500 - newComment.length} characters remaining
                </Text>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isDisabled={!newComment.trim()}
                  isLoading={isSubmitting}
                  loadingText="Posting..."
                  size="md"
                >
                  Post Comment
                </Button>
              </Flex>
            </Box>
          ) : null}

          <Divider />

          {/* Comments List */}
          {certificate?.comments?.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {certificate?.comments.map((comment) => (
                <Box
                  key={comment?.createdAt?.toString()}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor="gray.200"
                  _hover={{ borderColor: "gray.300" }}
                >
                  <Flex>
                    <Box flex="1">
                      <Flex justify="space-between" align="baseline">
                        <Text fontWeight="medium" color="gray.700">
                          {typeof comment.user === 'object' ? `${comment.user.fname} ${comment.user.lname}` : ''}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {formatDate(comment?.createdAt?.toString())}
                        </Text>
                      </Flex>
                      <Text mt={2} color="gray.700" whiteSpace="pre-wrap">
                        {comment?.comment}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </VStack>
          ) : (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              No comments yet. Be the first to comment!
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default CommentSection;
