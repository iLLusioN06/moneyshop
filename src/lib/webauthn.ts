// =============================================
// MoneyShop - WebAuthn (Biometric Auth) Servisi
// =============================================
// Fingerprint, Face ID, Windows Hello vb. destekler.
// =============================================

export interface WebAuthnConfig {
  rpName: string;
  rpId: string;
  origin: string;
}

export interface RegistrationOptions {
  challenge: string;
  rp: { id: string; name: string };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{ alg: number; type: "public-key" }>;
  timeout: number;
  attestation: "none" | "indirect" | "direct";
  authenticatorSelection: {
    authenticatorAttachment?: "platform" | "cross-platform";
    userVerification: "required" | "preferred" | "discouraged";
  };
}

export interface AuthenticationOptions {
  challenge: string;
  timeout: number;
  rpId: string;
  allowCredentials?: Array<{ id: string; type: "public-key"; transports?: string[] }>;
  userVerification: "required" | "preferred" | "discouraged";
}

/**
 * WebAuthn destekleniyor mu?
 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined"
  );
}

/**
 * Platform authenticator (parmak izi, Face ID) destekleniyor mu?
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * ArrayBuffer'yi Base64'e çevir
 */
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64'ü ArrayBuffer'a çevir
 */
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Registration (kayıt) seçeneklerini oluştur
 */
export async function createRegistrationOptions(
  userId: string,
  userName: string,
  displayName: string
): Promise<RegistrationOptions> {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  return {
    challenge: bufferToBase64(challenge.buffer),
    rp: {
      id: window.location.hostname,
      name: "MoneyShop",
    },
    user: {
      id: userId,
      name: userName,
      displayName: displayName,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" },   // ES256
      { alg: -257, type: "public-key" }, // RS256
    ],
    timeout: 60000,
    attestation: "none",
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required",
    },
  };
}

/**
 * Authentication (giriş) seçeneklerini oluştur
 */
export async function createAuthenticationOptions(
  credentials?: Array<{ id: string }>
): Promise<AuthenticationOptions> {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  return {
    challenge: bufferToBase64(challenge.buffer),
    timeout: 60000,
    rpId: window.location.hostname,
    allowCredentials: credentials?.map((cred) => ({
      id: cred.id,
      type: "public-key" as const,
      transports: ["internal"],
    })),
    userVerification: "required",
  };
}

/**
 * Biometric registration başlat
 */
export async function startRegistration(
  options: RegistrationOptions
): Promise<PublicKeyCredential | null> {
  if (!isWebAuthnSupported()) {
    throw new Error("WebAuthn desteklenmiyor.");
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: base64ToBuffer(options.challenge),
        rp: options.rp,
        user: {
          id: base64ToBuffer(options.user.id),
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        attestation: options.attestation,
        authenticatorSelection: options.authenticatorSelection,
      },
    });

    return credential as PublicKeyCredential;
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
}

/**
 * Biometric authentication başlat
 */
export async function startAuthentication(
  options: AuthenticationOptions
): Promise<PublicKeyCredential | null> {
  if (!isWebAuthnSupported()) {
    throw new Error("WebAuthn desteklenmiyor.");
  }

  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: base64ToBuffer(options.challenge),
        timeout: options.timeout,
        rpId: options.rpId,
        allowCredentials: options.allowCredentials?.map((cred) => ({
          id: base64ToBuffer(cred.id),
          type: cred.type as "public-key",
          transports: cred.transports as AuthenticationExtensionsClientInputs["largeBlob"] extends object ? AuthenticatorTransport[] : undefined,
        })),
        userVerification: options.userVerification,
      },
    });

    return assertion as PublicKeyCredential;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Registration sonucunu API'ye gönder
 */
export async function completeRegistration(
  credential: PublicKeyCredential,
  challenge: string
): Promise<boolean> {
  const response = credential.response as AuthenticatorAttestationResponse;

  const data = {
    id: credential.id,
    rawId: bufferToBase64(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64(response.clientDataJSON),
      attestationObject: bufferToBase64(response.attestationObject),
    },
    challenge,
  };

  const res = await fetch("/api/auth/webauthn/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.ok;
}

/**
 * Authentication sonucunu API'ye gönder
 */
export async function completeAuthentication(
  credential: PublicKeyCredential,
  challenge: string
): Promise<boolean> {
  const response = credential.response as AuthenticatorAssertionResponse;

  const data = {
    id: credential.id,
    rawId: bufferToBase64(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64(response.clientDataJSON),
      authenticatorData: bufferToBase64(response.authenticatorData),
      signature: bufferToBase64(response.signature),
      userHandle: response.userHandle ? bufferToBase64(response.userHandle) : null,
    },
    challenge,
  };

  const res = await fetch("/api/auth/webauthn/authenticate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.ok;
}
