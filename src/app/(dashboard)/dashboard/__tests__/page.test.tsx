import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardPage from "../page";

const mockPush = jest.fn();
const mockRefetch = jest.fn();
const mockUseDashboard = jest.fn();
const mockUseWebSocketContext = jest.fn();

jest.mock("@/hooks", () => ({
  useDashboard: (...args: any[]) => mockUseDashboard(...args),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "user-1", role: "USER" } } }),
}));

jest.mock("@/components/websocket-provider", () => ({
  useWebSocketContext: (...args: any[]) => mockUseWebSocketContext(...args),
}));

jest.mock("@/lib/dashboard-i18n", () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      "dash.welcome": "Dashboard",
      "dash.subtitle": "Genel Bakış",
      "dash.totalBalance": "Toplam Bakiye",
      "dash.totalIncome": "Toplam Gelir",
      "dash.totalExpense": "Toplam Gider",
      "dash.netWorth": "Net Değer",
      "dash.newTransaction": "Yeni İşlem",
      "dash.verifiedAccount": "Doğrulanmış Hesap",
      "dash.unverifiedAccount": "Doğrulanmamış Hesap",
      "dash.verifyPrompt": "Hesabınızı doğrulayın",
    };
    return translations[key] || key;
  },
}));

jest.mock("@/lib/constants", () => ({
  CURRENCIES: [
    { value: "TRY", label: "₺ Türk Lirası", symbol: "₺" },
    { value: "USD", label: "$ Dolar", symbol: "$" },
    { value: "EUR", label: "€ Euro", symbol: "€" },
  ],
}));

jest.mock("@/components/dashboard", () => ({
  StatCard: ({ title, value }: any) => <div data-testid="stat-card">{title}: {value}</div>,
  MonthlyChart: () => <div data-testid="monthly-chart" />,
  RecentTransactions: () => <div data-testid="recent-transactions" />,
  CurrencyMarquee: () => <div data-testid="currency-marquee" />,
}));

jest.mock("@/components/dashboard/health-score", () => ({
  __esModule: true,
  default: () => <div data-testid="health-score" />,
}));

jest.mock("@/components/dashboard/fraud-alerts", () => ({
  __esModule: true,
  default: () => <div data-testid="fraud-alerts" />,
}));

jest.mock("@/components/dashboard/cbi-rates", () => ({
  __esModule: true,
  default: () => <div data-testid="cbi-rates" />,
}));

jest.mock("@/components/onboarding/onboarding-wizard", () => ({
  __esModule: true,
  default: ({ onComplete }: any) => <div data-testid="onboarding-wizard" />,
}));

jest.mock("@/components/pull-to-refresh", () => ({
  __esModule: true,
  default: ({ children, onRefresh }: any) => <div data-testid="pull-to-refresh">{children}</div>,
}));

jest.mock("@/components/error-boundary", () => ({
  ErrorBoundary: ({ children }: any) => <div data-testid="error-boundary">{children}</div>,
}));

jest.mock("@/components/ui", () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>{children}</button>
  ),
}));

jest.mock("lucide-react", () => ({
  Wallet: () => <svg data-testid="icon-wallet" />,
  TrendingUp: () => <svg data-testid="icon-trending-up" />,
  TrendingDown: () => <svg data-testid="icon-trending-down" />,
  PiggyBank: () => <svg data-testid="icon-piggy-bank" />,
  Plus: () => <svg data-testid="icon-plus" />,
  AlertCircle: () => <svg data-testid="icon-alert-circle" />,
  RefreshCw: () => <svg data-testid="icon-refresh-cw" />,
  XCircle: () => <svg data-testid="icon-x-circle" />,
  CheckCircle2: () => <svg data-testid="icon-check-circle" />,
  Globe: () => <svg data-testid="icon-globe" />,
  ChevronDown: () => <svg data-testid="icon-chevron-down" />,
  Wifi: () => <svg data-testid="icon-wifi" />,
  WifiOff: () => <svg data-testid="icon-wifi-off" />,
}));

const mockDashboardData = {
  totalBalance: 100000,
  totalIncome: 50000,
  totalExpense: 30000,
  netWorth: 20000,
  currency: "TRY",
  incomeChange: 10,
  expenseChange: -5,
  balanceChange: 15,
  accounts: [],
  exchangeRates: { USD: 30, EUR: 32 },
  recentTransactions: [],
  monthlyData: [],
  categoryBreakdown: [],
};

