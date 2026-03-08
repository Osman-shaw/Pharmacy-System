import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { InventoryReport } from "../../components/inventory-report";

describe("Inventory Report Responsiveness", () => {
  const emptyData = { lowStockMedicines: [], expiringMedicines: [] };

  it("renders correctly on mobile screens", () => {
    render(<InventoryReport {...emptyData} />);
    expect(screen.getByText("Critical Stock")).toBeInTheDocument();
    expect(screen.getByText("Stock Levels")).toBeInTheDocument();
  });

  it("renders correctly on desktop screens", () => {
    render(<InventoryReport {...emptyData} />);
    expect(screen.getByText("Critical Stock")).toBeInTheDocument();
    expect(screen.getByText("Stock Levels")).toBeInTheDocument();
  });
});
