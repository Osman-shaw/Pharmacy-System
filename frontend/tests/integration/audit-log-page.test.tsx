import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuditLogPage from "../../app/dashboard/audit/page";

const mockToast = jest.fn();
(global as unknown as { toast: typeof mockToast }).toast = mockToast;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/dashboard/audit",
}));

jest.mock("@/lib/auditApi", () => ({
  getAuditLogs: jest.fn(),
}));

jest.mock("@/lib/dashboardApi", () => ({
  getProfile: jest.fn(),
  getNotificationData: jest.fn().mockResolvedValue({
    expiring: [],
    lowStock: [],
    outOfStock: [],
  }),
}));

jest.mock("@/utils/logger", () => ({
  logDebug: jest.fn(),
}));

const { getAuditLogs } = require("@/lib/auditApi");
const { getProfile } = require("@/lib/dashboardApi");

describe("AuditLogPage Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = "token=test-token";
    (getProfile as jest.Mock).mockResolvedValue({
      role: "admin",
      fullName: "Test User",
    });
    (getAuditLogs as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: "1",
          timestamp: new Date().toISOString(),
          username: "user1",
          action: "LOGIN",
          resource: "auth",
          details: "User logged in",
          ipAddress: "127.0.0.1",
        },
      ],
    });
  });

  it("renders audit logs correctly", async () => {
    render(<AuditLogPage />);

    await waitFor(
      () => {
        expect(getProfile).toHaveBeenCalled();
        expect(getAuditLogs).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    const heading = await screen.findByRole("heading", { name: /audit trails/i }, { timeout: 3000 });
    expect(heading).toBeInTheDocument();
  });
});
