import TutorDashboardLayout, { type TutorTab } from './TutorDashboardLayout';
import TutorOverviewTab   from './tabs/TutorOverviewTab';
import TutorStudentsTab   from './tabs/TutorStudentsTab';
import TutorSessionsTab   from './tabs/TutorSessionsTab';
import TutorAnalyticsTab  from './tabs/TutorAnalyticsTab';
import TutorResourcesTab  from './tabs/TutorResourcesTab';
import TutorProfileTab    from './tabs/TutorProfileTab';

interface Props { tab: TutorTab; }

const TAB_CONTENT: Record<TutorTab, React.ReactNode> = {
  overview:  <TutorOverviewTab />,
  students:  <TutorStudentsTab />,
  sessions:  <TutorSessionsTab />,
  analytics: <TutorAnalyticsTab />,
  resources: <TutorResourcesTab />,
  profile:   <TutorProfileTab />,
};

export default function TutorDashboard({ tab }: Props) {
  return (
    <TutorDashboardLayout activeTab={tab}>
      {TAB_CONTENT[tab]}
    </TutorDashboardLayout>
  );
}
