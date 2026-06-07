import DashboardLayout from './DashboardLayout';
import HomeTab      from './tabs/HomeTab';
import DailyFiveTab from './tabs/DailyFiveTab';
import TopicHubTab  from './tabs/TopicHubTab';
import PastPapersTab from './tabs/PastPapersTab';
import SpecMapperTab from './tabs/SpecMapperTab';
import SettingsTab  from './tabs/SettingsTab';

type Tab = 'home' | 'daily5' | 'topics' | 'papers' | 'spec' | 'settings';

const CONTENT: Record<Tab, React.ReactNode> = {
  home:     <HomeTab />,
  daily5:   <DailyFiveTab />,
  topics:   <TopicHubTab />,
  papers:   <PastPapersTab />,
  spec:     <SpecMapperTab />,
  settings: <SettingsTab />,
};

export default function StudentDashboard({ tab }: { tab: Tab }) {
  return (
    <DashboardLayout activeTab={tab}>
      {CONTENT[tab]}
    </DashboardLayout>
  );
}
