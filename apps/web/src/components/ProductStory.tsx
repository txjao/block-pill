import * as Accordion from '@radix-ui/react-accordion';
import { capabilities, storySteps } from '@/content';
export function ProductStory() {
  return (
    <>
      <section className="story-shell" id="como" aria-labelledby="story-title">
        <div className="story-copy">
          <h2 id="story-title">Uma pequena fricção muda o próximo gesto.</h2>
          <p>Sem pontuação, conta ou dashboard. A extensão intervém apenas onde você decidiu.</p>
        </div>
        <ol className="story-steps">
          {storySteps.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="capabilities" aria-labelledby="capabilities-title">
        <div className="capabilities-intro">
          <h2 id="capabilities-title">O mínimo necessário. No lugar certo.</h2>
          <p>
            <strong>0</strong> contas necessárias
          </p>
        </div>
        <Accordion.Root className="accordion" type="single" defaultValue="local" collapsible>
          {capabilities.map((item) => (
            <Accordion.Item className="accordion-item" value={item.value} key={item.value}>
              <Accordion.Header>
                <Accordion.Trigger className="accordion-trigger">
                  <span>{item.title}</span>
                  <span className="accordion-mark" aria-hidden="true" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="accordion-content">
                <div>
                  <p>{item.text}</p>
                  <small>Disponível agora</small>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>
    </>
  );
}
