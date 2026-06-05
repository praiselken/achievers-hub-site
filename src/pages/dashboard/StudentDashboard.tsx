import DashboardLayout from './DashboardLayout';
import HomeTab from './tabs/HomeTab';
import DailyFiveTab from './tabs/DailyFiveTab';
import TopicHubTab from './tabs/TopicHubTab';
import PastPapersTab from './tabs/PastPapersTab';
import SpecMapperTab from './tabs/SpecMapperTab';

type Tab = 'home' | 'daily5' | 'topics' | 'papers' | 'spec';

export default function StudentDashboard({ tab }: { tab: Tab }) {
  const content = {
    home:    <HomeTab />,
    daily5:  <DailyFiveTab />,
    topics:  <TopicHubTab />,
    papers:  <PastPapersTab />,
    spec:    <SpecMapperTab />,
  }[tab];

  return (
    <DashboardLayout activeTab={tab}>
      {content}
    </DashboardLayout>
  );
}
