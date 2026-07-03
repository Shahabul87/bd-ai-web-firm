import type { Metadata } from 'next';
import PageLayout from '../components/layout/PageLayout';
import {
  Accordion,
  Button,
  Card,
  MonoLabel,
  Pipeline,
  SectionHeader,
  SpecTable,
  Stepper,
  Terminal,
  TypeOn,
} from '../design/ui';

export const metadata: Metadata = {
  title: 'Design System (internal)',
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl space-y-16 px-6 py-16">
        <SectionHeader
          index="00"
          eyebrow="Internal"
          title="Agent Foundry design system"
          description="Internal preview of every primitive. Not linked, not indexed. Removed in the stage-6 sweep."
        />

        <section className="space-y-4">
          <MonoLabel>Buttons</MonoLabel>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="signal">Start a project</Button>
            <Button variant="ghost">Get estimate</Button>
            <Button variant="link" href="/design-system">Read more</Button>
            <Button variant="signal" size="lg">Start a project</Button>
            <Button variant="ghost" size="lg">Get estimate</Button>
          </div>
        </section>

        <section className="space-y-4">
          <MonoLabel>Type-on headline</MonoLabel>
          <h3 className="font-display text-4xl text-bone">
            <TypeOn text="Our agents build your software." />
          </h3>
        </section>

        <section className="space-y-4">
          <MonoLabel>Pipeline</MonoLabel>
          <Pipeline stages={['Spec', 'Agent', 'Code', 'Review', 'Ship']} />
        </section>

        <section className="space-y-4">
          <MonoLabel>Terminal</MonoLabel>
          <Terminal
            lines={[
              { text: 'agent run --brief ./client-brief.md', tone: 'cmd' },
              { text: 'Parsing brief… 4 requirements found', tone: 'out' },
              { text: 'Planning build: 12 tasks across 3 modules', tone: 'out' },
              { text: 'Writing code… src/checkout/payment.ts', tone: 'out' },
              { text: 'Running checks… lint ✓ types ✓ build ✓', tone: 'ok' },
              { text: 'Human review requested for payment flow', tone: 'warn' },
              { text: 'Shipped to staging.', tone: 'ok' },
            ]}
          />
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <Card>
            <MonoLabel>01 AI Agents</MonoLabel>
            <p className="mt-3 text-sm text-bone">Static card with corner ticks.</p>
          </Card>
          <Card interactive>
            <MonoLabel>02 Web</MonoLabel>
            <p className="mt-3 text-sm text-bone">Interactive card — hover flares the ticks.</p>
          </Card>
        </section>

        <section className="space-y-4">
          <MonoLabel>Spec table</MonoLabel>
          <SpecTable
            rows={[
              { label: 'Scope', value: 'Custom AI agent, deployed' },
              { label: 'Stack', value: 'TypeScript, Claude API, Postgres' },
              { label: 'Timeline', value: '3–6 weeks' },
            ]}
          />
        </section>

        <section className="space-y-4">
          <MonoLabel>Stepper</MonoLabel>
          <Stepper steps={['Services', 'Scope', 'Contact']} current={1} />
        </section>

        <section className="space-y-4">
          <MonoLabel>Accordion</MonoLabel>
          <Accordion
            items={[
              { id: 'a', question: 'How fast can you start?', answer: 'Kickoff within one week of a signed scope.' },
              { id: 'b', question: "Who reviews the agent's code?", answer: 'A senior engineer reviews every shipped change.' },
            ]}
          />
        </section>

        <section className="space-y-4">
          <MonoLabel>Blueprint grid surface</MonoLabel>
          <div className="blueprint-grid flex h-40 items-center justify-center border border-line">
            <MonoLabel>● SYSTEMS NOMINAL</MonoLabel>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
