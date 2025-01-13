import { SystemStyleObject } from "@chakra-ui/react";

export const dashboardStyles: Record<string, SystemStyleObject> = {
  container: {
    maxWidth: "1440px",
    mx: "auto",
    px: { base: 4, md: 6 },
    py: 6,
    bg: "gray.50",
    minHeight: "100vh",
  },
  card: {
    bg: "white",
    borderRadius: "2xl",
    boxShadow: "lg",
    p: 8,
    height: "100%",
    transition: "all 0.3s ease-in-out",
    border: "1px solid",
    borderColor: "gray.100",
    _hover: {
      transform: "translateY(-4px)",
      boxShadow: "2xl",
    },
  },
  glassCard: {
    bg: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: "2xl",
    boxShadow: "lg",
    p: 8,
    height: "100%",
    transition: "all 0.3s ease-in-out",
    border: "1px solid",
    borderColor: "gray.100",
    _hover: {
      transform: "translateY(-4px)",
      boxShadow: "2xl",
    },
  },
  tableContainer: {
    overflowX: "auto",
    shadow: "lg",
    rounded: "2xl",
    bg: "white",
    border: "1px solid",
    borderColor: "gray.100",
  },
  statusBadge: {
    px: 3,
    py: 1,
    rounded: "full",
    fontSize: "sm",
    fontWeight: "semibold",
    textTransform: "uppercase",
    letterSpacing: "wider",
  },
};