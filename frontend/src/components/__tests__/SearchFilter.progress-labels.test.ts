import enMessages from "../../../messages/en.json";
import zhMessages from "../../../messages/zh.json";
import zhTWMessages from "../../../messages/zh-TW.json";

describe("SearchFilter progress labels", () => {
  it("describes low progress as below 20 percent in every locale", () => {
    expect(
      zhTWMessages.SearchFilter.details.basic.progressOptions.low
    ).toContain("<20%");
    expect(zhMessages.SearchFilter.details.basic.progressOptions.low).toContain(
      "<20%"
    );
    expect(enMessages.SearchFilter.details.basic.progressOptions.low).toContain(
      "<20%"
    );
  });
});
