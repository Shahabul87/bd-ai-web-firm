// CSRF Protection Utilities
import crypto from 'crypto';

// Store tokens in memory (in production, use a proper session store)
const csrfTokens = new Map<string, { token: string; timestamp: number }>();
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate a CSRF token for a session
 */
export function generateCSRFToken(sessionId?: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const id = sessionId || crypto.randomBytes(16).toString('hex');
  
  csrfTokens.set(id, {
    token,
    timestamp: Date.now()
  });
  
  // Clean up expired tokens
  cleanupExpiredTokens();
  
  return token;
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string, sessionId?: string): boolean {
  if (!token) return false;
  
  // Clean up expired tokens first
  cleanupExpiredTokens();
  
  // Check all tokens if no session ID provided
  if (!sessionId) {
    for (const [, value] of csrfTokens) {
      if (value.token === token) {
        return true;
      }
    }
    return false;
  }
  
  const storedData = csrfTokens.get(sessionId);
  if (!storedData) return false;
  
  // Check if token matches and is not expired
  const isValid = storedData.token === token && 
                  (Date.now() - storedData.timestamp) < TOKEN_EXPIRY;
  
  // Remove token after validation (one-time use)
  if (isValid) {
    csrfTokens.delete(sessionId);
  }
  
  return isValid;
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [id, data] of csrfTokens) {
    if (now - data.timestamp > TOKEN_EXPIRY) {
      csrfTokens.delete(id);
    }
  }
}

/**
 * Get CSRF token from headers
 */
export function getCSRFTokenFromHeaders(headers: Headers): string | null {
  return headers.get('x-csrf-token') || headers.get('X-CSRF-Token');
}

/**
 * Create CSRF meta tag for client-side use
 */
export function createCSRFMetaTag(token: string): string {
  return `<meta name="csrf-token" content="${token}">`;
}

/**
 * Hook for client-side CSRF token management
 */
export function useCSRFToken(): { token: string | null; refreshToken: () => Promise<string> } {
  if (typeof window === 'undefined') {
    return { token: null, refreshToken: async () => '' };
  }
  
  const getTokenFromMeta = (): string | null => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : null;
  };
  
  const refreshToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      
      // Update meta tag
      let meta = document.querySelector('meta[name="csrf-token"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'csrf-token');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', data.token);
      
      return data.token;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return '';
    }
  };
  
  return {
    token: getTokenFromMeta(),
    refreshToken
  };
}