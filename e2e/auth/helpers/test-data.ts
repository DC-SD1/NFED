import { faker } from "@faker-js/faker";

/**
 * Test data generators for authentication E2E tests
 */

export function generateTestUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = `test_${Date.now()}_${faker.string.alphanumeric(5)}@example.com`;

  return {
    firstName,
    lastName,
    email,
    phone: faker.phone.number("+1##########"),
    password: "Test@Password123!", // Meets all requirements
  };
}

export function generateInvalidPasswords() {
  return [
    { password: "short", reason: "Too short (less than 8 characters)" },
    { password: "nouppercase123!", reason: "Missing uppercase letter" },
    { password: "NOLOWERCASE123!", reason: "Missing lowercase letter" },
    { password: "NoNumbers!", reason: "Missing number" },
    { password: "NoSpecial123", reason: "Missing special character" },
    { password: "        ", reason: "Only spaces" },
    { password: "", reason: "Empty password" },
  ];
}

export const TEST_OTP = "123456"; // Mock OTP for testing

export const TEST_USERS = {
  existingFarmOwner: {
    email: "test.farmer-owner@example.com",
    password: "FarmOwner@123!",
    role: "FarmOwner",
    firstName: "Test",
    lastName: "FarmOwner",
  },
  existingAgent: {
    email: "test.agent@example.com",
    password: "Agent@123!",
    role: "Agent",
    firstName: "Test",
    lastName: "Agent",
  },
};

export const MARKETING_CHANNELS = {
  socialMedia: "social_media",
  searchEngine: "search_engine",
  wordOfMouth: "word_of_mouth",
  advertisement: "advertisement",
  newsMedia: "news_media",
  other: "other",
};

export const FARMING_EXPERIENCE = {
  newbie: "newbie",
  experienced: "experienced",
};

export function generateNewbieOnboardingData() {
  return {
    workPreference: faker.helpers.arrayElement(["solo", "manager"]),
    hasLand: faker.datatype.boolean(),
    wantsTutorial: true,
    location: faker.location.city(),
    farmSize: faker.number.int({ min: 1, max: 100 }),
    farmingMethod: faker.helpers.arrayElement([
      "greenhouse",
      "openfield",
      "not_sure",
    ]),
    farmingGoal: faker.helpers.arrayElement([
      "start_guidance",
      "better_yields",
      "export",
      "investment",
    ]),
  };
}

export function generateExperiencedOnboardingData() {
  return {
    farmingLevel: faker.helpers.arrayElement([
      "lessThanOneYear",
      "oneToThreeYears",
      "fourToSevenYears",
      "moreThanEightYears",
    ]),
    cropsCultivated: faker.helpers.arrayElements(
      ["Tomatoes", "Peppers", "Cucumbers", "Lettuce"],
      { min: 1, max: 3 },
    ),
    farmName: faker.company.name() + " Farm",
    farmSize: faker.number.int({ min: 5, max: 500 }),
    sizeUnit: faker.helpers.arrayElement(["acres", "hectares"]),
    country: "Kenya",
    region: faker.location.state(),
    nearestCity: faker.location.city(),
    irrigationType: faker.helpers.arrayElement([
      "drip",
      "sprinkler",
      "flood",
      "rain_fed",
    ]),
    hasStorage: faker.datatype.boolean(),
    transportAccess: faker.helpers.arrayElement(["own", "hired", "public"]),
  };
}
