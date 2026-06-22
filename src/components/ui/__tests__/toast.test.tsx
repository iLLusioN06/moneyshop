import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToastProvider, useToast, Toast } from "../toast";

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

function TestHarness() {
  const { addToast, removeToast, toasts } = useToast();
  return (
    <div>
      <button onClick={() => addToast("success", "Başarılı")}>Add Success</button>
      <button onClick={() => addToast("error", "Hata oluştu")}>Add Error</button>
      <button onClick={() => addToast("warning", "Uyarı")}>Add Warning</button>
      <button onClick={() => addToast("info", "Bilgi")}>Add Info</button>
      <button onClick={() => toasts[0] && removeToast(toasts[0].id)}>Remove First</button>
      {/* ToastContainer içinde de mesajlar render ediliyor, burada tekrar render etme */}
      <div data-testid="toast-count">{toasts.length}</div>
    </div>
  );
}

describe("ToastProvider and useToast", () => {
  it("throws error when used outside provider", () => {
    expect(() => render(<TestHarness />)).toThrow(
      "useToast must be used within ToastProvider"
    );
  });

  it("renders children", () => {
    render(
      <ToastProvider>
        <div>Child</div>
      </ToastProvider>
    );
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("adds success toast", () => {
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("Add Success"));
    expect(screen.getByTestId("toast-count").textContent).toBe("1");
  });

  it("adds error toast", () => {
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("Add Error"));
    expect(screen.getByTestId("toast-count").textContent).toBe("1");
  });

  it("adds warning toast", () => {
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("Add Warning"));
    expect(screen.getByTestId("toast-count").textContent).toBe("1");
  });

  it("adds info toast", () => {
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("Add Info"));
    expect(screen.getByTestId("toast-count").textContent).toBe("1");
  });

  it("removes toast", () => {
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("Add Success"));
    expect(screen.getByTestId("toast-count").textContent).toBe("1");
    fireEvent.click(screen.getByText("Remove First"));
    expect(screen.getByTestId("toast-count").textContent).toBe("0");
  });

  it("auto-removes toast after duration", () => {
    jest.useFakeTimers();
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("Add Success"));
    expect(screen.getByTestId("toast-count").textContent).toBe("1");

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.getByTestId("toast-count").textContent).toBe("0");
    jest.useRealTimers();
  });
});

describe("Toast component", () => {
  it("renders message", () => {
    render(<Toast type="success" message="Başarılı" onClose={jest.fn()} />);
    expect(screen.getByText("Başarılı")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = jest.fn();
    render(<Toast type="error" message="Hata" onClose={onClose} />);
    const closeBtn = screen.getByRole("button");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
