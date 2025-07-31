describe("基本測試", () => {
  it("應該通過基本測試", () => {
    expect(1 + 1).toBe(2);
  });

  it("應該處理字串", () => {
    expect("hello").toBe("hello");
  });

  it("應該處理陣列", () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr[0]).toBe(1);
  });

  it("應該處理物件", () => {
    const obj = { name: "test", value: 42 };
    expect(obj.name).toBe("test");
    expect(obj.value).toBe(42);
  });
});
