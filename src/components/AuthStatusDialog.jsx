import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

// Centralized configuration for all auth status dialogs
const AUTH_STATUS_CONFIG = {
  PENDING_APPROVAL: {
    title: 'Account Pending Approval',
    message: 'Your account has been created successfully. An administrator must approve your account before you can sign in.',
    helperText: 'Please check back later or contact your institution administrator.',
    icon: (
      <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    theme: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      helperColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
    primaryButton: 'Try Login Again',
    secondaryAction: null,
  },
  BLOCKED: {
    title: 'Account Blocked',
    message: 'Your account has been temporarily blocked by the administrator. Please contact your institution administrator for assistance.',
    helperText: null,
    icon: (
      <svg className="h-6 w-6 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
    theme: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      titleColor: 'text-amber-900',
      messageColor: 'text-amber-800',
      helperColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
    },
    primaryButton: 'Try Login Again',
    secondaryAction: {
      type: 'link',
      label: 'Contact Admin',
      href: 'mailto:admin@institution.edu',
      className: 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50',
    },
  },
  REJECTED: {
    title: 'Account Registration Rejected',
    message: 'Your registration request has been reviewed and rejected. You cannot sign in with this account. Please contact your institution administrator for more information.',
    helperText: 'If you believe this is a mistake, please reach out to your institution.',
    icon: (
      <svg className="h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    theme: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      titleColor: 'text-slate-900',
      messageColor: 'text-slate-700',
      helperColor: 'text-slate-600',
      buttonBg: 'bg-slate-700 hover:bg-slate-800',
    },
    primaryButton: 'Back to Login',
    secondaryAction: null,
  },
  BATCH_INACTIVE: {
    title: 'Batch Currently Inactive',
    message: 'Your batch has been temporarily deactivated by the administrator. You cannot sign in while your batch is inactive.',
    helperText: 'Please contact your institution administrator to re-enable access.',
    icon: (
      <svg className="h-6 w-6 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    theme: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      titleColor: 'text-orange-900',
      messageColor: 'text-orange-800',
      helperColor: 'text-orange-600',
      buttonBg: 'bg-orange-600 hover:bg-orange-700',
    },
    primaryButton: 'Try Login Again',
    secondaryAction: {
      type: 'link',
      label: 'Contact Admin',
      href: 'mailto:admin@institution.edu',
      className: 'bg-white border border-orange-300 text-orange-700 hover:bg-orange-50',
    },
  },
  EMAIL_EXISTS: {
    title: 'Email Already Registered',
    message: 'An account with this email already exists. Please sign in with your existing account or use a different email address.',
    helperText: 'Forgot your password? Use the password recovery option on the login page.',
    icon: (
      <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    theme: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      helperColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
    primaryButton: 'Sign In',
    secondaryAction: {
      type: 'link',
      label: 'Forgot Password?',
      navigateTo: '/forgot-password',
      className: 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50',
    },
  },
};

const AuthStatusDialog = ({ status, onRetry, onNavigate }) => {
  const navigate = useNavigate();
  const config = AUTH_STATUS_CONFIG[status];

  if (!config) {
    console.error(`Unknown auth status: ${status}`);
    return null;
  }

  const handlePrimaryAction = () => {
    if (status === 'EMAIL_EXISTS') {
      navigate('/login');
    } else if (onRetry) {
      onRetry();
    }
  };

  const handleSecondaryAction = () => {
    if (!config.secondaryAction) return;

    if (config.secondaryAction.navigateTo) {
      if (onNavigate) {
        onNavigate(config.secondaryAction.navigateTo);
      } else {
        navigate(config.secondaryAction.navigateTo);
      }
    }
  };

  return (
    <div className={`${config.theme.bg} border ${config.theme.border} rounded-lg p-6 mb-6`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-lg font-medium ${config.theme.titleColor}`}>
            {config.title}
          </h3>
          <div className={`mt-2 text-sm ${config.theme.messageColor}`}>
            <p className="mb-3">
              {config.message}
            </p>
            {config.helperText && (
              <p className={`text-xs ${config.theme.helperColor}`}>
                {config.helperText}
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={handlePrimaryAction}
              className={`${config.theme.buttonBg} text-white px-4 py-2 text-sm`}
            >
              {config.primaryButton}
            </Button>
            {config.secondaryAction && (
              config.secondaryAction.href ? (
                <a
                  href={config.secondaryAction.href}
                  className={`inline-flex text-black items-center justify-center ${config.secondaryAction.className} px-4 py-2 text-sm rounded font-medium transition-colors`}
                >
                  {config.secondaryAction.label}
                </a>
              ) : (
                <Button
                  onClick={handleSecondaryAction}
                  className={`text-black ${config.secondaryAction.className} px-4 py-2 text-sm`}
                >
                  {config.secondaryAction.label}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthStatusDialog;
