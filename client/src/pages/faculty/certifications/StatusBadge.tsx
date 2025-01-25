import React from 'react';
import { Badge, HStack, Icon, Text } from '@chakra-ui/react';
import { Clock, Check, X } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: { color: "yellow", icon: Clock },
    approved: { color: "green", icon: Check },
    rejected: { color: "red", icon: X }
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <Badge
      colorScheme={config.color}
      variant="subtle"
      rounded="full"
      px={3}
      py={1}
    >
      <HStack spacing={1}>
        <Icon as={config.icon} boxSize="4" />
        <Text>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
      </HStack>
    </Badge>
  );
};