import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders as span element", () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge.tagName).toBe("SPAN");
  });

  it("applies default variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-surface-tertiary");
  });

  it("applies success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge.className).toContain("text-profit");
  });

  it("applies warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge.className).toContain("text-pending");
  });

  it("applies danger variant", () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText("Danger");
    expect(badge.className).toContain("text-loss");
  });

  it("applies info variant", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge.className).toContain("text-info");
  });

  it("applies sm size by default", () => {
    render(<Badge>Small</Badge>);
    expect(screen.getByText("Small").className).toContain("text-xs");
  });

  it("applies md size", () => {
    render(<Badge size="md">Medium</Badge>);
    expect(screen.getByText("Medium").className).toContain("text-sm");
  });

  it("applies additional className", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText("Custom").className).toContain("custom-class");
  });

  it("has rounded-full class", () => {
    render(<Badge>Rounded</Badge>);
    expect(screen.getByText("Rounded").className).toContain("rounded-full");
  });
});
