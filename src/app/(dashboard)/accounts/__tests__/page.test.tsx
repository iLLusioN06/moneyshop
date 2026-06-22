import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AccountsPage from "../page";
import { formatCurrency, getAccountTypeColor } from "@/lib/utils";

global.fetch = jest.fn();

const mockRouter = { push: jest.fn() };
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("lucide-react", () => ({
  Wallet: () => <span data-testid="icon-wallet" />,
  Plus: () => <span data-testid="icon-plus" />,
  Edit2: () => <span data-testid="icon-edit" />,
  Trash2: () => <span data-testid="icon-trash" />,
  X: () => <span data-testid="icon-x" />,
  Check: () => <span data-testid="icon-check" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  Building2: () => <span data-testid="icon-building" />,
  PiggyBank: () => <span data-testid="icon-piggy" />,
  CreditCard: () => <span data-testid="icon-creditcard" />,
  ChartLine: () => <span data-testid="icon-chart" />,
  Banknote: () => <span data-testid="icon-banknote" />,
  HandCoins: () => <span data-testid="icon-handcoins" />,
}));

jest.mock("@/lib/utils", () => ({
  formatCurrency: jest.fn((amount: number, currency?: string) => {
    if (currency) return `${currency}${Math.abs(amount).toFixed(2)}`;
    return `TRY${amount.toFixed(2)}`;
  }),
  getAccountTypeColor: jest.fn(() => "#3b82f6"),
  cn: jest.fn((...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" ")
  ),
}));

jest.mock("@/lib/constants", () => ({
  ACCOUNT_TYPES: [
    { value: "CHECKING", label: "Vadesiz Hesap" },
    { value: "SAVINGS", label: "Vadeli Hesap" },
    { value: "CREDIT_CARD", label: "Kredi Kartı" },
    { value: "INVESTMENT", label: "Yatırım" },
    { value: "CASH", label: "Nakit" },
    { value: "LOAN", label: "Kredi" },
  ],
  CURRENCIES: [
    { value: "TRY", label: "₺ Türk Lirası" },
    { value: "USD", label: "$ Dolar" },
    { value: "EUR", label: "€ Euro" },
    { value: "GBP", label: "£ Sterlin" },
    { value: "CHF", label: "CHF İsviçre Frangı" },
    { value: "AED", label: "AED BAE Dirhemi" },
    { value: "IQD", label: "IQD Irak Dinarı" },
    { value: "XAU", label: "Altın (Gram)" },
  ],
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
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    isLoading,
    variant,
    className,
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className}
      data-variant={variant}
    >
      {isLoading && <span data-testid="btn-loading" />}
      {children}
    </button>
  ),
  Input: ({ label, value, onChange, placeholder, type, step, required }: any) => (
    <div>
      {label && <label>{label}</label>}
      <input
        data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-")}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type || "text"}
        step={step}
        required={required}
      />
    </div>
  ),
  Badge: ({ children, variant, size, className }: any) => (
    <span className={className} data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
  EmptyState: ({ icon: Icon, title, description, action }: any) => (
    <div data-testid="empty-state">
      {Icon && <span data-testid="empty-icon" />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <button onClick={action.onClick}>{action.label}</button>}
    </div>
  ),
}));

