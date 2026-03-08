import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NotificationProvider } from "../../components/notification-provider";

jest.mock("@/lib/dashboardApi", () => ({
  getNotificationData: jest.fn().mockResolvedValue({
    expiring: [],
    lowStock: [],
    outOfStock: [],
  }),
}));

describe("NotificationProvider Component", () => {
  it("renders without crashing and renders children", async () => {
    render(
      <NotificationProvider>
        <div>Notification provider child</div>
      </NotificationProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Notification provider child")).toBeInTheDocument();
    });
  });
});