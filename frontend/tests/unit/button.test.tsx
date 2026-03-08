import { render, screen } from "@testing-library/react";
// 1. IMPORTANT: This provides the .toBeInTheDocument() matcher
import "@testing-library/jest-dom"; 
import { Button } from "../../components/ui/button";

describe("Button Component", () => {
  it("renders the button with the correct text", () => {
    // 2. Render the component
    render(<Button>Click Me</Button>);
    
    // 3. Use getByRole for better accessibility-based testing
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    
    // 4. Assert it exists
    expect(buttonElement).toBeInTheDocument();
  });
});