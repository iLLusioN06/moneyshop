import { render, screen, fireEvent } from "@testing-library/react";
import { AccountsOverview } from "../accounts-overview";
import type { AccountWithConversion } from "@/hooks/use-dashboard";

const mockRouter = { push: jest.fn() };
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@/lib/utils", () => ({
  formatCurrency: (value: number, currency: string) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(value),
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

jest.mock("@/lib/dashboard-i18n", () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      "dash.accounts": "Hesaplarım",
      "dash.accountsSubtitle": "Tüm hesaplarınız",
      "dash.addAccount": "Hesap Ekle",
      "dash.balance": "Bakiye",
      "dash.debt": "Borç",
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
  Button: ({ children, onClick, disabled, variant, size, className, title }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} title={title}>
      {children}
    </button>
  ),
}));

const mockAccounts: AccountWithConversion[] = [
  {
    id: "1",
    name: "Vadesiz Hesap",
    type: "CHECKING",
    balance: 15000,
    currency: "TRY",
    icon: "wallet",
    color: "#3b82f6",
    isActive: true,
    originalBalance: 15000,
    originalCurrency: "TRY",
    convertedBalance: 15000,
    convertedCurrency: "TRY",
  },
  {
    id: "2",
    name: "Dolar Hesabı",
    type: "SAVINGS",
    balance: 1000,
    currency: "USD",
    icon: "globe",
    color: "#10b981",
    isActive: true,
    originalBalance: 1000,
    originalCurrency: "USD",
    convertedBalance: 30000,
    convertedCurrency: "TRY",
  },
];

describe("AccountsOverview", () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
  });

  it("renders account names", () => {
    render(
      <AccountsOverview
        accounts={mockAccounts}
        baseCurrency="TRY"
        exchangeRates={{}}
      />
    );
    expect(screen.getByText("Vadesiz Hesap")).toBeInTheDocument();
    expect(screen.getByText("Dolar Hesabı")).toBeInTheDocument();
  });

  it("renders section title", () => {
    render(
      <AccountsOverview
        accounts={mockAccounts}
        baseCurrency="TRY"
        exchangeRates={{}}
      />
    );
    expect(screen.getByText("Hesaplarım")).toBeInTheDocument();
  });

  it("shows total converted balance", () => {
    render(
      <AccountsOverview
        accounts={mockAccounts}
        baseCurrency="TRY"
        exchangeRates={{}}
      />
    );
    expect(screen.getByText("Toplam (Hepsi TRY)")).toBeInTheDocument();
  });

  it("shows add account button", () => {
    render(
      <AccountsOverview
        accounts={mockAccounts}
        baseCurrency="TRY"
        exchangeRates={{}}
      />
    );
    expect(screen.getByText("Hesap Ekle")).toBeInTheDocument();
  });

  it("calls router.push when add account clicked", () => {
    render(
      <AccountsOverview
        accounts={mockAccounts}
        baseCurrency="TRY"
        exchangeRates={{}}
      />
    );
    fireEvent.click(screen.getByText("Hesap Ekle"));
    expect(mockRouter.push).toHaveBeenCalledWith("/accounts");
  });

  it("shows original currency when different from base", () => {
    render(
      <AccountsOverview
        accounts={mockAccounts}
        baseCurrency="TRY"
        exchangeRates={{}}
      />
    );
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("shows empty state when no accounts", () => {
    render(
      <AccountsOverview
        accounts={[]}
        baseCurrency="TRY"
        exchangeRates={{}}
      />
    );
    expect(screen.getByText("Henüz hesap bulunmuyor")).toBeInTheDocument();
  });

  it("renders refresh button when onRefreshRates provided", () => {
    render(
      <AccountsOverview
        accounts={mockAccounts}
        baseCurrency="TRY"
        exchangeRates={{}}
        onRefreshRates={jest.fn()}
      />
    );
    const refreshButton = screen.getByTitle("Kurları güncelle");
    expect(refreshButton).toBeInTheDocument();
  });

  it("calls onRefreshRates when refresh clicked", () => {
    const onRefreshRates = jest.fn();
    render(
      <AccountsOverview
        accounts={mockAccounts}
        baseCurrency="TRY"
        exchangeRates={{}}
        onRefreshRates={onRefreshRates}
      />
    );
    fireEvent.click(screen.getByTitle("Kurları güncelle"));
    expect(onRefreshRates).toHaveBeenCalledTimes(1);
  });

  it("disables refresh button when isRefreshing", () => {
    render(
      <AccountsOverview
        accounts={mockAccounts}
        baseCurrency="TRY"
        exchangeRates={{}}
        onRefreshRates={jest.fn()}
        isRefreshing={true}
      />
    );
    expect(screen.getByTitle("Kurları güncelle")).toBeDisabled();
  });

  it("shows exchange rate count", () => {
    render(
      <AccountsOverview
        accounts={mockAccounts}
        baseCurrency="TRY"
        exchangeRates={{ USD: 30, EUR: 32 }}
      />
    );
    expect(screen.getByText("2 kur")).toBeInTheDocument();
  });
});
