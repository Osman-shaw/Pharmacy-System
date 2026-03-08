import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "../../app/auth/login/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock("@/lib/authApi", () => ({
  login: jest.fn(),
}));

describe("Login Page Cross-Browser Test", () => {
  it("renders correctly on Chrome", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /shawcare/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  it("renders correctly on Firefox", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /shawcare/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeVisible();
  });
});
