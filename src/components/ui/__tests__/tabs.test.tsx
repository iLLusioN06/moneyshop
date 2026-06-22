import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabPanel } from "../tabs";

const mockTabs = [
  { key: "tab1", label: "Sekme 1" },
  { key: "tab2", label: "Sekme 2" },
  { key: "tab3", label: "Sekme 3", disabled: true },
];

describe("Tabs", () => {
  it("renders all tabs", () => {
    render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={jest.fn()} />);
    expect(screen.getByText("Sekme 1")).toBeInTheDocument();
    expect(screen.getByText("Sekme 2")).toBeInTheDocument();
    expect(screen.getByText("Sekme 3")).toBeInTheDocument();
  });

  it("has role tablist", () => {
    const { container } = render(
      <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={jest.fn()} />
    );
    expect(container.firstChild).toHaveAttribute("role", "tablist");
  });

  it("marks active tab as selected", () => {
    render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={jest.fn()} />);
    const activeTab = screen.getByText("Sekme 1");
    expect(activeTab).toHaveAttribute("aria-selected", "true");
  });

  it("marks inactive tab as not selected", () => {
    render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={jest.fn()} />);
    const inactiveTab = screen.getByText("Sekme 2");
    expect(inactiveTab).toHaveAttribute("aria-selected", "false");
  });

  it("calls onTabChange when tab is clicked", () => {
    const onTabChange = jest.fn();
    render(
      <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={onTabChange} />
    );
    fireEvent.click(screen.getByText("Sekme 2"));
    expect(onTabChange).toHaveBeenCalledWith("tab2");
  });

  it("disables tab when disabled prop is true", () => {
    render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={jest.fn()} />);
    const disabledTab = screen.getByText("Sekme 3");
    expect(disabledTab).toBeDisabled();
  });

  it("applies sm size", () => {
    render(
      <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={jest.fn()} size="sm" />
    );
    const tab = screen.getByText("Sekme 1");
    expect(tab.className).toContain("text-xs");
  });

  it("applies md size by default", () => {
    render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={jest.fn()} />);
    const tab = screen.getByText("Sekme 1");
    expect(tab.className).toContain("text-sm");
  });

  it("applies lg size", () => {
    render(
      <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={jest.fn()} size="lg" />
    );
    const tab = screen.getByText("Sekme 1");
    expect(tab.className).toContain("text-base");
  });

  it("renders with icons", () => {
    const tabsWithIcons = [
      { key: "tab1", label: "Home", icon: <span data-testid="icon">🏠</span> },
    ];
    render(
      <Tabs tabs={tabsWithIcons} activeTab="tab1" onTabChange={jest.fn()} />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={jest.fn()} className="extra-class" />
    );
    expect(container.firstChild?.className).toContain("extra-class");
  });
});

describe("TabPanel", () => {
  it("renders children when activeKey matches tabKey", () => {
    render(
      <TabPanel activeKey="tab1" tabKey="tab1">
        <p>Panel content</p>
      </TabPanel>
    );
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("does not render children when activeKey does not match tabKey", () => {
    render(
      <TabPanel activeKey="tab2" tabKey="tab1">
        <p>Panel content</p>
      </TabPanel>
    );
    expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
  });

  it("has role tabpanel", () => {
    render(
      <TabPanel activeKey="tab1" tabKey="tab1">
        <p>Content</p>
      </TabPanel>
    );
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });
});
