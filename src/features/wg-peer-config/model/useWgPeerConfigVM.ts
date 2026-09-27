import { IMainApi } from "@shared/api";
import type { WgPeerDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { downloadBlob } from "@shared/lib/utils";
import { useState } from "react";

/** Конфиг и QR пира: держатель получает свои, админ — любые. */
export const useWgPeerConfigVM = () => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [peer, setPeer] = useState<WgPeerDto | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [config, setConfig] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);
  const [loading, setLoading] = useState(false);

  const openFor = async (target: WgPeerDto) => {
    setPeer(target);
    setQr(null);
    setConfig(null);
    setShowText(false);
    setLoading(true);

    const [qrRes, configRes] = await Promise.all([
      api.wgPeerQr(target.id),
      api.wgPeerConfig(target.id),
    ]);

    setLoading(false);
    if (qrRes.error || configRes.error) {
      notifyApiError(toast, qrRes.error ?? configRes.error);
      setPeer(null);

      return;
    }

    setQr(qrRes.data.dataUrl);
    setConfig(configRes.data as unknown as string);
  };

  const close = () => setPeer(null);

  const download = () => {
    if (!peer || config === null) return;

    const name = `${
      peer.name
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .slice(0, 15) || "wg"
    }.conf`;

    downloadBlob(new Blob([config], { type: "text/plain" }), name);
  };

  return {
    peer,
    qr,
    config,
    showText,
    setShowText,
    loading,
    openFor,
    close,
    download,
  };
};
