import SectionHeader from '../../design/ui/SectionHeader';
import PillarCards from '../shared/PillarCards';

export default function PillarsGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <SectionHeader
        index="fig. 02"
        eyebrow="What we build"
        title="Four ways we put agents to work."
        description="Every engagement runs on the same idea: agents do the heavy lifting, engineers own the outcome."
      />
      <div className="mt-14">
        <PillarCards />
      </div>
    </section>
  );
}
