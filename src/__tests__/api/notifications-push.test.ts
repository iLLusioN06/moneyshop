/**
 * API Route Test: /api/notifications/push/register & /api/notifications/push/settings
 * POST   - Push bildirim aboneliği oluştur
 * DELETE - Push bildirim aboneliğini kaldır
 * GET    - Push bildirim ayarlarını getir
 * PUT    - Push bildirim ayarlarını güncelle
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockUpsert = jest.fn();
const mockDeleteMany = jest.fn();
const mockFindUnique = jest.fn();
const mockSettingUpsert = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    pushSubscription: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
    pushNotificationSetting: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      upsert: (...args: unknown[]) => mockSettingUpsert(...args),
    },
  },
}));

import { NextRequest } from "next/server";
import { POST as RegisterPOST, DELETE as RegisterDELETE } from "@/app/api/notifications/push/register/route";
import { GET as SettingsGET, PUT as SettingsPUT } from "@/app/api/notifications/push/settings/route";

describe("POST /api/notifications/push/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers push subscription and returns 200", async () => {
    mockUpsert.mockResolvedValueOnce({ id: "sub-1", endpoint: "https://fcm/test" });
    mockSettingUpsert.mockResolvedValueOnce({});

    const req = new NextRequest("http://localhost:3000/api/notifications/push/register", {
      method: "POST",
      headers: { "user-agent": "Mozilla/5.0" },
      body: JSON.stringify({
        endpoint: "https://fcm/test",
        p256dh: "test-p256dh-key",
        auth: "test-auth-secret",
      }),
    });
    const res = await RegisterPOST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("sub-1");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { endpoint: "https://fcm/test" },
        create: expect.objectContaining({
          userId: "user-1",
          endpoint: "https://fcm/test",
          p256dh: "test-p256dh-key",
          auth: "test-auth-secret",
        }),
      })
    );
  });

  it("returns 400 when endpoint is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/notifications/push/register", {
      method: "POST",
      body: JSON.stringify({ p256dh: "key", auth: "secret" }),
    });
    const res = await RegisterPOST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Eksik");
  });

  it("returns 400 when p256dh is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/notifications/push/register", {
      method: "POST",
      body: JSON.stringify({ endpoint: "https://fcm/test", auth: "secret" }),
    });
    const res = await RegisterPOST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Eksik");
  });

  it("returns 400 when auth is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/notifications/push/register", {
      method: "POST",
      body: JSON.stringify({ endpoint: "https://fcm/test", p256dh: "key" }),
    });
    const res = await RegisterPOST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Eksik");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/notifications/push/register", {
      method: "POST",
      body: JSON.stringify({ endpoint: "https://fcm/test", p256dh: "key", auth: "secret" }),
    });
    const res = await RegisterPOST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Oturum açmanız gerekiyor.");
  });
});

describe("DELETE /api/notifications/push/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("unregisters push subscription and returns 200", async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 1 });

    const req = new NextRequest("http://localhost:3000/api/notifications/push/register", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint: "https://fcm/test" }),
    });
    const res = await RegisterDELETE(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { endpoint: "https://fcm/test", userId: "user-1" },
    });
  });

  it("returns 400 when endpoint is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/notifications/push/register", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await RegisterDELETE(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("endpoint");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/notifications/push/register", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint: "https://fcm/test" }),
    });
    const res = await RegisterDELETE(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Oturum açmanız gerekiyor.");
  });
});

describe("GET /api/notifications/push/settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with existing settings", async () => {
    const mockSettings = {
      id: "set-1", userId: "user-1", enabled: true,
      onTransaction: true, onTransfer: true, onBudgetAlert: true,
      onMonthlyReport: false, onLargeTransaction: true,
    };
    mockFindUnique.mockResolvedValueOnce(mockSettings);

    const req = new NextRequest("http://localhost:3000/api/notifications/push/settings");
    const res = await SettingsGET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.enabled).toBe(true);
  });

  it("returns 200 with defaults when no settings exist", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/notifications/push/settings");
    const res = await SettingsGET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.enabled).toBe(false);
    expect(body.data.onTransaction).toBe(true);
    expect(body.data.onMonthlyReport).toBe(false);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const res = await SettingsGET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Oturum açmanız gerekiyor.");
  });
});

describe("PUT /api/notifications/push/settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates settings and returns 200", async () => {
    const updatedSettings = {
      id: "set-1", userId: "user-1", enabled: false,
      onTransaction: false, onTransfer: true, onBudgetAlert: true,
      onMonthlyReport: true, onLargeTransaction: false,
    };
    mockSettingUpsert.mockResolvedValueOnce(updatedSettings);

    const req = new NextRequest("http://localhost:3000/api/notifications/push/settings", {
      method: "PUT",
      body: JSON.stringify({ enabled: false, onTransaction: false, onMonthlyReport: true, onLargeTransaction: false }),
    });
    const res = await SettingsPUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.enabled).toBe(false);
    expect(mockSettingUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        update: expect.objectContaining({
          enabled: false, onTransaction: false, onMonthlyReport: true, onLargeTransaction: false,
        }),
      })
    );
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/notifications/push/settings", {
      method: "PUT",
      body: JSON.stringify({ enabled: true }),
    });
    const res = await SettingsPUT(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Oturum açmanız gerekiyor.");
  });
});
