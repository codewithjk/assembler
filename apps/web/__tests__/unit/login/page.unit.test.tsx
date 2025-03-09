import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/[[...login]]/page';
import '@testing-library/jest-dom'
import {
    ClerkProvider
  } from '@clerk/nextjs'

// Mock the Clerk SignIn component
jest.mock('@clerk/nextjs', () => ({
  SignIn: jest.fn(() => <div>Mocked SignIn Component</div>),
  ClerkProvider: ({ children }: any) => <div>{children}</div>,
  RedirectToSignIn: jest.fn(() => <div>RedirectToSignIn Mocked</div>),
}));

describe('LoginPage', () => {
  it('should render login component', () => {
    render(
      <ClerkProvider>
        <LoginPage />
      </ClerkProvider>
    );
    expect(screen.getByText(/Mocked SignIn Component/)).toBeInTheDocument();
  });
});
