import ParentDashboardLayout, { type ParentTab } from './ParentDashboardLayout';
import ParentOverviewTab  from './tabs/ParentOverviewTab';
import ParentProgressTab  from './tabs/ParentProgressTab';
import ParentSpecTab      from './tabs/ParentSpecTab';
import ParentBookingsTab  from './tabs/ParentBookingsTab';

export default function ParentDashboard({ tab }: { tab: ParentTab }) {
  const content = {
    overview: <ParentOverviewTab />,
    progress: <ParentProgressTab />,
    spec:     <ParentSpecTab />,
    bookings: <ParentBookingsTab />,
  }[tab];

  return (
    <ParentDashboardLayout activeTab={tab}>
      {content}
    </ParentDashboardLayout>
  );
}
