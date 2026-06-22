import { renderHook, act } from "@testing-library/react";
import { useForm, getZodErrorMessages } from "@/hooks/use-form";
import { z } from "zod";

const testSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  name: z.string().min(2, "En az 2 karakter"),
});

type TestForm = z.infer<typeof testSchema>;

describe("useForm", () => {
  it("returns form with getFieldError", () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        schema: testSchema,
        defaultValues: { email: "", name: "" },
      })
    );

    expect(result.current.getFieldError).toBeDefined();
    expect(typeof result.current.getFieldError).toBe("function");
  });

  it("getFieldError returns undefined when no error", () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        schema: testSchema,
        defaultValues: { email: "test@test.com", name: "Test" },
      })
    );

    expect(result.current.getFieldError("email")).toBeUndefined();
    expect(result.current.getFieldError("name")).toBeUndefined();
  });

  it("returns standard form methods", () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        schema: testSchema,
        defaultValues: { email: "", name: "" },
      })
    );

    expect(result.current.register).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.formState).toBeDefined();
    expect(result.current.setValue).toBeDefined();
    expect(result.current.watch).toBeDefined();
  });
});

describe("getZodErrorMessages", () => {
  it("converts ZodError to record", () => {
    const result = testSchema.safeParse({ email: "invalid", name: "A" });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = getZodErrorMessages(result.error);

      expect(messages.email).toBe("Geçerli bir e-posta girin");
      expect(messages.name).toBe("En az 2 karakter");
    }
  });

  it("returns empty record for empty issues", () => {
    const messages = getZodErrorMessages(new z.ZodError([]));
    expect(messages).toEqual({});
  });
});

describe("useForm methods", () => {

  it("watch returns default values", () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        schema: testSchema,
        defaultValues: { email: "test@test.com", name: "Test" },
      })
    );

    expect(result.current.watch("email")).toBe("test@test.com");
    expect(result.current.watch("name")).toBe("Test");
  });

  it("setValue updates field value", () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        schema: testSchema,
        defaultValues: { email: "", name: "" },
      })
    );

    act(() => {
      result.current.setValue("email", "test@test.com");
    });

    expect(result.current.watch("email")).toBe("test@test.com");
  });
});
