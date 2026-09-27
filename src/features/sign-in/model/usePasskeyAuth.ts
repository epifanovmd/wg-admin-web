import { IAuthStore, PASSKEY_LOGIN_STORAGE_KEY } from "@entities/auth";
import { IMainApi } from "@shared/api";
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@shared/api/gen/main/model";
import { IStorageService } from "@shared/lib/storage";
import {
  browserSupportsWebAuthn,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useCallback, useEffect, useState } from "react";

export const usePasskeyAuth = (onSuccess: () => void) => {
  const storage = IStorageService.useInstance();
  const [support, setSupport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(() =>
    storage.getItem(PASSKEY_LOGIN_STORAGE_KEY),
  );

  const api = IMainApi.useInstance();
  const { restore } = IAuthStore.useInstance();

  useEffect(() => {
    setSupport(browserSupportsWebAuthn());
  }, []);

  const handleRegister = useCallback(
    async (login: string): Promise<{ ok: boolean; error?: string }> => {
      setLoading(true);
      setError(null);

      try {
        const optionsRes = await api.generateRegistrationOptions();

        if (optionsRes.error) {
          setError(optionsRes.error.message);

          return { ok: false, error: optionsRes.error.message };
        }

        let attResp;

        try {
          attResp = await startRegistration({
            optionsJSON:
              optionsRes.data as PublicKeyCredentialCreationOptionsJSON,
          });
        } catch (err: any) {
          if (err?.name === "InvalidStateError") {
            // Аутентификатор уже зарегистрирован — считаем успехом
            storage.setItem(PASSKEY_LOGIN_STORAGE_KEY, login);
            setProfileId(login);

            return { ok: true };
          }

          const error = err?.message ?? "Registration cancelled";

          setError(error);

          return { ok: false, error };
        }

        const verifyRes = await api.verifyRegistration({
          data: attResp as RegistrationResponseJSON,
        });

        if (verifyRes.error) {
          setError(verifyRes.error.message);

          return { ok: false, error: verifyRes.error.message };
        }

        if (verifyRes.data?.verified) {
          storage.setItem(PASSKEY_LOGIN_STORAGE_KEY, login);
          setProfileId(login);

          return { ok: true };
        }

        const error = "Passkey registration was not verified by the server";

        setError(error);

        return { ok: false, error };
      } catch (err: any) {
        const error = err?.message ?? "Passkey registration failed";

        setError(error);

        return { ok: false, error };
      } finally {
        setLoading(false);
      }
    },
    [api, storage],
  );

  const handleLogin = useCallback(async (): Promise<{
    ok: boolean;
    error?: string;
  }> => {
    if (!profileId) {
      const error = "No passkey registered on this device";

      setError(error);

      return { ok: false, error };
    }

    setLoading(true);
    setError(null);

    try {
      const optionsRes = await api.generateAuthenticationOptions({
        login: profileId,
      });

      if (optionsRes.error) {
        setError(optionsRes.error.message);

        return { ok: true, error: optionsRes.error.message };
      }

      let authResp;

      try {
        authResp = await startAuthentication({
          optionsJSON: optionsRes.data as PublicKeyCredentialRequestOptionsJSON,
        });
      } catch (err: any) {
        const error = err?.message ?? "Registration cancelled";

        setError(error);

        return { ok: false, error };
      }

      const verifyRes = await api.verifyAuthentication({
        data: authResp as AuthenticationResponseJSON,
      });

      if (verifyRes.error) {
        setError(verifyRes.error.message);

        return { ok: false, error: verifyRes.error.message };
      }

      if (verifyRes.data?.tokens) {
        await restore(verifyRes.data.tokens);
        onSuccess();

        return { ok: true };
      }

      const error = "Authentication was not verified by the server";

      setError(error);

      return { ok: false, error };
    } catch (err: any) {
      const error = err?.message ?? "Passkey authentication failed";

      setError(error);

      return { ok: false, error };
    } finally {
      setLoading(false);
    }
  }, [api, onSuccess, profileId, restore]);

  const removePasskey = useCallback(() => {
    storage.removeItem(PASSKEY_LOGIN_STORAGE_KEY);
    setProfileId(null);
  }, [storage]);

  const clearError = useCallback(() => setError(null), []);

  return {
    support,
    loading,
    error,
    profileId,
    handleRegister,
    handleLogin,
    removePasskey,
    clearError,
  };
};
