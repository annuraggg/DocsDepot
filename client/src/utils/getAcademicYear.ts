const getAcademicYear = (
  year: number,
  isDSE: boolean = false,
  backlogYears: number = 0
) => {
  const currentYear = Number(new Date().getFullYear().toString().slice(2));
  let academicYear = currentYear - year - backlogYears; // Adjust for backlog years

  // If the student is in DSE, treat them as one year ahead
  if (isDSE) {
    academicYear += 1;
  }

  // Determine academic year based on the adjusted academic year value
  if (academicYear > 5) {
    return "Alumni"; // If the academic year is greater than 5, they're an alumni
  }

  switch (academicYear) {
    case 1:
      return "First Year";
    case 2:
      return "Second Year";
    case 3:
      return "Third Year";
    case 4:
      return "Fourth Year";
    case 5:
      return "Fifth Year"; // In case you want to explicitly show a 5th-year status
    default:
      return "N/A"; // For cases where the academic year is less than 1 (e.g., a student with a very high backlog)
  }
};

export default getAcademicYear;
