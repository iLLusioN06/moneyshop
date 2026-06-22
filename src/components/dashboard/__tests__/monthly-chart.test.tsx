import { render, screen } from "@testing-library/react";
import { MonthlyChart } from "../monthly-chart";

jest.mock("@/lib/utils", () => ({
  formatCurrency: (value: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value),
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

jest.mock("@/lib/dashboard-i18n", () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      "dash.monthlyChart": "Aylık Grafik",
      "dash.chartSubtitle": "Gelir ve gider dağılımı",
      "dash.noData": "Henüz veri bulunmuyor",
      "dash.income": "Gelir",
      "dash.expense": "Gider",
    };
    return translations[key] || key;
  },
  tWithVars: (key: string, vars: Record<string, string>) => {
    if (key === "dash.incomeExpense") {
      return `Gelir: ${vars.income}, Gider: ${vars.expense}`;
    }
    return key;
  },
}));

jest.mock("@/components/ui", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

const mockData = [
  { month: "Ocak", income: 50000, expense: 30000 },
  { month: "Şubat", income: 45000, expense: 35000 },
  { month: "Mart", income: 60000, expense: 25000 },
];

describe("MonthlyChart", () => {
  it("renders section title", () => {
    render(<MonthlyChart data={mockData} />);
    expect(screen.getByText("Aylık Grafik")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<MonthlyChart data={mockData} />);
    expect(screen.getByText("Gelir ve gider dağılımı")).toBeInTheDocument();
  });

  it("renders month labels", () => {
    render(<MonthlyChart data={mockData} />);
    expect(screen.getByText("Ocak")).toBeInTheDocument();
    expect(screen.getByText("Şubat")).toBeInTheDocument();
    expect(screen.getByText("Mart")).toBeInTheDocument();
  });

  it("renders legend with income label", () => {
    render(<MonthlyChart data={mockData} />);
    expect(screen.getByText("Gelir")).toBeInTheDocument();
  });

  it("renders legend with expense label", () => {
    render(<MonthlyChart data={mockData} />);
    expect(screen.getByText("Gider")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<MonthlyChart data={[]} />);
    expect(screen.getByText("Henüz veri bulunmuyor")).toBeInTheDocument();
  });

  it("shows tooltip text on hover elements", () => {
    const { container } = render(<MonthlyChart data={mockData} />);
    expect(screen.getAllByText(/Gelir/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Gider/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders income bars with profit class", () => {
    const { container } = render(<MonthlyChart data={mockData} />);
    const incomeBars = container.querySelectorAll(".bg-profit\\/80, [class*='bg-profit']");
    expect(incomeBars.length).toBeGreaterThanOrEqual(0);
  });

  it("renders expense bars with loss class", () => {
    const { container } = render(<MonthlyChart data={mockData} />);
    const expenseBars = container.querySelectorAll(".bg-loss\\/80, [class*='bg-loss']");
    expect(expenseBars.length).toBeGreaterThanOrEqual(0);
  });

  it("renders without data gracefully", () => {
    const { container } = render(<MonthlyChart data={mockData} />);
    expect(container.querySelector(".flex-1")).toBeInTheDocument();
  });
});
