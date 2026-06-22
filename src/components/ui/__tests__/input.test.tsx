import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../input";

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

describe("Input", () => {
  it("renders input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Input label="E-posta" />);
    expect(screen.getByText("E-posta")).toBeInTheDocument();
  });

  it("associates label with input via htmlFor", () => {
    render(<Input label="E-posta" id="email" />);
    const label = screen.getByText("E-posta");
    expect(label).toHaveAttribute("for", "email");
  });

  it("renders error message when error prop is provided", () => {
    render(<Input error="Bu alan zorunludur" />);
    expect(screen.getByText("Bu alan zorunludur")).toBeInTheDocument();
  });

  it("applies error styles to input", () => {
    render(<Input error="Hata" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-danger");
  });

  it("renders icon when provided", () => {
    render(<Input icon={<span data-testid="test-icon">🔍</span>} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies pl-10 class when icon is present", () => {
    render(<Input icon={<span>🔍</span>} />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("pl-10");
  });

  it("calls onChange handler", () => {
    const onChange = jest.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("disables input when disabled prop is true", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("forwards ref", () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it("applies placeholder", () => {
    render(<Input placeholder="Adınızı girin" />);
    expect(screen.getByPlaceholderText("Adınızı girin")).toBeInTheDocument();
  });

  it("generates id when not provided", () => {
    render(<Input label="Test" />);
    const input = screen.getByRole("textbox");
    expect(input.id).toBeTruthy();
  });

  it("hides error when error prop is removed", () => {
    const { rerender } = render(<Input error="Hata" />);
    expect(screen.getByText("Hata")).toBeInTheDocument();

    rerender(<Input />);
    expect(screen.queryByText("Hata")).not.toBeInTheDocument();
  });
});
