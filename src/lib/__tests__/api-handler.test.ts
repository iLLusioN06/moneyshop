describe("Error classes", () => {
  class ApiError extends Error {
    constructor(public statusCode: number, message: string, public code?: string) {
      super(message);
      this.name = "ApiError";
    }
  }

  class NotFoundError extends ApiError {
    constructor(message = "Kayıt bulunamadı.") {
      super(404, message, "NOT_FOUND");
    }
  }

  class ValidationError extends ApiError {
    constructor(message = "Geçersiz veri.", public details?: Record<string, string>) {
      super(400, message, "VALIDATION_ERROR");
    }
  }

  it("NotFoundError should have correct properties", () => {
    const error = new NotFoundError("Test not found");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Test not found");
    expect(error.code).toBe("NOT_FOUND");
  });

  it("ValidationError should have correct properties", () => {
    const error = new ValidationError("Invalid", { name: "Required" });
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Invalid");
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details).toEqual({ name: "Required" });
  });
});
