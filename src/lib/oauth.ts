/**
 * OAuth utilities: PKCE, nonce generation, Apple SDK loader
 */

// ── PKCE (for Google web auth code flow) ─────────────────────────────────────

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateNonce(): string {
  return generateRandomString(16);
}

export function generateCodeVerifier(): string {
  return generateRandomString(32);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ── Apple JS SDK loader ──────────────────────────────────────────────────────

let appleSDKLoaded = false;

export function loadAppleSDK(): Promise<void> {
  if (appleSDKLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.onload = () => {
      appleSDKLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Apple Sign-In SDK"));
    document.head.appendChild(script);
  });
}

declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          state?: string;
          nonce?: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: {
            code: string;
            id_token: string;
            state?: string;
          };
          user?: {
            name?: { firstName?: string; lastName?: string };
            email?: string;
          };
        }>;
      };
    };
  }
}
