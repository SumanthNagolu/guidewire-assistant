/**
 * Admin Portal - Authentication Flow Integration Tests
 * Tests complete authentication journey from login to logout
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createMockSupabaseClient } from '@/__tests__/utils/supabase-mock';
import AdminLoginForm from '@/components/admin/auth/AdminLoginForm';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

describe('Admin Authentication Flow', () => {
  let mockRouter: any;
  let mockSupabase: any;
  
  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
      refresh: jest.fn(),
    };
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    mockSupabase = createMockSupabaseClient();
    require('@/lib/supabase/client').createClient.mockReturnValue(mockSupabase);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Successful Login', () => {
    it('should log in admin user and redirect to dashboard', async () => {
      // Mock successful authentication
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'admin@test.com' },
          session: { access_token: 'token-123' },
        },
        error: null,
      });
      
      // Mock admin role verification
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'admin', first_name: 'Test', last_name: 'Admin' },
          error: null,
        }),
      });
      
      render(<AdminLoginForm />);
      
      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'test12345' } });
      fireEvent.click(submitButton);
      
      // Wait for authentication
      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'admin@test.com',
          password: 'test12345',
        });
      });
      
      // Verify role check was performed
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
      });
      
      // Verify redirect to admin dashboard
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/admin');
      });
    });
    
    it('should redirect to original destination after login', async () => {
      // Mock searchParams with redirectTo
      const mockSearchParams = {
        get: jest.fn((key) => key === 'redirectTo' ? '/admin/blog' : null),
      };
      
      require('next/navigation').useSearchParams.mockReturnValue(mockSearchParams);
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'admin@test.com' },
          session: { access_token: 'token-123' },
        },
        error: null,
      });
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      });
      
      render(<AdminLoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'test12345' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/blog');
      });
    });
  });
  
  describe('Failed Login', () => {
    it('should show error for invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });
      
      render(<AdminLoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });
    
    it('should prevent non-admin users from logging in', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'student@test.com' },
          session: { access_token: 'token-123' },
        },
        error: null,
      });
      
      // Mock non-admin role
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'student' },
          error: null,
        }),
      });
      
      // Mock signOut for non-admin
      mockSupabase.auth.signOut = jest.fn().mockResolvedValue({ error: null });
      
      render(<AdminLoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'student@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'test12345' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.getByText(/admin access required/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Form Validation', () => {
    it('should validate email format', async () => {
      render(<AdminLoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });
    
    it('should validate password length', async () => {
      render(<AdminLoginForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.blur(passwordInput);
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });
    
    it('should disable submit button when form invalid', () => {
      render(<AdminLoginForm />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeDisabled();
    });
  });
  
  describe('Loading States', () => {
    it('should show loading state during authentication', async () => {
      mockSupabase.auth.signInWithPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: { user: null, session: null },
          error: null,
        }), 1000))
      );
      
      render(<AdminLoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'test12345' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });
      
      expect(submitButton).toBeDisabled();
    });
  });
});

