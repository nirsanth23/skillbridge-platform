const ALLOWED_USER_STATUSES = ['active', 'suspended', 'deactivated']
const ALLOWED_REPORT_STATUSES = ['pending', 'under_review', 'resolved', 'dismissed']

/**
 * Validates user status payload
 * @param {string} status 
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validateUserStatus = (status) => {
  if (!status || typeof status !== 'string') {
    return { isValid: false, error: 'Account status string is required' }
  }
  const normalized = status.trim().toLowerCase()
  if (!ALLOWED_USER_STATUSES.includes(normalized)) {
    return {
      isValid: false,
      error: `Invalid status. Allowed values: ${ALLOWED_USER_STATUSES.join(', ')}`,
    }
  }
  return { isValid: true, sanitized: normalized }
}

/**
 * Validates verification status update payload
 * @param {any} isVerified 
 * @returns {{ isValid: boolean, error: string|null, sanitized: boolean }}
 */
export const validateVerificationUpdate = (isVerified) => {
  if (isVerified === undefined || isVerified === null) {
    return { isValid: false, error: 'isVerified boolean is required' }
  }
  if (typeof isVerified === 'boolean') {
    return { isValid: true, sanitized: isVerified }
  }
  if (isVerified === 'true' || isVerified === '1') {
    return { isValid: true, sanitized: true }
  }
  if (isVerified === 'false' || isVerified === '0') {
    return { isValid: true, sanitized: false }
  }
  return { isValid: false, error: 'isVerified must be a valid boolean' }
}

/**
 * Validates report status update
 * @param {string} status 
 * @param {string} resolutionNotes 
 * @returns {{ isValid: boolean, error: string|null, sanitized: { status: string, resolutionNotes: string } }}
 */
export const validateReportStatus = (status, resolutionNotes = '') => {
  if (!status || typeof status !== 'string') {
    return { isValid: false, error: 'Report status string is required' }
  }
  const normalized = status.trim().toLowerCase()
  if (!ALLOWED_REPORT_STATUSES.includes(normalized)) {
    return {
      isValid: false,
      error: `Invalid status. Allowed values: ${ALLOWED_REPORT_STATUSES.join(', ')}`,
    }
  }
  return {
    isValid: true,
    sanitized: {
      status: normalized,
      resolutionNotes: typeof resolutionNotes === 'string' ? resolutionNotes.trim() : '',
    },
  }
}
