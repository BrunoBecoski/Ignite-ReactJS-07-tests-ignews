import { fireEvent, render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { signIn, signOut, useSession } from 'next-auth/client';
import { SignInButton } from '.';

jest.mock('next-auth/client');

describe('SignInButton component', () => {
  it('renders correctly when user is not authenticated', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<SignInButton />)

    expect(screen.getByText('Sign in with Github')).toBeInTheDocument()
  });

  it('redirect user to sign in with github', () => {
    const useSessionMocked = mocked(useSession)
    const signInMocked = mocked(signIn)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<SignInButton />)
  
    const signInButton = screen.getByText('Sign in with Github')

    fireEvent.click(signInButton)

    expect(signInMocked).toHaveBeenCalledWith('github')
  });  

  it('renders correctly when use is authenticated', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([  
      { user: { name: 'John Doe', email: 'john.doe@example.com' }, expires: 'fake-expires' }, 
      false
    ])

    render(<SignInButton />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  });
  
  it('sign out user', () => {
    const useSessionMocked = mocked(useSession)
    const signOutMocked = mocked(signOut)

    useSessionMocked.mockReturnValueOnce([
      { user: { name: 'John Doe', email: 'john.doe@example.com' }, expires: 'fake-expires' }, 
      false
    ])

    render(<SignInButton />)

    const signOutButton = screen.getByText('John Doe')

    fireEvent.click(signOutButton)

    expect(signOutMocked).toHaveBeenCalled()
  });
});