import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../card";

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | boolean | undefined | null)[]) =>
    inputs.filter(Boolean).join(" "),
}));

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies default variant", () => {
    render(<Card>Default</Card>);
    const card = screen.getByText("Default");
    expect(card.className).toContain("bg-surface");
    expect(card.className).toContain("shadow-sm");
  });

  it("applies gradient variant", () => {
    render(<Card variant="gradient">Gradient</Card>);
    const card = screen.getByText("Gradient");
    expect(card.className).toContain("bg-gradient-to-br");
    expect(card.className).toContain("text-white");
  });

  it("applies bordered variant", () => {
    render(<Card variant="bordered">Bordered</Card>);
    const card = screen.getByText("Bordered");
    expect(card.className).toContain("border-2");
  });

  it("applies rounded-xl", () => {
    render(<Card>Rounded</Card>);
    expect(screen.getByText("Rounded").className).toContain("rounded-xl");
  });

  it("applies additional className", () => {
    render(<Card className="extra-class">Extra</Card>);
    expect(screen.getByText("Extra").className).toContain("extra-class");
  });
});

describe("CardHeader", () => {
  it("renders children", () => {
    render(<CardHeader><h3>Header</h3></CardHeader>);
    expect(screen.getByText("Header")).toBeInTheDocument();
  });

  it("applies default padding classes", () => {
    const { container } = render(<CardHeader>Content</CardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header.className).toContain("p-6");
  });
});

describe("CardTitle", () => {
  it("renders as h3", () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText("Title");
    expect(title.tagName).toBe("H3");
  });

  it("applies font-semibold", () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText("Title").className).toContain("font-semibold");
  });
});

describe("CardDescription", () => {
  it("renders text", () => {
    render(<CardDescription>Description</CardDescription>);
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("applies text-muted class", () => {
    render(<CardDescription>Description</CardDescription>);
    expect(screen.getByText("Description").className).toContain("text-text-muted");
  });
});

describe("CardContent", () => {
  it("renders children", () => {
    render(<CardContent>Content</CardContent>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies padding classes", () => {
    const { container } = render(<CardContent>Content</CardContent>);
    const content = container.firstChild as HTMLElement;
    expect(content.className).toContain("p-6");
  });
});

describe("CardFooter", () => {
  it("renders children", () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("applies flex classes", () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    const footer = container.firstChild as HTMLElement;
    expect(footer.className).toContain("flex");
  });
});

describe("Card composition", () => {
  it("renders full card with all subcomponents", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );

    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card description")).toBeInTheDocument();
    expect(screen.getByText("Main content")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});
