export const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  export const getYearRange = (startOffset: number, endOffset: number) => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = startOffset; i <= endOffset; i++) {
      years.push(currentYear + i);
    }
    return years;
  };