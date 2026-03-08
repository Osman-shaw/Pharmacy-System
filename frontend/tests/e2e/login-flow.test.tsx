import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import LoginPage from "../../app/auth/login/page";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

jest.mock("@/lib/authApi", () => ({
  login: jest.fn(),
}));

const { login } = require("@/lib/authApi");

describe("Login Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (login as jest.Mock).mockResolvedValue({
      data: { token: "test-token" },
    });
  });

  it("allows a user to log in and navigate to the dashboard", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("test@example.com", "password123");
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
