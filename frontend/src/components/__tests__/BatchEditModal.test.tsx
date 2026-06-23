import { BATCH_RATING_OPTIONS } from "../BatchEditModal";

describe("BatchEditModal", () => {
  it("uses the same 10 point rating scale as the rest of the app", () => {
    expect(BATCH_RATING_OPTIONS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});
