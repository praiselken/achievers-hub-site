import AdminGuard   from './AdminGuard';
import AdminLayout  from './AdminLayout';
import AdminQuestionsTab from './tabs/AdminQuestionsTab';
import AdminTopicsTab    from './tabs/AdminTopicsTab';
import AdminPapersTab    from './tabs/AdminPapersTab';
import AdminMindsetTab   from './tabs/AdminMindsetTab';
import AdminUsersTab     from './tabs/AdminUsersTab';

type AdminTab = 'questions' | 'topics' | 'papers' | 'mindset' | 'users';

const CONTENT: Record<AdminTab, React.ReactNode> = {
  questions: <AdminQuestionsTab />,
  topics:    <AdminTopicsTab />,
  papers:    <AdminPapersTab />,
  mindset:   <AdminMindsetTab />,
  users:     <AdminUsersTab />,
};

export default function AdminPage({ tab }: { tab: AdminTab }) {
  return (
    <AdminGuard>
      <AdminLayout>
        {CONTENT[tab]}
      </AdminLayout>
    </AdminGuard>
  );
}
