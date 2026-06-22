import { render, screen, waitFor } from "@testing-library/react";
import HealthScore from "../health-score";

jest.mock("lucide-react", () => ({
  Heart: () => <div data-testid="icon-heart" />,
  TrendingUp: () => <div data-testid="icon-trending-up" />,
  Shield: () => <div data-testid="icon-shield" />,
  Clock: () => <div data-testid="icon-clock" />,
  Layers: () => <div data-testid="icon-layers" />,
  AlertCircle: () => <div data-testid="icon-alert-circle" />,
  CheckCircle2: () => <div data-testid="icon-check-circle" />,
  Lightbulb: () => <div data-testid="icon-lightbulb" />,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    "health.title": "Finansal Sağlık",
    "health.subtitle": "Genel değerlendirme",
    "health.savingsRate": "Tasarruf Oranı",
    "health.budgetAdherence": "Bütçe Uyumu",
    "health.emergencyFund": "Acil Durum Fonu",
    "health.consistency": "İşlem Tutarlılığı",
    "health.months": "ay",
    "health.days": "gün",
    "health.tips": "Öneriler",
    "health.error": "Veri alınamadı",
  };
  return translations[key] || key;
};

const mockSuccessData = {
  success: true,
  data: {
    overall: 72,
    breakdown: {
      savingsRate: { score: 65, value: 15, label: "Orta" },
      budgetAdherence: { score: 80, value: 90, label: "İyi" },
      emergencyFund: { score: 45, value: 3.5, label: "Zayıf" },
      transactionConsistency: { score: 90, value: 28, label: "Mükemmel" },
      accountDiversity: { score: 60, value: 4, label: "Orta" },
    },
    tips: ["Acil durum fonu oluşturun", "Tasarruf oranınızı artırın"],
  },
};

describe("HealthScore", () => {
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
    const { container } = render(<HealthScore t={mockT} />);
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders overall score after successful fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<HealthScore t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      const scores = screen.getAllByText("72");
      expect(scores.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders section title", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<HealthScore t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Finansal Sağlık")).toBeInTheDocument();
    });
  });

  it("shows error state on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<HealthScore t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Bağlantı hatası")).toBeInTheDocument();
    });
  });

  it("shows error state when success is false", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, error: "Özel hata" }),
    });

    render(<HealthScore t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Özel hata")).toBeInTheDocument();
    });
  });

  it("renders breakdown labels", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<HealthScore t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Tasarruf Oranı")).toBeInTheDocument();
      expect(screen.getByText("Bütçe Uyumu")).toBeInTheDocument();
    });
  });

  it("renders tips when available", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<HealthScore t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Acil durum fonu oluşturun")).toBeInTheDocument();
    });
  });

  it("renders /100 label next to score", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<HealthScore t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("/100")).toBeInTheDocument();
    });
  });

  it("fetches from /api/financial-health endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    render(<HealthScore t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/financial-health");
    });
  });

  it("renders breakdown score bars", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });

    const { container } = render(<HealthScore t={mockT} />);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      const bars = container.querySelectorAll("[style*='width']");
      expect(bars.length).toBeGreaterThan(0);
    });
  });
});
