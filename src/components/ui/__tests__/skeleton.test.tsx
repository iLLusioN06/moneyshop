import { render, screen } from "@testing-library/react";
import { Skeleton, CardSkeleton, TableSkeleton } from "../skeleton";

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

describe("Skeleton", () => {
  it("renders with text variant by default", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("h-4 w-full");
  });

  it("renders with circular variant", () => {
    const { container } = render(<Skeleton variant="circular" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("rounded-full");
  });

  it("renders with rectangular variant", () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("rounded-md");
  });

  it("renders with card variant", () => {
    const { container } = render(<Skeleton variant="card" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("h-32");
  });

  it("has animate-pulse class", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("animate-pulse");
  });

  it("applies additional className", () => {
    const { container } = render(<Skeleton className="extra-class" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("extra-class");
  });
});

describe("CardSkeleton", () => {
  it("renders multiple skeleton elements", () => {
    const { container } = render(<CardSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("has card-like container", () => {
    const { container } = render(<CardSkeleton />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("rounded-xl");
    expect(wrapper.className).toContain("border");
  });
});

describe("TableSkeleton", () => {
  it("renders default 5 rows", () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.querySelectorAll("div[class*='flex']");
    expect(rows.length).toBe(5);
  });

  it("renders custom row count", () => {
    const { container } = render(<TableSkeleton rows={3} />);
    const rows = container.querySelectorAll("div[class*='flex']");
    expect(rows.length).toBe(3);
  });

  it("renders skeleton placeholders in each row", () => {
    const { container } = render(<TableSkeleton rows={2} />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(8); // 2 rows × 4 skeletons
  });
});
