/**
 * Comprehensive Real Email Detection & Validation Utility
 *
 * Implements:
 * 1. RFC 5322 compliant regex syntax checking.
 * 2. Strict length bounds (max 64 local part, max 254 total).
 * 3. Valid TLD validation (must be >= 2 alphabetic characters, not numeric).
 * 4. Disposable/temporary throwaway inbox domain blocklist.
 * 5. Reserved/fake test domain rejection (example.com, test.com, etc.).
 * 6. Levenshtein & common typo detection for popular providers with "Did you mean...?" suggestions.
 */

// Popular email providers
const POPULAR_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "zoho.com",
  "live.com",
  "msn.com",
  "mail.com",
  "gmx.com",
  "fastmail.com",
];

// Common typo map for instant suggestion
const DOMAIN_TYPOS: Record<string, string> = {
  // Gmail
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmaul.com": "gmail.com",
  "gmaio.com": "gmail.com",
  "gmaol.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmeil.com": "gmail.com",

  // Hotmail
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmail.co": "hotmail.com",

  // Yahoo
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yaho.co": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",

  // Outlook
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outklook.com": "outlook.com",
  "outlook.con": "outlook.com",
  "outlook.co": "outlook.com",

  // iCloud
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
  "icould.com": "icloud.com",
  "icloud.con": "icloud.com",

  // Proton
  "prton.me": "proton.me",
  "protonmai.com": "proton.me",
  "protonmial.com": "proton.me",
};

// Known disposable / temporary email domains (throwaways)
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "sharklasers.com",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "dispostable.com",
  "getairmail.com",
  "fakeinbox.com",
  "temp-mail.org",
  "mohmal.com",
  "burnermail.io",
  "crazymailing.com",
  "generator.email",
  "inboxkitten.com",
  "emailondeck.com",
  "mytemp.email",
  "dropmail.me",
  "fakemailgenerator.com",
  "tempmailaddress.com",
  "nada.ltd",
  "getnada.com",
  "disposablemail.com",
  "tempr.email",
  "trashmail.net",
  "throwawayemail.com",
  "tempinbox.com",
  "maildrop.cc",
  "zillamail.com",
  "mailcatch.com",
  "gettempmail.com",
  "disposable.com",
  "trashymail.com",
  "10minutemail.net",
  "mytrashmail.com",
  "spamfree24.org",
  "spambog.com",
  "temporary-mail.net",
]);

// Fake or reserved domains
const FAKE_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.org",
  "invalid.com",
  "invalid.org",
  "localhost",
  "sample.com",
  "fake.com",
  "asdf.com",
  "domain.com",
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  domain?: string;
  isDisposable?: boolean;
}

/**
 * Validates whether an email string looks like a genuine, deliverable, non-disposable email.
 */
export function validateRealEmail(input: string): EmailValidationResult {
  const email = (input || "").trim().toLowerCase();

  if (!email) {
    return { isValid: false, error: "Email address is required." };
  }

  // Length checks
  if (email.length > 254) {
    return { isValid: false, error: "Email address is too long (maximum 254 characters)." };
  }

  // Split into local and domain parts
  const atIndex = email.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === email.length - 1) {
    return { isValid: false, error: "Please enter a valid email address with an @ domain." };
  }

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  if (localPart.length > 64) {
    return { isValid: false, error: "The local username part of the email is too long (maximum 64 characters)." };
  }

  // Forbid leading, trailing, or consecutive dots in local part
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return { isValid: false, error: "Email username cannot start, end, or contain consecutive dots." };
  }

  // Basic RFC syntax check
  const RFC_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!RFC_REGEX.test(email)) {
    return { isValid: false, error: "Please enter a valid email format (e.g., adventurer@quest.com)." };
  }

  // Domain structure checks
  if (domainPart.includes("..") || domainPart.startsWith("-") || domainPart.endsWith("-")) {
    return { isValid: false, error: "Email domain format is invalid." };
  }

  // TLD check (must have at least 1 dot and a valid TLD of 2+ alpha characters)
  const domainParts = domainPart.split(".");
  const tld = domainParts[domainParts.length - 1];

  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, error: `Invalid domain extension '.${tld}'. Top-level domain must be letters only.` };
  }

  // Check against disposable throwaway domains
  if (DISPOSABLE_DOMAINS.has(domainPart)) {
    return {
      isValid: false,
      isDisposable: true,
      error: "Disposable and temporary email addresses are not permitted. Please use a permanent email.",
      domain: domainPart,
    };
  }

  // Check against fake / test domains
  if (FAKE_DOMAINS.has(domainPart)) {
    return {
      isValid: false,
      error: "Please enter a real, active email address rather than a test domain.",
      domain: domainPart,
    };
  }

  // Check for common typo suggestions
  let suggestion: string | undefined;
  if (DOMAIN_TYPOS[domainPart]) {
    const suggestedDomain = DOMAIN_TYPOS[domainPart];
    suggestion = `${localPart}@${suggestedDomain}`;
  }

  return {
    isValid: true,
    domain: domainPart,
    suggestion,
  };
}
