import { canAccessRoute, getAccessibleNavItems, ADMIN_ROUTES } from "@/lib/permissions";

describe("canAccessRoute", () => {
  it("should deny access when role is undefined", () => {
    expect(canAccessRoute(undefined, "/dashboard")).toBe(false);
  });

  it("should deny access when role is null", () => {
    expect(canAccessRoute(null, "/dashboard")).toBe(false);
  });

  it("should allow ADMIN to access all routes", () => {
    expect(canAccessRoute("ADMIN", "/dashboard")).toBe(true);
    expect(canAccessRoute("ADMIN", "/admin")).toBe(true);
    expect(canAccessRoute("ADMIN", "/admin/users")).toBe(true);
    expect(canAccessRoute("ADMIN", "/settings")).toBe(true);
  });

  it("should allow USER to access public routes", () => {
    expect(canAccessRoute("USER", "/dashboard")).toBe(true);
    expect(canAccessRoute("USER", "/accounts")).toBe(true);
    expect(canAccessRoute("USER", "/transactions")).toBe(true);
  });

  it("should deny USER access to admin routes", () => {
    expect(canAccessRoute("USER", "/admin")).toBe(false);
    expect(canAccessRoute("USER", "/admin/users")).toBe(false);
    expect(canAccessRoute("USER", "/settings")).toBe(false);
  });

  it("should deny MODERATOR access to admin routes", () => {
    expect(canAccessRoute("MODERATOR", "/admin")).toBe(false);
    expect(canAccessRoute("MODERATOR", "/admin/users")).toBe(false);
  });
});

describe("getAccessibleNavItems", () => {
  const allItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin", label: "Admin" },
    { href: "/accounts", label: "Accounts" },
    { href: "/settings", label: "Settings" },
  ];

  it("should return all items for ADMIN", () => {
    const result = getAccessibleNavItems("ADMIN", allItems);
    expect(result).toHaveLength(4);
  });

  it("should filter items for USER", () => {
    const result = getAccessibleNavItems("USER", allItems);
    expect(result.every((item) => !ADMIN_ROUTES.some((r) => item.href.startsWith(r)))).toBe(true);
  });
});
