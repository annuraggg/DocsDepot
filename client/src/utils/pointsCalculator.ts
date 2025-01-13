import { House, PointTotals } from "@/types/dashboard";

export const calculatePoints = (
  houses: House[],
  selectedMonth: string,
  userId?: string
): PointTotals => {
  const currentYear = new Date().getFullYear().toString();
  const initialTotals: PointTotals = {
    totalInternal: 0,
    totalExternal: 0,
    totalEvents: 0
  };

  if (selectedMonth === "all") {
    return houses.reduce((totals, house) => {
      if (house.points[currentYear]) {
        Object.values(house.points[currentYear]).forEach((monthData) => {
          totals.totalInternal += monthData.internal || 0;
          totals.totalExternal += monthData.external || 0;
          totals.totalEvents += monthData.events || 0;
        });
      }
      return totals;
    }, { ...initialTotals });
  }

  // For specific month
  return houses.reduce((totals, house) => {
    const monthData = house.points[currentYear]?.[selectedMonth] || {
      internal: 0,
      external: 0,
      events: 0,
    };

    return {
      totalInternal: totals.totalInternal + (monthData.internal || 0),
      totalExternal: totals.totalExternal + (monthData.external || 0),
      totalEvents: totals.totalEvents + (monthData.events || 0),
    };
  }, { ...initialTotals });
};