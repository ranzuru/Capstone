const numberToMonth = (num) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Check if the number is within the 1-12 range
  if (num >= 1 && num <= 12) {
    // Subtract 1 because the array is zero-indexed
    return months[num - 1];
  }

  throw new Error('Invalid month number: must be between 1 and 12');
};

export default numberToMonth;
