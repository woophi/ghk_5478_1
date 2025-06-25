export const getYearString = (years: number) => {
  const forms = ['год', 'года', 'лет'];
  const lastDigit = years % 10;
  const lastTwoDigits = years % 100;

  const form =
    lastTwoDigits >= 11 && lastTwoDigits <= 14 ? 2 : lastDigit === 1 ? 0 : lastDigit >= 2 && lastDigit <= 4 ? 1 : 2;

  return `${years} ${forms[form]}`;
};
