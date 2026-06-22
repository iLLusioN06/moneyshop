import { render, screen, fireEvent } from "@testing-library/react";
import { Modal, ModalFooter } from "../modal";

describe("Modal", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("does not render when open is false", () => {
    render(
      <Modal open={false} onClose={jest.fn()}>
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders when open is true", () => {
    render(
      <Modal open={true} onClose={jest.fn()}>
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(
      <Modal open={true} onClose={jest.fn()} title="Modal Title">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText("Modal Title")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <Modal open={true} onClose={jest.fn()} description="Modal description">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText("Modal description")).toBeInTheDocument();
  });

  it("renders close button", () => {
    render(
      <Modal open={true} onClose={jest.fn()}>
        <p>Content</p>
      </Modal>
    );
    const closeButton = document.querySelector("button");
    expect(closeButton).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    const buttons = screen.getByRole("button");
    fireEvent.click(buttons);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = jest.fn();
    const { container } = render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    // Backdrop has bg-black/50 class, wrapper has z-50
    const backdrop = container.querySelector('[class*="bg-black/50"]');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on Escape key press", () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("sets body overflow to hidden when open", () => {
    render(
      <Modal open={true} onClose={jest.fn()}>
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body overflow on unmount", () => {
    const { unmount } = render(
      <Modal open={true} onClose={jest.fn()}>
        <p>Content</p>
      </Modal>
    );
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("applies sm size class", () => {
    const { container } = render(
      <Modal open={true} onClose={jest.fn()} size="sm">
        <p>Content</p>
      </Modal>
    );
    const modalContent = container.querySelector("[class*='max-w-sm']");
    expect(modalContent).toBeInTheDocument();
  });

  it("applies md size class by default", () => {
    const { container } = render(
      <Modal open={true} onClose={jest.fn()}>
        <p>Content</p>
      </Modal>
    );
    const modalContent = container.querySelector("[class*='max-w-md']");
    expect(modalContent).toBeInTheDocument();
  });

  it("applies lg size class", () => {
    const { container } = render(
      <Modal open={true} onClose={jest.fn()} size="lg">
        <p>Content</p>
      </Modal>
    );
    const modalContent = container.querySelector("[class*='max-w-lg']");
    expect(modalContent).toBeInTheDocument();
  });

  it("applies xl size class", () => {
    const { container } = render(
      <Modal open={true} onClose={jest.fn()} size="xl">
        <p>Content</p>
      </Modal>
    );
    const modalContent = container.querySelector("[class*='max-w-xl']");
    expect(modalContent).toBeInTheDocument();
  });

  it("does not call onClose on non-Escape key press", () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("ModalFooter", () => {
  it("renders children", () => {
    render(<ModalFooter>Footer</ModalFooter>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("has flex and justify-end classes", () => {
    const { container } = render(<ModalFooter>Footer</ModalFooter>);
    const footer = container.firstChild as HTMLElement;
    expect(footer.className).toContain("flex");
    expect(footer.className).toContain("justify-end");
  });

  it("has border-top", () => {
    const { container } = render(<ModalFooter>Footer</ModalFooter>);
    const footer = container.firstChild as HTMLElement;
    expect(footer.className).toContain("border-t");
  });
});
