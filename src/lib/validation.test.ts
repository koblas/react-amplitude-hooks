import { isValidAmplitudeInstance } from "./validation";

describe("validation", () => {
  test("string", () => {
    expect(isValidAmplitudeInstance("test")).toBe(false);
  });
  test("undefined", () => {
    expect(isValidAmplitudeInstance(undefined)).toBe(false);
  });
});
