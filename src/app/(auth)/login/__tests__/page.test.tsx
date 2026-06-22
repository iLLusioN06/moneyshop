import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../page";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockSignIn = jest.fn();
const mockGetSession = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

jest.mock("@/lib/constants", () => ({
  APP_NAME: "MoneyShop",
  ROUTES: { REGISTER: "/register" },
}));

jest.mock("lucide-react", () => ({
  Eye: () => <svg data-testid="icon-eye" />,
  EyeOff: () => <svg data-testid="icon-eye-off" />,
  Mail: () => <svg data-testid="icon-mail" />,
  Lock: () => <svg data-testid="icon-lock" />,
}));

jest.mock("@/components/ui", () => ({
  Button: ({ children, type, isLoading, ...props }: Record<string, unknown>) => (
    <button
      type={(type as string) || "button"}
      disabled={!!isLoading}
      data-testid="submit-btn"
      {...props}
    >
      {children as React.ReactNode}
    </button>
  ),
  Input: ({
    label,
    type,
    placeholder,
    value,
    onChange,
    icon,
    ...props
  }: Record<string, unknown>) => (
    <div>
      {label && <label>{label as string}</label>}
      <input
        data-testid={`input-${label as string}`}
        type={(type as string) || "text"}
        placeholder={placeholder as string}
        value={value as string}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        {...props}
      />
      {icon && <span data-testid="input-icon">{icon as React.ReactNode}</span>}
    </div>
  ),
  Card: ({ children }: Record<string, unknown>) => (
    <div data-testid="card">{children as React.ReactNode}</div>
  ),
  CardContent: ({ children }: Record<string, unknown>) => (
    <div data-testid="card-content">{children as React.ReactNode}</div>
  ),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  const fillForm = (email: string, password: string) => {
    fireEvent.change(screen.getByTestId("input-E-posta / Kullanıcı Adı"), {
      target: { value: email },
    });
    fireEvent.change(screen.getByTestId("input-Parola"), {
      target: { value: password },
    });
  };

  const clickSubmit = () => {
    fireEvent.click(screen.getByTestId("submit-btn"));
  };

  it("renders login form", () => {
    render(<LoginPage />);

    expect(
      screen.getByTestId("input-E-posta / Kullanıcı Adı")
    ).toBeInTheDocument();
    expect(screen.getByTestId("input-Parola")).toBeInTheDocument();
    expect(screen.getByTestId("submit-btn")).toBeInTheDocument();
  });

  it("renders logo and title", () => {
    render(<LoginPage />);

    expect(screen.getByText("MoneyShop")).toBeInTheDocument();
    expect(screen.getByText("Hesabınıza giriş yapın")).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<LoginPage />);

    const passwordInput = screen.getByTestId("input-Parola");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByTestId("icon-eye").closest("button")!;
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByTestId("icon-eye-off")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-eye")).not.toBeInTheDocument();
  });

  it("shows error on empty submit", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Kullanıcı adı veya şifre hatalı." }),
    });

    render(<LoginPage />);
    const form = screen.getByTestId("submit-btn").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText("Kullanıcı adı veya şifre hatalı.")
      ).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/auth/2fa/init-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: "" }),
    });
  });

  it("shows error when init-login fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Kullanıcı adı veya şifre hatalı." }),
    });

    render(<LoginPage />);
    fillForm("test@test.com", "wrongpassword");
    clickSubmit();

    await waitFor(() => {
      expect(
        screen.getByText("Kullanıcı adı veya şifre hatalı.")
      ).toBeInTheDocument();
    });
  });

  it("redirects to 2FA when twoFactorRequired is true", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        twoFactorRequired: true,
        pendingToken: "pending-token-123",
        method: "app",
      }),
    });

    render(<LoginPage />);
    fillForm("test@test.com", "password");
    clickSubmit();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/verify-2fa?token=pending-token-123&method=app"
      );
    });
  });

  it("calls signIn when no 2FA", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ twoFactorRequired: false }),
    });
    mockSignIn.mockResolvedValueOnce({});
    mockGetSession.mockResolvedValueOnce({ user: { role: "USER" } });

    render(<LoginPage />);
    fillForm("user@test.com", "password123");
    clickSubmit();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "user@test.com",
        password: "password123",
        redirect: false,
      });
    });
  });

  it("shows generic error on signIn failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ twoFactorRequired: false }),
    });
    mockSignIn.mockResolvedValueOnce({ error: "Invalid credentials" });

    render(<LoginPage />);
    fillForm("test@test.com", "wrong");
    clickSubmit();

    await waitFor(() => {
      expect(
        screen.getByText("Kullanıcı adı veya şifre hatalı.")
      ).toBeInTheDocument();
    });
  });

  it("redirects to dashboard for regular user", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ twoFactorRequired: false }),
    });
    mockSignIn.mockResolvedValueOnce({});
    mockGetSession.mockResolvedValueOnce({ user: { role: "USER" } });

    render(<LoginPage />);
    fillForm("user@test.com", "password");
    clickSubmit();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects to admin for admin user", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ twoFactorRequired: false }),
    });
    mockSignIn.mockResolvedValueOnce({});
    mockGetSession.mockResolvedValueOnce({ user: { role: "ADMIN" } });

    render(<LoginPage />);
    fillForm("admin@test.com", "admin123");
    clickSubmit();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });

  it("shows forgot password link", () => {
    render(<LoginPage />);

    const forgotLink = screen.getByText("Parolamı unuttum");
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink.closest("a")).toHaveAttribute("href", "/forgot-password");
  });

  it("shows register link", () => {
    render(<LoginPage />);

    const registerLink = screen.getByText("Kayıt Ol");
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
  });

  it("shows remember me checkbox", () => {
    render(<LoginPage />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText("Beni hatırla")).toBeInTheDocument();
  });
});
