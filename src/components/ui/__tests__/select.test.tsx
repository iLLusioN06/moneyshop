import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "../select";

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

const options = [
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية", disabled: true },
];

describe("Select", () => {
  it("renders all options", () => {
    render(<Select options={options} />);
    expect(screen.getByText("Türkçe")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("العربية")).toBeInTheDocument();
  });

  it("renders placeholder when provided", () => {
    render(<Select options={options} placeholder="Seçiniz" />);
    expect(screen.getByText("Seçiniz")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Select options={options} label="Dil" />);
    expect(screen.getByText("Dil")).toBeInTheDocument();
  });

  it("associates label with select via htmlFor", () => {
    render(<Select options={options} label="Dil" id="lang" />);
    expect(screen.getByText("Dil")).toHaveAttribute("for", "lang");
  });

  it("renders error message when error prop is provided", () => {
    render(<Select options={options} error="Bu alan zorunludur" />);
    const errorEl = screen.getByText("Bu alan zorunludur");
    expect(errorEl).toBeInTheDocument();
    expect(errorEl.className).toContain("text-danger");
  });

  it("calls onChange handler", () => {
    const onChange = jest.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "en" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("disables select when disabled", () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("applies sm size", () => {
    render(<Select options={options} size="sm" />);
    expect(screen.getByRole("combobox").className).toContain("h-8");
  });

  it("applies md size by default", () => {
    render(<Select options={options} />);
    expect(screen.getByRole("combobox").className).toContain("h-10");
  });

  it("applies lg size", () => {
    render(<Select options={options} size="lg" />);
    expect(screen.getByRole("combobox").className).toContain("h-12");
  });

  it("has combobox role", () => {
    render(<Select options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("applies error styling", () => {
    render(<Select options={options} error="Hata" />);
    expect(screen.getByRole("combobox").className).toContain("border-danger");
  });
});
