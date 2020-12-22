const { getTimeRemainingInSeconds } = require("./timer.js");
describe("getTimeRemainingInSeconds", () => {
  it("should calculate time remaining after 0 seconds", () => {
    expect(
      getTimeRemainingInSeconds(1608184016, {
        screenTimeInSeconds: 1200,
        restTimeInSeconds: 20,
        startTimeInSeconds: 1608184016,
      })
    ).toEqual(1200);
  });
  it("should calculate time remaining after 1 second", () => {
    expect(
      getTimeRemainingInSeconds(100, {
        screenTimeInSeconds: 1200,
        restTimeInSeconds: 20,
        startTimeInSeconds: 90,
      })
    ).toEqual(1190);
  });
});
