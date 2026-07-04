'use client';

import { motion } from 'framer-motion';
import SectionHeader from '../../design/ui/SectionHeader';
import MonoLabel from '../../design/ui/MonoLabel';
import Terminal from '../../design/ui/Terminal';
import type { TerminalLine } from '../../design/ui/Terminal';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

const BUILD: TerminalLine[] = [
  { text: 'agent run --brief ./client-brief.md', tone: 'cmd' },
  { text: 'Parsing brief… 4 requirements found', tone: 'out' },
  { text: 'Planning build — 12 tasks across 3 modules', tone: 'out' },
  { text: 'Writing src/checkout/payment.ts', tone: 'out' },
  { text: 'Writing tests/checkout.test.ts', tone: 'out' },
  { text: 'Running checks — lint ✓  types ✓  tests 34/34 ✓', tone: 'ok' },
  { text: 'Human review requested — payment flow', tone: 'warn' },
  { text: 'Approved. Shipped to staging.', tone: 'ok' },
];

const NOTES = [
  {
    label: 'Agents do',
    body: 'Read the brief, plan the work, write code and tests, run the checks, and open the change for review.',
  },
  {
    label: 'Engineers do',
    body: 'Set the direction, review every diff, own the architecture and the security-sensitive paths.',
  },
  {
    label: 'You get',
    body: 'Working software in weeks, not months — with a person accountable for what ships.',
  },
];

export default function AgentBuildShowcase() {
  return (
    <section className="border-y border-line bg-ink-900">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr]">
        <motion.div
          variants={riseStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div variants={rise}>
            <SectionHeader
              index="fig. 03"
              eyebrow="How agents build"
              title="Watch a brief become shipped software."
              description="This is the real shape of a build: the agent plans and writes, the checks run, and nothing ships until an engineer signs off."
            />
          </motion.div>

          <motion.dl variants={rise} className="mt-10 space-y-6">
            {NOTES.map((note) => (
              <div key={note.label}>
                <MonoLabel className="text-signal">{note.label}</MonoLabel>
                <dd className="mt-2 max-w-md text-sm leading-relaxed text-steel">
                  {note.body}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <Terminal lines={BUILD} title="crafts.ai — agent build" />
        </motion.div>
      </div>
    </section>
  );
}
