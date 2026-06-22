import { render, screen } from "@testing-library/react";
import { LoadingSpinner, LoadingOverlay, LoadingBar } from "../loading-spinner";

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

describe("LoadingSpinner", () => {
  it("renders with status role", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders with default md size and primary color", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("w-8 h-8");
    expect(spinner.className).toContain("border-secondary");
  });

  it("renders with xs size", () => {
    render(<LoadingSpinner size="xs" />);
    expect(screen.getByRole("status").className).toContain("w-3.5");
  });

  it("renders with sm size", () => {
    render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole("status").className).toContain("w-5");
  });

  it("renders with lg size", () => {
    render(<LoadingSpinner size="lg" />);
    expect(screen.getByRole("status").className).toContain("w-12");
  });

  it("renders with xl size", () => {
    render(<LoadingSpinner size="xl" />);
    expect(screen.getByRole("status").className).toContain("w-16");
  });

  it("renders with white color", () => {
    render(<LoadingSpinner color="white" />);
    expect(screen.getByRole("status").className).toContain("border-white");
  });

  it("renders with current color", () => {
    render(<LoadingSpinner color="current" />);
    expect(screen.getByRole("status").className).toContain("border-current");
  });

  it("renders label when provided", () => {
    render(<LoadingSpinner label="Yükleniyor..." />);
    expect(screen.getByText("Yükleniyor...")).toBeInTheDocument();
  });

  it("renders full screen when fullScreen is true", () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    const fullScreen = container.firstChild as HTMLElement;
    expect(fullScreen.className).toContain("min-h-screen");
  });

  it("has aria-label", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Yükleniyor");
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-class" />);
    const container = screen.getByRole("status").parentElement;
    expect(container?.className).toContain("custom-class");
  });

  it("has animate-spin class", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status").className).toContain("animate-spin");
  });

  it("has rounded-full class", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status").className).toContain("rounded-full");
  });
});

describe("LoadingOverlay", () => {
  it("renders when loading is true", () => {
    render(<LoadingOverlay loading={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("does not render when loading is false", () => {
    render(<LoadingOverlay loading={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<LoadingOverlay loading={true} label="Kaydediliyor..." />);
    expect(screen.getByText("Kaydediliyor...")).toBeInTheDocument();
  });

  it("has backdrop classes", () => {
    const { container } = render(<LoadingOverlay loading={true} />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain("backdrop-blur-sm");
  });
});

describe("LoadingBar", () => {
  it("renders when loading is true", () => {
    const { container } = render(<LoadingBar loading={true} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("does not render when loading is false", () => {
    const { container } = render(<LoadingBar loading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("has animated loading bar inner div", () => {
    const { container } = render(<LoadingBar loading={true} />);
    const innerBar = container.querySelector(".bg-secondary");
    expect(innerBar).toBeInTheDocument();
  });
});
