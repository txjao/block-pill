import type { AntiModeId } from '@/features/anti-mode/domain/anti-mode.types';
import type { AntiModeModel } from './anti-mode.model';
import { AlertDialog } from '@/shared/ui/components/alert-dialog';
import { Badge } from '@/shared/ui/components/badge';
import { Button } from '@/shared/ui/components/button';
import { Toggle } from '@/shared/ui/components/toggle';
import styles from './anti-mode.module.css';
import { AntiModeConfiguration } from './components/anti-mode-configuration';

const copy = {
  'anti-porn': {
    title: 'Anti-pornografia',
    description:
      'Reduza encontros impulsivos com conteúdo adulto e crie espaço para retomar seus objetivos.',
    domainHelp: 'Adicione sites adultos que não aparecem na proteção inicial.',
    count: '1.482 domínios na lista',
  },
  'anti-bet': {
    title: 'Anti-aposta',
    description:
      'Crie distância de bets, cassinos e estímulos que incentivam decisões financeiras por impulso.',
    domainHelp: 'Adicione casas de aposta ou páginas promocionais que você encontrou.',
    count: 'proteção inicial e sites adicionados',
  },
} as const;

export function AntiModeView(props: AntiModeModel & { selectedMode?: AntiModeId }) {
  const {
    configs,
    drafts,
    feedback,
    isLoading,
    incognitoAllowed,
    pendingDeactivate,
    showCelebration,
    updateDraft,
    activate,
    addDomain,
    setPendingDeactivate,
    confirmDeactivate,
    setShowCelebration,
    openIncognitoSettings,
    selectedMode = 'anti-porn',
  } = props;
  const mode = selectedMode;
  const config = configs.find((item) => item.id === mode);
  const draft = drafts[mode];
  const active = config?.enabled ?? false;
  const canDeactivate =
    active && !config?.permanent && (config?.commitmentEndsAt ?? Infinity) <= Date.now();

  return (
    <section class={styles.section} aria-labelledby="anti-title">
      <p class={styles.breadcrumb}>Modos anti › {copy[mode].title}</p>
      <header class={styles.pageHeader}>
        <div>
          <h1 id="anti-title">{copy[mode].title}</h1>
          <p>
            Um compromisso com prazo. Enquanto ele durar, a configuração não pode ser desfeita por
            impulso.
          </p>
        </div>
      </header>

      {!incognitoAllowed && (
        <div class={styles.permissionAlert} role="alert">
          <span>
            <strong>Janelas anônimas podem passar por cima do compromisso.</strong>
            <p>É necessário permitir o funcionamento da extensão nesse contexto.</p>
          </span>
          <Button variant="dark" onClick={() => void openIncognitoSettings()}>
            Permitir
          </Button>
        </div>
      )}

      <div class={styles.statusRow}>
        <span>
          <Badge variant={active ? 'success' : 'neutral'}>
            {active ? 'proteção ativa' : 'inativo'}
          </Badge>
          <small>{copy[mode].count}</small>
          <p>{copy[mode].description}</p>
        </span>
        <Toggle
          checked={active}
          disabled={isLoading || (!incognitoAllowed && !active) || (active && !canDeactivate)}
          label={active ? 'Modo ativo' : 'Ativar modo'}
          description={active ? 'O compromisso está protegido.' : 'Revise antes de ativar.'}
          onCheckedChange={(checked) =>
            checked ? void activate(mode) : setPendingDeactivate(mode)
          }
        />
      </div>

      <AntiModeConfiguration
        mode={mode}
        config={config}
        active={active}
        configs={configs}
        drafts={drafts}
        updateDraft={updateDraft}
      />

      <form class={styles.domainForm} onSubmit={(event) => void addDomain(mode, event)}>
        <label for={`${mode}-domain`}>Adicionar site à proteção</label>
        <p>{copy[mode].domainHelp}</p>
        <div>
          <input
            id={`${mode}-domain`}
            inputMode="url"
            placeholder="exemplo.com"
            value={draft.hostname}
            onInput={(event) => updateDraft(mode, 'hostname', event.currentTarget.value)}
            required
          />
          <Button type="submit" disabled={isLoading}>
            Adicionar site
          </Button>
        </div>
      </form>

      <details class={styles.domains}>
        <summary>{config?.domains.length ?? 0} sites adicionados manualmente</summary>
        <ul>
          {config?.domains.map((domain) => (
            <li key={domain}>{domain}</li>
          ))}
        </ul>
      </details>

      <section class={styles.explanation}>
        <h2>O que é o modo anti?</h2>
        <p>
          O modo anti ajuda você a manter distância de conteúdos ou atividades que deseja evitar. Ao
          ativá-lo, você assume um compromisso por um período definido — ou sem prazo — e os sites
          relacionados ficam bloqueados durante esse tempo.
        </p>
        <p>
          A proposta não é punir nem vigiar você, mas criar uma pausa entre o impulso e a decisão.
          Caso precise acessar um site bloqueado, será necessário solicitar uma liberação
          temporária, tornando o acesso mais consciente.
        </p>
        <p>
          Existem modos específicos, como anti-pornografia e anti-aposta. Toda a proteção funciona
          localmente no seu navegador, respeitando sua privacidade e mantendo você no controle.
        </p>
      </section>

      <AlertDialog
        open={Boolean(pendingDeactivate)}
        title="Desativar esta proteção?"
        description="Se ainda quiser apoio, mantenha o modo ativo. Seus objetivos e registros locais não serão apagados."
        cancelLabel="Manter proteção"
        confirmLabel="Desativar modo"
        loading={isLoading}
        onOpenChange={(open) => !open && setPendingDeactivate(undefined)}
        onConfirm={() => void confirmDeactivate()}
      />
      <AlertDialog
        open={showCelebration}
        title="Você cumpriu seu compromisso."
        description="Reconheça o esforço antes de escolher o próximo passo."
        cancelLabel="Fechar"
        confirmLabel="Continuar"
        variant="dark"
        onOpenChange={setShowCelebration}
        onConfirm={() => setShowCelebration(false)}
      />
      {feedback && (
        <p class={styles.feedback} role="status">
          {feedback}
        </p>
      )}
    </section>
  );
}
