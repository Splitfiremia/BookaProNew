// Form validation utility for BookerPro app

// Simple validation helper functions
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^(?:[a-zA-Z0-9_'^&+\-])+(?:\.(?:[a-zA-Z0-9_'^&+\-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validateName = (name: string): boolean => {
  if (!name || !name.trim()) return false;
  return /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF' \-]+$/.test(name.trim());
};

export type ValidationRule = {
  validate: (value: string, compareValue?: string) => boolean;
  message: string;
};

export type ValidationRules = {
  [key: string]: ValidationRule[];
};

export type ValidationErrors = {
  [key: string]: string | null;
};

// Common validation rules
export const required: ValidationRule = {
  validate: (value: string) => value.trim().length > 0,
  message: "This field is required",
};

// RFC5322-ish practical email regex, avoids exotic extremes while catching common mistakes
export const email: ValidationRule = {
  validate: (value: string) => {
    if (!value) return true; // Allow empty for optional fields
    const emailRegex = /^(?:[a-zA-Z0-9_'^&+\-])+(?:\.(?:[a-zA-Z0-9_'^&+\-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
  },
  message: "Please enter a valid email address",
};

export const specialRequests: ValidationRule = {
  validate: (value: string) => {
    if (value.length > 500) return false;
    // Basic content appropriateness check
    const inappropriateWords = ['spam', 'scam', 'fake'];
    const lowerValue = value.toLowerCase();
    return !inappropriateWords.some(word => lowerValue.includes(word));
  },
  message: "Special requests must be appropriate and under 500 characters",
};

export const minLength = (length: number): ValidationRule => ({
  validate: (value: string) => value.length >= length,
  message: `Must be at least ${length} characters`,
});

export const maxLength = (length: number): ValidationRule => ({
  validate: (value: string) => value.length <= length,
  message: `Must be at most ${length} characters`,
});

export const passwordMatch = (compareValue: string): ValidationRule => ({
  validate: (value: string, compareValue?: string) => value === compareValue,
  message: "Passwords do not match",
});

export const phoneNumber: ValidationRule = {
  validate: (value: string) => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(value.replace(/\s/g, ""));
  },
  message: "Please enter a valid phone number",
};

export const nameRule: ValidationRule = {
  validate: (value: string) => /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF' \-]+$/.test(value.trim()),
  message: "Only letters, spaces, and hyphens are allowed",
};

export const commonPasswords = new Set<string>([
  "password",
  "12345678",
  "qwerty123",
  "11111111",
  "iloveyou",
  "admin123",
]);

export function passwordStrength(value: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (commonPasswords.has(value.toLowerCase())) score = 1;
  const labels: Record<0 | 1 | 2 | 3 | 4, string> = {
    0: "Too short",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };
  const typedScore = score as 0 | 1 | 2 | 3 | 4;
  return { score: typedScore, label: labels[typedScore] };
}

// Validate a single field
export const validateField = (
  name: string,
  value: string,
  rules: ValidationRule[],
  compareValues?: Record<string, string>
): string | null => {
  for (const rule of rules) {
    if (name === "confirmPassword" && compareValues) {
      const compareValue = compareValues.password || "";
      if (!passwordMatch(compareValue).validate(value)) {
        return passwordMatch(compareValue).message;
      }
    } else if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
};

// Validate all form fields
export const validateForm = (
  values: Record<string, string>,
  rules: ValidationRules
): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  Object.keys(rules).forEach((fieldName) => {
    const fieldRules = rules[fieldName];
    const value = values[fieldName] || "";
    
    errors[fieldName] = validateField(fieldName, value, fieldRules, values);
  });
  
  return errors;
};

// Check if form has any errors
export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.values(errors).some((error) => error !== null);
};

// Format phone number as user types
export const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

// Image URI validation utilities
export const validateImageUri = (uri: string | null | undefined): boolean => {
  return !!(uri && uri.trim() !== '');
};

export const getValidImageUri = (uri: string | null | undefined): string | null => {
  return validateImageUri(uri) ? uri! : null;
};