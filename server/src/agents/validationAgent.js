/**
 * Validation Agent (Section 4.3)
 * Performs structural assertions on extracted JSON & validates financial arithmetic:
 * | (subtotal + tax) - totalAmount | < 0.01
 */
export const runValidationAgent = async ({ node, inputData = {} }) => {
  const tolerance = parseFloat(node?.data?.tolerance || 0.01);
  const errors = [];

  const subtotal = parseFloat(inputData.subtotal);
  const tax = parseFloat(inputData.tax !== undefined ? inputData.tax : 0);
  const totalAmount = parseFloat(inputData.totalAmount);

  // 1. Structural Schema Assertions
  if (!inputData.vendorName) errors.push('Missing required field: vendorName');
  if (!inputData.invoiceDate) errors.push('Missing required field: invoiceDate');
  if (isNaN(subtotal)) errors.push('Invalid or missing numeric subtotal');
  if (isNaN(totalAmount)) errors.push('Invalid or missing numeric totalAmount');

  if (errors.length > 0) {
    return {
      isValid: false,
      code: 'MISSING_FIELDS',
      errors,
      delta: null,
      message: `Validation failed with ${errors.length} schema errors: ${errors.join(', ')}`,
    };
  }

  // 2. Financial Arithmetic Assertion: |(subtotal + tax) - totalAmount| < tolerance
  const expectedTotal = subtotal + tax;
  const delta = Math.abs(expectedTotal - totalAmount);
  const isMathValid = delta <= tolerance;

  const mathProof = {
    formula: 'subtotal + tax == totalAmount',
    subtotal,
    tax,
    expectedTotal: parseFloat(expectedTotal.toFixed(2)),
    actualTotal: totalAmount,
    delta: parseFloat(delta.toFixed(4)),
    tolerance,
    isMathValid,
  };

  if (!isMathValid) {
    return {
      isValid: false,
      code: 'MATH_MISMATCH',
      mathProof,
      delta,
      message: `Financial arithmetic assertion failed: Subtotal (₹${subtotal.toLocaleString('en-IN')}) + GST/Tax (₹${tax.toLocaleString('en-IN')}) = ₹${expectedTotal.toFixed(2)}, but invoice states ₹${totalAmount.toLocaleString('en-IN')} (delta = ₹${delta.toFixed(2)} > tolerance ₹${tolerance})`,
    };
  }

  return {
    isValid: true,
    code: 'VALIDATION_PASSED',
    mathProof,
    delta,
    message: `Math validation passed: |(₹${subtotal.toFixed(2)} + ₹${tax.toFixed(2)}) - ₹${totalAmount.toFixed(2)}| = ₹${delta.toFixed(2)} <= ₹${tolerance}`,
  };
};

export default { runValidationAgent };
