import { extractErrorMessage, mapErrorToLocaleKey } from "./error-mapper";

/**
 * Debug utility to test error translation
 * Note: This function should be called within a React component that has access to useTranslations
 */
export function debugErrorTranslation(t: (key: string) => string) {
  // Test various error scenarios
  const testCases = [
    "something wrong",
    { code: "form_password_pwned" },
    { code: "form_param_format_invalid" },
    { errors: [{ code: "form_password_pwned" }] },
    new Error("Network error"),
    { message: "Invalid format" },
  ];

  console.log("=== Error Translation Debug ===");

  testCases.forEach((error, index) => {
    const localeKey = mapErrorToLocaleKey(error);
    const extractedMessage = extractErrorMessage(error);

    console.log(`Test Case ${index + 1}:`, error);
    console.log(`  Mapped Key: ${localeKey}`);
    console.log(`  Extracted Message: ${extractedMessage}`);

    try {
      const translated = t(localeKey);
      console.log(`  Translation Result: ${translated}`);
      console.log(`  Translation Successful: ${translated !== localeKey}`);
    } catch (translationError) {
      console.log(
        `  Translation Error: ${translationError instanceof Error ? translationError.message : String(translationError)}`,
      );
    }
    console.log("---");
  });
}
