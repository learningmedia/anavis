import workService from "work-service";

describe("workService", () => {

  describe("when create function is called", () => {

    beforeEach(() => {
      workService.works([]);
      workService.create();
    });

    it("should be a function", () => {
      expect(typeof workService.create).toBe("function");
    });

    it("should contain one element", () => {
      expect(workService.works().length).toBe(1);
    });

    it("should have a work with a part collection", () => {
      expect(typeof workService.works()[0].parts()).toBe("object");
    });

    it("should a work with a part collection with one part", () => {
      expect(workService.works()[0].parts()[0].id()).toBeDefined();
      expect(workService.works()[0].parts()[0].length()).toBe(1024);
      expect(workService.works()[0].parts()[0].color()).toBe("navy");
      expect(workService.works()[0].parts()[0].name()).toBe("unbekannt");
      expect(workService.works()[0].parts()[0].sound()).toBeUndefined();
    });

  });

});
