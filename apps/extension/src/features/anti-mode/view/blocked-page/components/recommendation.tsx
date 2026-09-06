import styles from '@/features/anti-mode/view/blocked-page/anti-mode.blocked.module.css';
import {
  getRecommendationText,
  type AntiModeNeed,
} from '@/features/anti-mode/view/anti-mode.presentation';
import { Button } from '@/shared/ui/components/button';

export function Recommendation({ need, hobbies }: { need: AntiModeNeed; hobbies: string[] }) {
  if (need === 'information') {
    return (
      <form class={styles.searchAlternative} action="https://www.google.com/search" method="get">
        <strong>Busque a informação sem abrir o site bloqueado</strong>
        <p>Este campo envia sua pesquisa diretamente ao buscador Google.</p>
        <div class={styles.formRow}>
          <label class={styles.visuallyHidden} for="alternative-search">
            Termo de busca
          </label>
          <input
            id="alternative-search"
            name="q"
            type="search"
            placeholder="O que você quer encontrar?"
          />
          <Button type="submit">Pesquisar no Google</Button>
        </div>
      </form>
    );
  }

  return <p class={styles.recommendation}>{getRecommendationText(need, hobbies)}</p>;
}
