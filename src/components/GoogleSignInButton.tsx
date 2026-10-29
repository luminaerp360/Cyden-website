import React, { useEffect, useRef, useState } from 'react';
import { GOOGLE_CLIENT_ID } from '../config';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void | Promise<void>;
  onError: (errorMessage: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
}) => {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isGsiLoaded, setIsGsiLoaded] = useState<boolean>(false);
  const [isRendered, setIsRendered] = useState<boolean>(false);

  useEffect(() => {
    // Check if Google script is loaded
    const checkScriptLoaded = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        setIsGsiLoaded(true);
        return true;
      }
      return false;
    };

    if (checkScriptLoaded()) return;

    const interval = setInterval(() => {
      if (checkScriptLoaded()) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isGsiLoaded || !buttonContainerRef.current || !GOOGLE_CLIENT_ID) {
      return;
    }

    try {
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            onSuccess(response.credential);
          } else {
            onError('Google did not return a valid credential.');
          }
        },
        cancel_on_tap_outside: true,
      });

      // Clear any previous button
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
        window.google!.accounts.id.renderButton(buttonContainerRef.current, {
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          logo_alignment: 'center',
          width: 380,
        });
        setIsRendered(true);
      }
    } catch (err) {
      console.error('Failed to initialize Google Sign In', err);
      setIsRendered(false);
    }
  }, [isGsiLoaded, text, onSuccess, onError]);

  const handleFallbackClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      onError(
        'Google Client ID is not configured yet. Please set VITE_GOOGLE_CLIENT_ID in Cyden-website/.env or e-commerce-backend/.env.'
      );
      return;
    }

    if (!isGsiLoaded || !window.google?.accounts?.id) {
      onError('Google Identity Services script is still loading. Please check your internet connection and try again.');
      return;
    }

    try {
      window.google.accounts.id.prompt();
    } catch (err: any) {
      onError(err?.message || 'Failed to open Google Sign-In.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Container where Google Identity Services renders official secure iframe */}
      <div
        ref={buttonContainerRef}
        className={`w-full flex justify-center ${!isRendered || !GOOGLE_CLIENT_ID ? 'hidden' : ''}`}
      />

      {/* Branded fallback button if Google GSI is loading or client ID needs configuration */}
      {(!isRendered || !GOOGLE_CLIENT_ID) && (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={disabled}
          className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700 font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {text === 'signup_with'
              ? 'Sign up with Google'
              : text === 'signin_with'
              ? 'Sign in with Google'
              : 'Continue with Google'}
          </span>
        </button>
      )}
    </div>
  );
};

export default GoogleSignInButton;
