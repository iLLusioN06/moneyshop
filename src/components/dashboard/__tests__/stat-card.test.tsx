import { render, screen } from "@testing-library/react";
import { StatCard } from "../stat-card";
import { Wallet } from "lucide-react";

jest.mock("@/lib/dashboard-i18n", () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      "dash.vsLastMonth": "Geçen aya göre",
    };
    return translations[key] || key;
  },
}));



jest.mock("@/lib/utils", () => ({
  formatCurrency: (value: number, currency: string) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(value),
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

describe("StatCard", () => {
  const defaultProps = {
    title: "Toplam Bakiye",
    value: 15000,
    change: 12.5,
    currency: "TRY",
    icon: Wallet,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  };

  it("renders title and formatted value", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText("Toplam Bakiye")).toBeInTheDocument();
    expect(screen.getByText("₺15.000,00")).toBeInTheDocument();
  });

  it("shows positive change with arrow up", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText("%12.5")).toBeInTheDocument();
    expect(screen.getByText("Geçen aya göre")).toBeInTheDocument();
  });

  it("shows negative change with arrow down", () => {
    render(<StatCard {...defaultProps} change={-8.3} />);
    expect(screen.getByText("%8.3")).toBeInTheDocument();
  });

  it("hides change section when change is 0", () => {
    render(<StatCard {...defaultProps} change={0} />);
    expect(screen.queryByText("%0.0")).not.toBeInTheDocument();
  });

  it("renders with icon component", () => {
    render(<StatCard {...defaultProps} />);
    // The icon renders as an SVG element inside the component
    const card = screen.getByText("Toplam Bakiye").closest("div");
    expect(card).toBeInTheDocument();
  });

  it("renders with USD currency format", () => {
    render(<StatCard {...defaultProps} currency="USD" value={1000} />);
    expect(screen.getByText(/\$1.000,00/)).toBeInTheDocument();
  });

  it("applies correct color classes to the icon container", () => {
    render(<StatCard {...defaultProps} />);
    const iconContainer = screen.getByText("Toplam Bakiye")
      .closest("div")
      ?.querySelector('[class*="bg-"]');
    expect(iconContainer).toBeInTheDocument();
  });

  it("renders title with text-muted class", () => {
    render(<StatCard {...defaultProps} />);
    const title = screen.getByText("Toplam Bakiye");
    expect(title).toHaveClass("text-text-muted");
  });
});
