import { render, screen, waitFor } from "@testing-library/react";
import FraudAlerts from "../fraud-alerts";

jest.mock("lucide-react", () => ({
  ShieldAlert: () => <div data-testid="icon-shield-alert" />,
  AlertTriangle: () => <div data-testid="icon-alert-triangle" />,
  AlertCircle: () => <div data-testid="icon-alert-circle" />,
  Info: () => <div data-testid="icon-info" />,
  TrendingUp: () => <div data-testid="icon-trending-up" />,
  Clock: () => <div data-testid="icon-clock" />,
  Zap: () => <div data-testid="icon-zap" />,
  DollarSign: () => <div data-testid="icon-dollar" />,
  UserX: () => <div data-testid="icon-user-x" />,
  Loader2: () => <div data-testid="icon-loader" />,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    "fraud.title": "Güvenlik Uyarıları",
    "fraud.subtitle": "Anlık güvenlik bildirimleri",
    "fraud.high": "Yüksek",
    "fraud.medium": "Orta",
    "fraud.low": "Düşük",
    "fraud.noAlerts": "Güvendesiniz",
    "fraud.allClear": "Aktif uyarı bulunmuyor",
  };
  return translations[key] || key;
};

const mockSuccessData = {
  success: true,
  data: {
    alerts: [
      {
        id: "1",
        type: "HIGH_VALUE",
        severity: "HIGH",
        title: "Yüksek Tutarlı İşlem",
        description: "50,000 TL tutarında işlem tespit edildi",
        transactionId: "tx_001",
        amount: 50000,
        createdAt: "2026-06-19T08:00:00Z",
      },
      {
        id: "2",
        type: "LATE_NIGHT",
        severity: "MEDIUM",
        title: "Gece Geç Saat İşlemi",
        description: "03:24'te işlem gerçekleşti",
        createdAt: "2026-06-18T03:24:00Z",
      },
    ],
    summary: {
      totalAlerts: 2,
      highSeverity: 1,
      mediumSeverity: 1,
      lowSeverity: 0,
      todayTransactions: 15,
      todayAmount: 125000,
    },
  },
};

describe("FraudAlerts", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockFetch.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows loading skeleton initially", () => {
    mockFetch.mockImplementationOnce(
      () => new Promise(() => {})
    );
    const { container } = render(<FraudAlerts t={mockT} />);
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders section title after load", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<FraudAlerts t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Güvenlik Uyarıları")).toBeInTheDocument();
    });
  });

  it("renders alert titles", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<FraudAlerts t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Yüksek Tutarlı İşlem")).toBeInTheDocument();
      expect(screen.getByText("Gece Geç Saat İşlemi")).toBeInTheDocument();
    });
  });

  it("renders alert descriptions", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<FraudAlerts t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(
        screen.getByText("50,000 TL tutarında işlem tespit edildi")
      ).toBeInTheDocument();
    });
  });

  it("shows error state on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<FraudAlerts t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Bağlantı hatası")).toBeInTheDocument();
    });
  });

  it("shows error state when success is false", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, error: "API hatası" }),
    });

    render(<FraudAlerts t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("API hatası")).toBeInTheDocument();
    });
  });

  it("shows summary severity counts", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<FraudAlerts t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      const highCounts = screen.getAllByText("1");
      expect(highCounts.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows empty state when no alerts", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          alerts: [],
          summary: {
            totalAlerts: 0,
            highSeverity: 0,
            mediumSeverity: 0,
            lowSeverity: 0,
            todayTransactions: 0,
            todayAmount: 0,
          },
        },
      }),
    });

    render(<FraudAlerts t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Güvendesiniz")).toBeInTheDocument();
    });
  });

  it("shows alert count badge when alerts exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<FraudAlerts t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("fetches from correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<FraudAlerts t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/fraud-detection");
    });
  });
});
