/**
 * Verifica si una fecha es día hábil (lunes-viernes)
 */
export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  // 0 = domingo, 1 = lunes, ..., 5 = viernes, 6 = sábado
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

/**
 * Cuenta días hábiles (lunes-viernes) desde el 1 del mes actual hasta HOY
 */
export function getBusinessDaysCountInMonth(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  let count = 0;
  const firstDayOfMonth = new Date(year, month, 1);
  
  // Iterar desde el 1 del mes hasta hoy (inclusive)
  for (let day = 1; day <= date.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    if (isBusinessDay(currentDate)) {
      count++;
    }
  }
  
  return count;
}

/**
 * Determina si el mes anterior está disponible para carga
 * Disponible si estamos en los primeros 5 días hábiles del mes actual
 * En modo edición, siempre retorna true
 */
export function isMonthBeforeAvailable(isEditMode: boolean = false): boolean {
  if (isEditMode) {
    return true; // En modo edición, siempre permitir
  }
  
  const businessDaysInMonth = getBusinessDaysCountInMonth();
  return businessDaysInMonth <= 5;
}
