import { House } from "@shared-types/House";

export const hexToRgba = (hex: string, opacity: number) => {
    hex = hex.replace(/^#/, "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  export const calculateTotalPoints = (data: House) => {
    let totalPoints = 0;
    if (data && data.points) {
      totalPoints = data.points.reduce((acc, point) => {
        if (typeof point.points === "number") {
          return acc + point.points;
        }
        return acc;
      }, 0);
    }
    return {
      totalInternal: totalPoints,
      totalExternal: 0,
      totalEvents: 0,
    };
  };