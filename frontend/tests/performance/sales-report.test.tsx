import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdvancedSalesReport } from "../../components/advanced-sales-report";

jest.mock("@/lib/salesApi", () => ({
  getSales: jest.fn().mockResolvedValue({ data: [] }),
}));

describe("Sales Report Performance Test", () => {
  it("loads within acceptable time", async () => {
    const start = performance.now();

    render(<AdvancedSalesReport />);

    await waitFor(
      () => {
        expect(screen.getByText(/report period|sales summary|generate report/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});
