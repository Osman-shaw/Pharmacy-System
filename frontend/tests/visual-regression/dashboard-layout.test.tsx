import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DashboardLayout } from "../../components/dashboard-layout";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/dashboard",
}));

jest.mock("@/lib/logout", () => ({
  logout: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/components/notification-provider", () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  NotificationBell: () => null,
}));

describe("Dashboard Layout Visual Regression", () => {
  it("matches the previous snapshot", () => {
    const { container } = render(
      <DashboardLayout userRole="admin" userName="Test User">
        <main>Page content</main>
      </DashboardLayout>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
