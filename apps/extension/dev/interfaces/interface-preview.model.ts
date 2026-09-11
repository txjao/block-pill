import { useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { INTERFACE_PREVIEW_NAME } from './interface-preview.constants';

const interfacePreviewOptions = [
  {
    id: 'settings-anti-ongoing',
    label: 'Modos anti: compromisso em andamento',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.settings,
      section: 'anti',
      mode: 'anti-porn',
      commitment: 'ongoing',
    },
    width: 1280,
    height: 820,
  },
  {
    id: 'settings-anti-setup',
    label: 'Modos anti: configurar compromisso',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.settings,
      section: 'anti',
      mode: 'anti-porn',
      commitment: 'inactive',
    },
    width: 1280,
    height: 820,
  },
  {
    id: 'popup-outside',
    label: 'Popup: fora da lista',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.popup,
      preview: 'outside',
    },
    width: 380,
    height: 520,
  },
  {
    id: 'popup-stimulating',
    label: 'Popup: site estimulante',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.popup,
      preview: 'stimulating',
    },
    width: 380,
    height: 520,
  },
  {
    id: 'popup-paused',
    label: 'Popup: site em pausa',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.popup,
      preview: 'paused',
    },
    width: 380,
    height: 520,
  },
  {
    id: 'settings-blocking',
    label: 'Configurações: bloqueios',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.settings,
      section: 'blocking',
    },
    width: 1280,
    height: 820,
  },
  {
    id: 'settings-anti',
    label: 'Configurações: modo anti',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.settings,
      section: 'anti',
    },
    width: 1280,
    height: 820,
  },
  {
    id: 'settings-activity',
    label: 'Configurações: atividade',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.settings,
      section: 'activity',
    },
    width: 1280,
    height: 820,
  },
  {
    id: 'blocked-standard',
    label: 'Bloqueio padrão: acesso disponível',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.blocked,
      mode: 'standard',
      hostname: 'video.example',
      state: 'available',
    },
    width: 1280,
    height: 760,
  },
  {
    id: 'blocked-standard-cooldown',
    label: 'Bloqueio padrão: tempo de espera',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.blocked,
      mode: 'standard',
      hostname: 'video.example',
      state: 'cooldown',
    },
    width: 1280,
    height: 760,
  },
  {
    id: 'blocked-standard-subdomain',
    label: 'Bloqueio padrão: exceção de subdomínio',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.blocked,
      mode: 'standard',
      hostname: 'example.com',
      attemptedHostname: 'docs.example.com',
    },
    width: 1280,
    height: 760,
  },
  {
    id: 'blocked-permanent',
    label: 'Bloqueio permanente',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.blocked,
      mode: 'permanent',
      hostname: 'casino.example',
    },
    width: 1280,
    height: 760,
  },
  {
    id: 'blocked-anti-porn',
    label: 'Anti-pornografia: bloqueio explícito',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.blocked,
      mode: 'anti-porn',
      kind: 'explicit',
      hostname: 'adult.example',
    },
    width: 1280,
    height: 960,
  },
  {
    id: 'blocked-anti-bet',
    label: 'Anti-aposta: aviso com acesso',
    parameters: {
      interface: INTERFACE_PREVIEW_NAME.blocked,
      mode: 'anti-bet',
      kind: 'warning',
      hostname: 'sports.example',
    },
    width: 1280,
    height: 1100,
  },
] as const;

type InterfacePreviewId = (typeof interfacePreviewOptions)[number]['id'];

export function useInterfacePreviewModel() {
  const [selectedId, setSelectedId] =
    useState<InterfacePreviewId>('popup-outside');
  const [reloadKey, setReloadKey] = useState(0);
  const [commitmentOverride, setCommitmentOverride] = useState<string>();
  const selectedPreview =
    interfacePreviewOptions.find((preview) => preview.id === selectedId) ??
    interfacePreviewOptions[0];
  const frameUrl = useMemo(() => {
    const parameters = new URLSearchParams(selectedPreview.parameters);
    if (commitmentOverride && 'commitment' in selectedPreview.parameters) {
      parameters.set('commitment', commitmentOverride);
    }
    parameters.set('reload', String(reloadKey));
    return `/dev/interfaces/frame/index.html?${parameters.toString()}`;
  }, [reloadKey, selectedPreview, commitmentOverride]);

  function selectPreview(
    event: JSX.TargetedEvent<HTMLSelectElement, Event>,
  ): void {
    const preview = interfacePreviewOptions.find(
      (item) => item.id === event.currentTarget.value,
    );
    if (preview) {
      setSelectedId(preview.id);
      setCommitmentOverride(undefined);
    }
  }

  function reloadPreview(): void {
    setReloadKey((current) => current + 1);
  }

  return {
    commitmentState:
      'commitment' in selectedPreview.parameters
        ? (commitmentOverride ?? selectedPreview.parameters.commitment)
        : undefined,
    setCommitmentState: (value: string) => {
      setCommitmentOverride(value);
      setReloadKey((key) => key + 1);
    },
    frameHeight: selectedPreview.height,
    frameTitle: selectedPreview.label,
    frameUrl,
    frameWidth: selectedPreview.width,
    options: interfacePreviewOptions,
    reloadPreview,
    selectedId,
    selectPreview,
  };
}
