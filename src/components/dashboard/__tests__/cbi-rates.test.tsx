import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CBIRates from "../cbi-rates";

jest.mock("lucide-react", () => ({
  Landmark: () => <div data-testid="icon-landmark" />,
  RefreshCw: () => <div data-testid="icon-refresh" />,
  AlertCircle: () => <div data-testid="icon-alert-circle" />,
  Loader2: () => <div data-testid="icon-loader" />,
  ArrowRightLeft: () => <div data-testid="icon-arrows" />,
  TrendingUp: () => <div data-testid="icon-trending-up" />,
  TrendingDown: () => <div data-testid="icon-trending-down" />,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    "cbi.title": "Merkez Bankası Kurları",
    "cbi.subtitle": "Irak Merkez Bankası döviz kurları",
    "cbi.refresh": "Yenile",
    "cbi.perUSD": "1 USD karşılığı",
    "cbi.lastUpdate": "Son güncelleme",
    "cbi.cached": "Önbellek",
    "cbi.retry": "Tekrar dene",
    "cbi.iqdBasis": "IQD Baz Kuru",
  };
  return translations[key] || key;
};

const mockSuccessData = {
  success: true,
  data: {
    rates: [
      { code: "USD", name: "US Dollar", rate: 1.0, date: "2026-06-19" },
      { code: "EUR", name: "Euro", rate: 0.92, date: "2026-06-19" },
      { code: "TRY", name: "Turkish Lira", rate: 30.25, date: "2026-06-19" },
    ],
    lastUpdate: "2026-06-19T12:00:00Z",
    cached: false,
    iqdBasis: { usdToIqd: 1310, iqdToUsd: 0.000763 },
  },
};

describe("CBIRates", () => {
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
    const { container } = render(<CBIRates t={mockT} />);
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders section title after load", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<CBIRates t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Merkez Bankası Kurları")).toBeInTheDocument();
    });
  });

  it("displays featured currency codes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<CBIRates t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getAllByText("USD").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("EUR").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("displays currency names", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<CBIRates t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Euro")).toBeInTheDocument();
    });
  });

  it("shows error state on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<CBIRates t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Bağlantı hatası")).toBeInTheDocument();
    });
  });

  it("shows retry button on error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<CBIRates t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Tekrar dene")).toBeInTheDocument();
    });
  });

  it("retries fetch when retry clicked", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessData,
      });

    render(<CBIRates t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Tekrar dene")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Tekrar dene"));

    await waitFor(() => {
      expect(screen.getByText("Merkez Bankası Kurları")).toBeInTheDocument();
    });
  });

  it("displays IQD basis section", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<CBIRates t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("IQD Baz Kuru")).toBeInTheDocument();
    });
  });

  it("shows last update time", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<CBIRates t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText(/Son güncelleme/)).toBeInTheDocument();
    });
  });

  it("fetches from correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<CBIRates t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/cbi-rates");
    });
  });
});
