/**
 * Passport Verification Service
 * Validates passport numbers by country format and auto-fills traveler data
 * from the user's saved profile. Falls back to a pattern-based lookup.
 */

/* ── Country passport formats ── */
const PASSPORT_PATTERNS = [
  { country: 'Kyrgyzstan',    flag: '🇰🇬', code: 'KG', regex: /^ID\d{7}$/i,             example: 'ID1234567'  },
  { country: 'Kyrgyzstan',    flag: '🇰🇬', code: 'KG', regex: /^AN\d{7}$/i,             example: 'AN1234567'  },
  { country: 'Russia',        flag: '🇷🇺', code: 'RU', regex: /^\d{4}\s?\d{6}$/,        example: '12 34 567890' },
  { country: 'Kazakhstan',    flag: '🇰🇿', code: 'KZ', regex: /^N\d{8}$/i,              example: 'N12345678'  },
  { country: 'Uzbekistan',    flag: '🇺🇿', code: 'UZ', regex: /^AA\d{7}$/i,             example: 'AA1234567'  },
  { country: 'USA',           flag: '🇺🇸', code: 'US', regex: /^[A-Z]\d{8}$/i,          example: 'A12345678'  },
  { country: 'Germany',       flag: '🇩🇪', code: 'DE', regex: /^C[A-Z0-9]{8}$/i,        example: 'C01X00T47' },
  { country: 'Turkey',        flag: '🇹🇷', code: 'TR', regex: /^U\d{8}$/i,              example: 'U12345678'  },
  { country: 'China',         flag: '🇨🇳', code: 'CN', regex: /^(G|E)\d{8}$/i,          example: 'G12345678'  },
  { country: 'UAE',           flag: '🇦🇪', code: 'AE', regex: /^[A-Z]{1,2}\d{6,7}$/i,   example: 'A1234567'   },
  { country: 'UK',            flag: '🇬🇧', code: 'GB', regex: /^\d{9}$/,               example: '123456789'  },
  { country: 'France',        flag: '🇫🇷', code: 'FR', regex: /^\d{2}[A-Z]{2}\d{5}$/i, example: '12AA34567'  },
  { country: 'India',         flag: '🇮🇳', code: 'IN', regex: /^[A-Z]{1}\d{7}$/i,       example: 'A1234567'   },
  { country: 'Japan',         flag: '🇯🇵', code: 'JP', regex: /^[A-Z]{2}\d{7}$/i,       example: 'TK1234567'  },
  { country: 'South Korea',   flag: '🇰🇷', code: 'KR', regex: /^M\d{8}$/i,             example: 'M12345678'  },
  { country: 'Belarus',       flag: '🇧🇾', code: 'BY', regex: /^[A-Z]{2}\d{7}$/i,       example: 'MP1234567'  },
  { country: 'Tajikistan',    flag: '🇹🇯', code: 'TJ', regex: /^[A-Z]{1}\d{7}$/i,       example: 'A1234567'   },
  { country: 'Azerbaijan',    flag: '🇦🇿', code: 'AZ', regex: /^[A-Z]{3}\d{6}$/i,       example: 'AZE123456'  },
  { country: 'Georgia',       flag: '🇬🇪', code: 'GE', regex: /^\d{2}[A-Z]{2}\d{4}$/i, example: '01AA1234'   },
  { country: 'International', flag: '🌍', code: 'XX', regex: /^[A-Z]{1,3}\d{6,9}$/i,   example: 'AB123456'   },
];

/**
 * Detect country from passport number format
 */
export function detectPassportCountry(number) {
  if (!number || number.length < 6) return null;
  const clean = number.replace(/\s/g, '').toUpperCase();
  for (const p of PASSPORT_PATTERNS) {
    if (p.regex.test(clean)) return p;
  }
  return null;
}

/**
 * Validate passport number format
 */
export function validatePassport(number) {
  if (!number || number.trim().length < 6) return { valid: false, error: 'Passport number too short' };
  const country = detectPassportCountry(number);
  if (!country) return { valid: false, error: 'Invalid passport format' };
  return { valid: true, country };
}

/**
 * Mock passport lookup — in a real system this calls a government API.
 * Here we check user's saved profile first, then return mock data.
 *
 * @param {string} number     - passport number
 * @param {object} savedProfile - user's saved profile { firstName, lastName, dob, nationality }
 * @returns {Promise<{found, firstName, lastName, dob, nationality, country}>}
 */
export async function lookupPassport(number, savedProfile = null) {
  // Simulate network delay (400-900ms)
  await new Promise(r => setTimeout(r, 400 + Math.random() * 500));

  const validation = validatePassport(number);
  if (!validation.valid) return { found: false, error: validation.error };

  // If user has passport data saved for this number → return it
  if (savedProfile && savedProfile.passportNumber) {
    const clean = number.replace(/\s/g, '').toUpperCase();
    const saved = savedProfile.passportNumber.replace(/\s/g, '').toUpperCase();
    if (clean === saved) {
      return {
        found:       true,
        firstName:   savedProfile.firstName,
        lastName:    savedProfile.lastName,
        dob:         savedProfile.dob,
        nationality: savedProfile.nationality || validation.country.country,
        country:     validation.country,
      };
    }
  }

  // Passport number not in profile → verified format but data must be entered manually
  return {
    found:   false,
    valid:   true,
    country: validation.country,
    message: 'Format verified — please enter your details',
  };
}
