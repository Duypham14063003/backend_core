export const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_DEACTIVATED: 'Account has been deactivated',
  ADMIN_PRIVILEGES_REQUIRED: 'Access denied. Administrator privileges required',
  EMAIL_ALREADY_REGISTERED: 'Email address is already registered',
  TOKEN_INACTIVE_OR_INVALID: 'User account is inactive or no longer exists',
  CREDENTIALS_INVALID: 'Authentication credentials invalid',
  CREDENTIALS_MISSING: 'Authentication credentials missing or invalid',
  AUTH_CONTEXT_NOT_FOUND: 'User authentication context not found',
} as const;

export const USER_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  CURRENT_PASSWORD_INCORRECT: 'Current password does not match',
  NEW_PASSWORD_SAME_AS_OLD: 'New password must be different from current password',
  PASSWORD_CHANGED_SUCCESS: 'Password changed successfully',
} as const;

export const GIFT_MESSAGES = {
  GIFT_NOT_FOUND: 'Gift not found',
  GIFT_NOT_AVAILABLE: 'Gift not found or is currently unavailable',
  GIFT_CODE_EXISTS: 'Gift code is already in use',
  GIFT_DELETED_SUCCESS: 'Gift deleted successfully',
} as const;
