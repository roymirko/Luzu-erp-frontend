export const formatPesos = (value: string) => {
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(num);
};

export const formatPesosInput = (value: string) => {
  const numericValue = value.replace(/[^0-9]/g, '');
  if (!numericValue) return '';
  const num = parseInt(numericValue, 10);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatPorcentaje = (value: string) => {
  const cleaned = value.replace(/[^0-9]/g, '');
  return cleaned;
};

export const getNumericValue = (formattedValue: string) => {
  return formattedValue.replace(/[^0-9]/g, '');
};
