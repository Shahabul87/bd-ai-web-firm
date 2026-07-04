import DraftingRoomHero from './home/DraftingRoomHero';
import ProofStrip from './home/ProofStrip';
import PillarsGrid from './home/PillarsGrid';
import AgentBuildShowcase from './home/AgentBuildShowcase';
import Advantage from './home/Advantage';
import SelectedWork from './home/SelectedWork';
import ProcessStrip from './home/ProcessStrip';
import ResourcesRow from './home/ResourcesRow';
import FinalCTA from './home/FinalCTA';

export default function HomePage() {
  return (
    <>
      <DraftingRoomHero />
      <ProofStrip />
      <PillarsGrid />
      <AgentBuildShowcase />
      <Advantage />
      <SelectedWork />
      <ProcessStrip />
      <ResourcesRow />
      <FinalCTA />
    </>
  );
}
