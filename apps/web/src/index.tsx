import { render } from "preact";
import blockPillIcon from "../../../shared/brand/icons/block-pill-transparent.svg?url";
import "./landing.css";

const repo = "https://github.com/txjao/block-pill";
const features = [
  ["Local por princípio", "Sua lista de bloqueios permanece no navegador. Nenhum histórico precisa sair da sua máquina."],
  ["Bloqueio que persiste", "As regras continuam ativas entre sessões, usando recursos nativos do Chrome."],
  ["Controle legível", "Adicionar e remover domínios é simples — e cada permissão tem uma razão clara."]
] as const;
const ideas = [
  ["Pausas temporárias", "Desbloqueios conscientes, com tempo e contexto para quebrar o automatismo."],
  ["Novas formas de fricção", "Intervenções graduais sem transformar foco em punição."],
  ["Mais navegadores", "Compatibilidade sem comprometer privacidade ou simplicidade."]
] as const;

function Logo() {
  return <a class="logo" href="#top" aria-label="Block Pill, início"><img src={blockPillIcon} width="40" height="40" alt="" /><span>Block Pill</span></a>;
}

function Header() {
  return <header><div class="header-inner"><Logo /><nav aria-label="Navegação principal"><a href="#como">Como funciona</a><a href="#principios">Princípios</a><a class="nav-cta" href={repo} target="_blank" rel="noreferrer">Ver no GitHub</a></nav></div></header>;
}

function Hero() {
  return <section class="hero" id="top"><div><h1>Interrompa o impulso.<br /><em>Não a sua autonomia.</em></h1><p class="lede">Block Pill é código aberto e coloca uma pausa consciente entre você e os sites que capturam sua atenção — com privacidade local, sem contas, vigilância ou gamificação.</p><div class="actions"><a class="button primary" href={repo} target="_blank" rel="noreferrer">Explorar o código</a><a href="#como">Entender a ideia</a></div></div><div class="demo" role="img" aria-label="O impulso encontra uma pausa consciente"><small>impulso</small><div class="demo-line"><i /><b /><span>pausa</span></div><small>escolha</small><p>Uma pequena fricção pode devolver espaço para uma decisão real.</p></div></section>;
}

function How() {
  const steps = [["Você escolhe", "Cadastre os domínios que deseja interromper."], ["A regra fica local", "O navegador guarda a escolha e aplica um redirecionamento persistente."], ["O automático para", "Ao acessar o domínio, você encontra uma pausa e pode decidir."]] as const;
  return <section id="como"><div class="section-head"><h2>O caminho curto<br />de volta à intenção.</h2><p>Sem dashboards de performance. Sem pontuação. Só uma barreira clara no momento em que você pediu por ela.</p></div><ol class="steps">{steps.map(([title, text], i) => <li key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>;
}

function Features() {
  return <section class="features"><div class="feature-head"><h2>O mínimo necessário.<br />No lugar certo.</h2><div class="zero"><strong>0</strong><small>contas<br />necessárias</small></div></div><div class="feature-list">{features.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p><span>disponível agora</span></article>)}</div></section>;
}

function Principles() {
  return <section class="principles" id="principios"><div><h2>Foco não deveria custar sua privacidade.</h2><p>A Block Pill parte de uma posição simples: ferramentas de bem-estar digital não precisam observar cada movimento para ajudar.</p></div><blockquote>“Criar fricção contra decisões impulsivas sem impedir a desinstalação.”<cite>Princípio de produto do Block Pill</cite></blockquote></section>;
}

function Roadmap() {
  return <section class="roadmap"><div><h2>Ainda há muito<br />para construir.</h2><p>Estas são direções em estudo — não funcionalidades prometidas.</p></div><div class="roadmap-list">{ideas.map(([title, text]) => <article key={title}><span>em exploração</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>;
}

function Contribute() {
  return <section class="contribute"><div><h2>Ajude a construir uma internet com mais intenção.</h2><p>Há espaço para código, design, pesquisa, documentação e boas perguntas. O projeto está no começo — a melhor hora para influenciar seu rumo.</p></div><div class="contribute-actions"><a class="button light" href={`${repo}/issues`} target="_blank" rel="noreferrer">Encontrar uma issue</a><a href={repo} target="_blank" rel="noreferrer">Conhecer o repositório</a></div></section>;
}

function App() {
  return <><Header /><main><Hero /><How /><Features /><Principles /><Roadmap /><Contribute /></main><footer><Logo /><p>Privacidade, foco e código aberto.</p><div><a href={`${repo}/blob/main/PRIVACY.md`}>Privacidade</a><a href={repo}>GitHub</a></div></footer></>;
}

const root = document.getElementById("app");

if (!root) {
  throw new Error("Elemento raiz da landing page não encontrado.");
}

render(<App />, root);