const mockAccounts = [
  {
    id: "1",
    userId: "user1",
    name: "Vadesiz Hesabım",
    type: "CHECKING",
    balance: 15000.5,
    currency: "TRY",
    icon: null,
    color: "#3b82f6",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    userId: "user1",
    name: "Kredi Kartım",
    type: "CREDIT_CARD",
    balance: -5000,
    currency: "TRY",
    icon: null,
    color: "#ef4444",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    userId: "user1",
    name: "Pasif Hesap",
    type: "SAVINGS",
    balance: 3000,
    currency: "TRY",
    icon: null,
    color: "#10b981",
    isActive: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

function mockFetchResponse(data: unknown) {
  return { json: () => Promise.resolve(data) };
}

describe("AccountsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders page title", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: [] })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Hesaplar")).toBeInTheDocument();
    });
  });

  it("shows loading skeleton initially", () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<AccountsPage />);

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(3);
  });

  it("shows empty state when no accounts", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: [] })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Henüz hesap eklenmemiş")
    ).toBeInTheDocument();
  });

  it("renders account cards", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });
    expect(screen.getByText("Kredi Kartım")).toBeInTheDocument();
    expect(screen.getByText("Pasif Hesap")).toBeInTheDocument();
  });

  it("shows error state", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: false, error: "Hata" })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Hata")).toBeInTheDocument();
    });
    expect(
      document.querySelector(".shake-alert")
    ).toBeInTheDocument();
  });

  it("shows total balance", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Toplam bakiye/)).toBeInTheDocument();
    });
  });

  it("opens add modal", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("Hesap Ekle")[0]);

    expect(screen.getByText("Yeni Hesap")).toBeInTheDocument();
  });

  it("opens edit modal", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle("Düzenle");
    fireEvent.click(editButtons[0]);

    expect(screen.getByText("Hesabı Düzenle")).toBeInTheDocument();
  });

  it("closes modal on cancel", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("Hesap Ekle")[0]);
    expect(screen.getByText("Yeni Hesap")).toBeInTheDocument();

    fireEvent.click(screen.getByText("İptal"));

    await waitFor(() => {
      expect(screen.queryByText("Yeni Hesap")).not.toBeInTheDocument();
    });
  });

  it("closes modal on X button", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("Hesap Ekle")[0]);
    expect(screen.getByText("Yeni Hesap")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("icon-x"));

    await waitFor(() => {
      expect(screen.queryByText("Yeni Hesap")).not.toBeInTheDocument();
    });
  });

  it("shows form validation error", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("Hesap Ekle")[0]);
    expect(screen.getByText("Yeni Hesap")).toBeInTheDocument();

    const nameInput = screen.getByTestId("input-hesap-adı");
    fireEvent.change(nameInput, { target: { value: "" } });

    const saveButton = screen.getByText("Oluştur");
    fireEvent.click(saveButton);

    expect(
      screen.getByText("Hesap adı zorunludur.")
    ).toBeInTheDocument();
  });

  it("creates new account", async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock
      .mockResolvedValueOnce(
        mockFetchResponse({ success: true, data: mockAccounts })
      )
      .mockResolvedValueOnce(
        mockFetchResponse({ success: true, data: { id: "new" } })
      )
      .mockResolvedValue(
        mockFetchResponse({ success: true, data: mockAccounts })
      );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("Hesap Ekle")[0]);
    expect(screen.getByText("Yeni Hesap")).toBeInTheDocument();

    const nameInput = screen.getByTestId("input-hesap-adı");
    fireEvent.change(nameInput, { target: { value: "Yeni Hesabım" } });

    const typeSelect = screen.getByDisplayValue("Vadesiz Hesap");
    fireEvent.change(typeSelect, { target: { value: "SAVINGS" } });

    const balanceInput = screen.getByTestId("input-bakiye");
    fireEvent.change(balanceInput, { target: { value: "5000" } });

    const currencySelect = screen.getByDisplayValue("₺ Türk Lirası");
    fireEvent.change(currencySelect, { target: { value: "USD" } });

    const saveButton = screen.getByText("Oluştur");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Yeni Hesabım",
          type: "SAVINGS",
          balance: 5000,
          currency: "USD",
          color: "#3b82f6",
        }),
      });
    });
  });

  it("updates existing account", async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock
      .mockResolvedValueOnce(
        mockFetchResponse({ success: true, data: mockAccounts })
      )
      .mockResolvedValueOnce(
        mockFetchResponse({ success: true, data: { id: "1" } })
      )
      .mockResolvedValue(
        mockFetchResponse({ success: true, data: mockAccounts })
      );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle("Düzenle");
    fireEvent.click(editButtons[0]);
    expect(screen.getByText("Hesabı Düzenle")).toBeInTheDocument();

    const nameInput = screen.getByTestId("input-hesap-adı");
    fireEvent.change(nameInput, { target: { value: "Güncellenmiş Hesap" } });

    const saveButton = screen.getByText("Güncelle");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/accounts/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Güncellenmiş Hesap",
          type: "CHECKING",
          balance: 15000.5,
          currency: "TRY",
          color: "#3b82f6",
        }),
      });
    });
  });

  it("shows delete confirmation modal", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle("Sil");
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText("Hesabı Sil")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Bu hesabı devre dışı bırakmak istediğinize emin misiniz/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Devre Dışı Bırak")
    ).toBeInTheDocument();
  });

  it("deletes account on confirm", async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock
      .mockResolvedValueOnce(
        mockFetchResponse({ success: true, data: mockAccounts })
      )
      .mockResolvedValueOnce(
        mockFetchResponse({ success: true, data: { id: "1" } })
      )
      .mockResolvedValue(
        mockFetchResponse({ success: true, data: mockAccounts })
      );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle("Sil");
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText("Hesabı Sil")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Devre Dışı Bırak"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/accounts/1", {
        method: "DELETE",
      });
    });
  });

  it("cancels delete", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vadesiz Hesabım")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle("Sil");
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText("Hesabı Sil")).toBeInTheDocument();

    fireEvent.click(screen.getByText("İptal"));

    await waitFor(() => {
      expect(screen.queryByText("Hesabı Sil")).not.toBeInTheDocument();
    });
  });

  it("shows inactive account opacity", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    const { container } = render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Pasif Hesap")).toBeInTheDocument();
    });

    expect(container.innerHTML).toContain("opacity-60");
  });

  it("shows credit card balance as positive debt", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Kredi Kartım")).toBeInTheDocument();
    });

    expect(screen.getByText("Borç", { exact: false })).toBeInTheDocument();
    expect(screen.getAllByText("Bakiye", { exact: false }).length).toBeGreaterThanOrEqual(1);
    expect(formatCurrency).toHaveBeenCalledWith(5000, "TRY");
  });

  it("shows Pasif badge for inactive accounts", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({ success: true, data: mockAccounts })
    );

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Pasif Hesap")).toBeInTheDocument();
    });

    const badges = screen.getAllByTestId("badge");
    const pasifBadge = badges.find((b) => b.textContent === "Pasif");
    expect(pasifBadge).toBeInTheDocument();
    expect(pasifBadge).toHaveAttribute("data-variant", "warning");
  });
});