function renderPage() {
  return render(<DashboardPage />);
}

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDashboard.mockReturnValue({
      data: null,
      isLoading: true,
      error: "",
      refetch: mockRefetch,
    });
    mockUseWebSocketContext.mockReturnValue({
      connected: true,
      eventVersion: 0,
    });
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { emailVerified: true } }),
    });
  });

  it("renders welcome title", () => {
    renderPage();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Genel Bakış")).toBeInTheDocument();
  });

  it("shows loading skeleton initially", () => {
    const { container } = renderPage();
    const skeletonCards = container.querySelectorAll('[style*="animation-delay"]');
    expect(skeletonCards.length).toBe(4);
    expect(screen.queryByTestId("stat-card")).not.toBeInTheDocument();
  });

  it("renders stat cards when data loaded", () => {
    mockUseDashboard.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: "",
      refetch: mockRefetch,
    });
    renderPage();
    const statCards = screen.getAllByTestId("stat-card");
    expect(statCards.length).toBe(4);
    expect(screen.getByText(/Toplam Bakiye/)).toBeInTheDocument();
    expect(screen.getByText(/Toplam Gelir/)).toBeInTheDocument();
    expect(screen.getByText(/Toplam Gider/)).toBeInTheDocument();
    expect(screen.getByText(/Net Değer/)).toBeInTheDocument();
  });

  it("renders chart and transaction sections when data loaded", () => {
    mockUseDashboard.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: "",
      refetch: mockRefetch,
    });
    renderPage();
    expect(screen.getByTestId("monthly-chart")).toBeInTheDocument();
    expect(screen.getByTestId("recent-transactions")).toBeInTheDocument();
    expect(screen.getByTestId("health-score")).toBeInTheDocument();
    expect(screen.getByTestId("fraud-alerts")).toBeInTheDocument();
    expect(screen.getByTestId("cbi-rates")).toBeInTheDocument();
    expect(screen.getByTestId("currency-marquee")).toBeInTheDocument();
  });

  it("shows error message when error occurs", () => {
    mockUseDashboard.mockReturnValue({
      data: null,
      isLoading: false,
      error: "Bir hata oluştu",
      refetch: mockRefetch,
    });
    renderPage();
    expect(screen.getByText("Bir hata oluştu")).toBeInTheDocument();
    expect(screen.getByTestId("icon-alert-circle")).toBeInTheDocument();
  });

  it("shows WebSocket connected indicator", () => {
    mockUseWebSocketContext.mockReturnValue({
      connected: true,
      eventVersion: 0,
    });
    mockUseDashboard.mockReturnValue({
      data: null,
      isLoading: false,
      error: "",
      refetch: mockRefetch,
    });
    renderPage();
    expect(screen.getByTestId("icon-wifi")).toBeInTheDocument();
    expect(screen.getByText("CANLI")).toBeInTheDocument();
  });

  it("shows WebSocket disconnected indicator", () => {
    mockUseWebSocketContext.mockReturnValue({
      connected: false,
      eventVersion: 0,
    });
    mockUseDashboard.mockReturnValue({
      data: null,
      isLoading: false,
      error: "",
      refetch: mockRefetch,
    });
    renderPage();
    expect(screen.getByTestId("icon-wifi-off")).toBeInTheDocument();
    expect(screen.getByText("BAĞLI DEĞİL")).toBeInTheDocument();
  });

  it("allows base currency change", () => {
    const callArgs: string[] = [];
    mockUseDashboard.mockImplementation((baseCurrency: string) => {
      callArgs.push(baseCurrency);
      return { data: null, isLoading: false, error: "", refetch: mockRefetch };
    });
    renderPage();
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("TRY");
    fireEvent.change(select, { target: { value: "USD" } });
    expect(select).toHaveValue("USD");
    expect(callArgs).toContain("USD");
  });

  it("shows new transaction button", () => {
    renderPage();
    expect(screen.getByText("Yeni İşlem")).toBeInTheDocument();
  });

  it("calls router.push on new transaction click", () => {
    renderPage();
    fireEvent.click(screen.getByText("Yeni İşlem"));
    expect(mockPush).toHaveBeenCalledWith("/transactions");
  });

  it("shows verification status", async () => {
    mockUseDashboard.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: "",
      refetch: mockRefetch,
    });
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { emailVerified: true } }),
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Doğrulanmış Hesap")).toBeInTheDocument();
    });
  });

  it("shows unverified status", async () => {
    mockUseDashboard.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: "",
      refetch: mockRefetch,
    });
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { emailVerified: false } }),
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Doğrulanmamış Hesap")).toBeInTheDocument();
    });
  });
});
