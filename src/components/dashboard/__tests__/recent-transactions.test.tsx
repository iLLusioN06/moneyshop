import { render, screen, fireEvent } from "@testing-library/react";
import { RecentTransactions } from "../recent-transactions";

const mockRouter = { push: jest.fn() };
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@/lib/utils", () => ({
  formatCurrency: (value: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value),
  formatDate: () => "2 saat önce",
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

jest.mock("@/lib/dashboard-i18n", () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      "dash.recentTransactions": "Son İşlemler",
      "dash.viewAll": "Tümünü Gör",
      "dash.completed": "Tamamlandı",
      "dash.pending": "Beklemede",
      "dash.noCategory": "Kategorisiz",
      "dash.noTransactions": "Henüz işlem bulunmuyor",
    };
    return translations[key] || key;
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
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

const mockTransactions = [
  {
    id: "1",
    type: "INCOME",
    amount: 5000,
    description: "Maaş ödemesi",
    date: "2026-06-19T08:00:00Z",
    status: "COMPLETED",
    category: { name: "Maaş" },
  },
  {
    id: "2",
    type: "EXPENSE",
    amount: 250,
    description: "Market alışverişi",
    date: "2026-06-18T15:00:00Z",
    status: "COMPLETED",
    category: { name: "Market" },
  },
  {
    id: "3",
    type: "EXPENSE",
    amount: 1000,
    description: "Bekleyen ödeme",
    date: "2026-06-17T10:00:00Z",
    status: "PENDING",
    category: null,
  },
];

describe("RecentTransactions", () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
  });

  it("renders section title", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    expect(screen.getByText("Son İşlemler")).toBeInTheDocument();
  });

  it("renders transaction descriptions", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    expect(screen.getByText("Maaş ödemesi")).toBeInTheDocument();
    expect(screen.getByText("Market alışverişi")).toBeInTheDocument();
  });

  it("shows view all link", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    expect(screen.getByText("Tümünü Gör")).toBeInTheDocument();
  });

  it("routes to /transactions when view all clicked", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    fireEvent.click(screen.getByText("Tümünü Gör"));
    expect(mockRouter.push).toHaveBeenCalledWith("/transactions");
  });

  it("shows category name when available", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    expect(screen.getByText("Maaş")).toBeInTheDocument();
    expect(screen.getByText("Market")).toBeInTheDocument();
  });

  it("shows no category fallback", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    expect(screen.getByText("Kategorisiz")).toBeInTheDocument();
  });

  it("shows completed badge for COMPLETED status", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    const badges = screen.getAllByTestId("badge");
    expect(badges[0]).toHaveAttribute("data-variant", "success");
  });

  it("shows pending badge for PENDING status", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    const badges = screen.getAllByTestId("badge");
    expect(badges[2]).toHaveAttribute("data-variant", "warning");
  });

  it("shows empty state when no transactions", () => {
    render(<RecentTransactions transactions={[]} />);
    expect(screen.getByText("Henüz işlem bulunmuyor")).toBeInTheDocument();
  });

  it("renders formatted date", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    const dateElements = screen.getAllByText("2 saat önce");
    expect(dateElements.length).toBeGreaterThanOrEqual(1);
  });
});
