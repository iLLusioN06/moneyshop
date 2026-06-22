import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../empty-state";

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

jest.mock("../button", () => ({
  Button: ({ children, onClick, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState icon={() => null} title="Veri bulunamadı" />);
    expect(screen.getByText("Veri bulunamadı")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        icon={() => null}
        title="Başlık"
        description="Açıklama metni"
      />
    );
    expect(screen.getByText("Açıklama metni")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState icon={() => null} title="Başlık" />);
    expect(screen.queryByText("Açıklama metni")).not.toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState
        icon={() => null}
        title="Başlık"
        action={{ label: "Ekle", onClick: jest.fn() }}
      />
    );
    expect(screen.getByText("Ekle")).toBeInTheDocument();
  });

  it("does not render action button when not provided", () => {
    render(<EmptyState icon={() => null} title="Başlık" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls action onClick when button clicked", () => {
    const onClick = jest.fn();
    render(
      <EmptyState
        icon={() => null}
        title="Başlık"
        action={{ label: "Ekle", onClick }}
      />
    );
    fireEvent.click(screen.getByText("Ekle"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders with custom gradient", () => {
    const { container } = render(
      <EmptyState
        icon={() => null}
        title="Başlık"
        gradient="from-blue-500 to-purple-500"
      />
    );
    // Icon container uses template literal for gradient, pulse ring uses string literal
    const iconContainer = container.querySelector('[class*="w-20 h-20"]');
    expect(iconContainer?.className).toContain("from-blue-500");
  });

  it("renders h3 for title", () => {
    render(<EmptyState icon={() => null} title="Başlık" />);
    const title = screen.getByText("Başlık");
    expect(title.tagName).toBe("H3");
  });
});
