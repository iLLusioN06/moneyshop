import { render, screen } from "@testing-library/react";
import { FormField, FormLabel, FormError, FormHint, FormControl } from "../form";

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

describe("FormField", () => {
  it("renders children", () => {
    render(<FormField><input /></FormField>);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("has space-y class", () => {
    const { container } = render(<FormField>Content</FormField>);
    expect(container.firstChild?.className).toContain("space-y");
  });
});

describe("FormLabel", () => {
  it("renders label text", () => {
    render(<FormLabel>E-posta</FormLabel>);
    expect(screen.getByText("E-posta")).toBeInTheDocument();
  });

  it("renders required asterisk when required", () => {
    render(<FormLabel required>E-posta</FormLabel>);
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk.className).toContain("text-danger");
  });

  it("does not render asterisk when not required", () => {
    render(<FormLabel>E-posta</FormLabel>);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("renders as label element", () => {
    render(<FormLabel>Label</FormLabel>);
    expect(screen.getByText("Label").tagName).toBe("LABEL");
  });

  it("forwards htmlFor", () => {
    render(<FormLabel htmlFor="email">E-posta</FormLabel>);
    expect(screen.getByText("E-posta")).toHaveAttribute("for", "email");
  });
});

describe("FormError", () => {
  it("renders error message when provided", () => {
    render(<FormError message="Bu alan zorunludur" />);
    expect(screen.getByText("Bu alan zorunludur")).toBeInTheDocument();
  });

  it("does not render when message is empty", () => {
    const { container } = render(<FormError message="" />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render when message is undefined", () => {
    const { container } = render(<FormError />);
    expect(container.firstChild).toBeNull();
  });

  it("has text-danger class", () => {
    render(<FormError message="Hata" />);
    expect(screen.getByText("Hata").className).toContain("text-danger");
  });
});

describe("FormHint", () => {
  it("renders hint text", () => {
    render(<FormHint>Yardım metni</FormHint>);
    expect(screen.getByText("Yardım metni")).toBeInTheDocument();
  });

  it("has text-muted class", () => {
    render(<FormHint>İpucu</FormHint>);
    expect(screen.getByText("İpucu").className).toContain("text-text-muted");
  });
});

describe("FormControl", () => {
  it("renders children", () => {
    render(<FormControl><span>Control</span></FormControl>);
    expect(screen.getByText("Control")).toBeInTheDocument();
  });
});
