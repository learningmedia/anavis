import workList from "work-list";

describe("Worklist", () => {
  it("should contain works", () => expect(workList().length).not.toBe(0));
});
