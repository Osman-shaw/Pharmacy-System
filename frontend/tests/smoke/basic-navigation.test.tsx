import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "../../app/auth/login/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("@/lib/authApi", () => ({
  login: jest.fn(),
}));

describe("Smoke Test - Basic Navigation", () => {
  it("loads the login page and shows key content", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /shawcare/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    const signupLink = screen.getByRole("link", { name: /create account/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/auth/signup");
  });
});
