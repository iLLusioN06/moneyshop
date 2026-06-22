describe("getRequestMetadata", () => {
  function getRequestMetadata(headers: Record<string, string>): { ip?: string; userAgent?: string } {
    const forwarded = headers["x-forwarded-for"];
    const ip = forwarded?.split(",")[0]?.trim()
      || headers["x-real-ip"]
      || headers["cf-connecting-ip"]
      || undefined;
    const userAgent = headers["user-agent"] || undefined;
    return { ip, userAgent };
  }

  it("should extract IP from x-forwarded-for", () => {
    const meta = getRequestMetadata({
      "x-forwarded-for": "192.168.1.100, 10.0.0.1",
      "user-agent": "Mozilla/5.0",
    });
    expect(meta.ip).toBe("192.168.1.100");
    expect(meta.userAgent).toBe("Mozilla/5.0");
  });

  it("should extract IP from x-real-ip", () => {
    const meta = getRequestMetadata({ "x-real-ip": "10.0.0.50" });
    expect(meta.ip).toBe("10.0.0.50");
  });

  it("should extract IP from cf-connecting-ip", () => {
    const meta = getRequestMetadata({ "cf-connecting-ip": "1.2.3.4" });
    expect(meta.ip).toBe("1.2.3.4");
  });

  it("should return undefined when no IP headers", () => {
    const meta = getRequestMetadata({});
    expect(meta.ip).toBeUndefined();
  });
});
