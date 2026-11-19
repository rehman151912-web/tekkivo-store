export interface PhoneValidationResult {
  valid: boolean;
  normalizedLocal?: string;
  normalizedInternational?: string;
  error?: string;
}

export interface CheckoutFormInput {
  fullName: string;
  phone: string;
  city: string;
  customCity?: string;
  address: string;
  notes?: string;
}

export type CheckoutFieldName =
  | 'cart'
  | 'fullName'
  | 'phone'
  | 'city'
  | 'customCity'
  | 'address';

export interface CheckoutValidationResult {
  valid: boolean;
  errors: Partial<Record<CheckoutFieldName, string>>;
  normalizedPhone?: string;
  resolvedCity?: string;
}

/**
 * Validates Pakistani mobile numbers in local or international formats:
 * - 03001234567 / 0300-1234567 / 0300 1234567
 * - +923001234567 / +92 300 1234567
 * - 923001234567
 */
export function validatePakistaniPhone(raw: string): PhoneValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Please enter your Pakistani mobile number (e.g. 0300-1234567).',
    };
  }

  // Reject letters or unexpected symbols early
  if (!/^[+\d\s\-()]+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Mobile number can only contain digits, spaces, dashes, or +92.',
    };
  }

  const digitsOnly = trimmed.replace(/[^\d]/g, '');

  let subscriber10 = '';
  if (digitsOnly.length === 11 && digitsOnly.startsWith('03')) {
    subscriber10 = digitsOnly.slice(1); // 3XXXXXXXXX
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('923')) {
    subscriber10 = digitsOnly.slice(2); // 3XXXXXXXXX
  } else if (digitsOnly.length === 14 && digitsOnly.startsWith('00923')) {
    subscriber10 = digitsOnly.slice(4); // 3XXXXXXXXX
  } else {
    return {
      valid: false,
      error:
        'Enter a valid 11-digit Pakistani mobile number starting with 03XX or +923XX.',
    };
  }

  if (!/^3\d{9}$/.test(subscriber10)) {
    return {
      valid: false,
      error: 'Enter a valid Pakistani mobile number (e.g. 0300-1234567).',
    };
  }

  const normalizedLocal = `0${subscriber10.slice(0, 3)}-${subscriber10.slice(3)}`;
  const normalizedInternational = `92${subscriber10}`;

  return {
    valid: true,
    normalizedLocal,
    normalizedInternational,
  };
}

export function validateCheckoutForm(
  input: CheckoutFormInput,
  cartItemCount: number
): CheckoutValidationResult {
  const errors: Partial<Record<CheckoutFieldName, string>> = {};

  if (cartItemCount <= 0) {
    errors.cart =
      'Your shopping cart is empty. Add at least one product before placing an order.';
  }

  const name = input.fullName.trim();
  if (name.length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  } else if (!/[a-zA-Z\u0600-\u06FF]/.test(name)) {
    errors.fullName = 'Please enter a valid name.';
  }

  const phoneCheck = validatePakistaniPhone(input.phone);
  if (!phoneCheck.valid) {
    errors.phone = phoneCheck.error;
  }

  const city = input.city.trim();
  let resolvedCity = city;
  if (!city) {
    errors.city = 'Please select your delivery city.';
  } else if (city === 'Other City') {
    const custom = (input.customCity || '').trim();
    if (custom.length < 2) {
      errors.customCity = 'Please enter your city or tehsil name.';
    } else {
      resolvedCity = custom;
    }
  }

  const address = input.address.trim();
  if (address.length < 10) {
    errors.address =
      'Please enter your complete delivery address (house/flat, street, sector or landmark).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalizedPhone: phoneCheck.normalizedLocal,
    resolvedCity,
  };
}
