import { render, screen, fireEvent } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { SubscribeButton } from '.';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';

jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('../../services/api');
jest.mock('../../services/stripe-js');

describe('SubscribeButton component', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValue([null, false])

    render(<SubscribeButton />)

    expect(screen.getByText('Subscribe now')).toBeInTheDocument();
  });

  it('redirects user to sign in when not authenticated', () => {
    const signInMocked = mocked(signIn);
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValue([null, false])

    render(<SubscribeButton />)
    
    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton)

    expect(signInMocked).toHaveBeenCalled()
  });

  it('redirects to posts when user already has a subscription', () => {
    const useRouterMocked = mocked(useRouter)
    const useSessionMocked = mocked(useSession)
    const pushMock = jest.fn()

    useSessionMocked.mockReturnValueOnce([
      { 
        user: { 
          name: 'John Doe', 
          email: 'john.doe@example.com'
        }, 
        activeSubscription: 'fake-active-subscription',
        expires: 'fake-expires'
      },
      false
    ])

    useRouterMocked.mockReturnValueOnce({
      push: pushMock
    } as any)

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton)

    expect(pushMock).toHaveBeenCalledWith('/posts');
  });
  
  it('redirect user to stripe', async () => {
    const useSessionMocked = mocked(useSession);
    const apiPostMocked = mocked(api.post);
    const getStripeJsMocked = mocked(getStripeJs);

    const redirectToCheckoutMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      {
        user: {
          name: 'John Doe', 
          email: 'john.doe@example.com'
        },
      },
      false
    ])

    apiPostMocked.mockResolvedValueOnce({ 
      data: { 
        sessionId: 'fake-session-id'
      }
    });

    getStripeJsMocked.mockResolvedValueOnce({
      redirectToCheckout: redirectToCheckoutMock,
    } as any);

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton)

    setTimeout(() => {
      expect(redirectToCheckoutMock).toHaveBeenCalled();
    }, 1000);
  });


  it('error when redirect user to stripe', () => {
    const useSessionMocked = mocked(useSession);

    const windowAlertMock = jest.fn();

    window.alert = windowAlertMock;

    useSessionMocked.mockReturnValueOnce([
      {
        user: {
          name: 'John Doe', 
          email: 'john.doe@example.com'
        },
      },
      false
    ])

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton)

    setTimeout(() => {
      expect(windowAlertMock).toHaveBeenCalled()
    }, 1000);
  });
});