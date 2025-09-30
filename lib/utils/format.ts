/**
 * Safe formatting utilities to prevent undefined/null errors with toFixed
 */

/**
 * Safely formats a number as currency, handling undefined/null values
 */
export function formatCurrency(
  value: number | string | null | undefined, 
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '$0.00'
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) {
    return '$0.00'
  }
  
  return `$${numValue.toFixed(decimals)}`
}

/**
 * Safely formats a number with specified decimal places
 */
export function formatNumber(
  value: number | string | null | undefined, 
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0.00'
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) {
    return '0.00'
  }
  
  return numValue.toFixed(decimals)
}

/**
 * Safely calculates subtotal (quantity * price) with null checks
 */
export function calculateSubtotal(
  quantity: number | null | undefined, 
  price: number | null | undefined
): number {
  const safeQuantity = quantity || 0
  const safePrice = price || 0
  return safeQuantity * safePrice
}

/**
 * Safely gets numeric value with fallback to 0
 */
export function safeNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(numValue) ? 0 : numValue
}