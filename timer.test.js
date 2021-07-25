const { getTimeRemaining } = require("./timer.js");
describe("getTimeRemainingInSeconds", () => {
  it("should calculate time remaining after 0 seconds", () => {
    expect(
      getTimeRemaining(1608184016, {
        screenTimeInSeconds: 1200,
        restTimeInSeconds: 20,
        startTimeInSeconds: 1608184016,
      })
    ).toEqual(1200);
  });
  it("should calculate time remaining after 1 second", () => {
    expect(
      getTimeRemaining(100, {
        screenTimeInSeconds: 1200,
        restTimeInSeconds: 20,
        startTimeInSeconds: 90,
      })
    ).toEqual(1190);
  });
});
