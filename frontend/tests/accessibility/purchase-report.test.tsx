import React from "react";
import { axe, toHaveNoViolations } from "jest-axe";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PurchaseReport } from "../../components/purchase-report";

expect.extend(toHaveNoViolations);

jest.mock("@/lib/purchasesApi", () => ({
  getPurchases: jest.fn().mockResolvedValue({ data: [] }),
}));

describe("Purchase Report Accessibility Test", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<PurchaseReport />);
    await waitFor(() => {
      expect(container.querySelector("[role='combobox']")).toBeInTheDocument();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
