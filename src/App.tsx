import { useState } from 'react';
import { ThemeProvider } from '@/theme';
import { RouterProvider, useRouter, parsePath } from '@/router';
import { Layout } from '@/components/Layout';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { LandingPage } from '@/pages/LandingPage';
import { Dashboard } from '@/pages/Dashboard';
import { GroupsPage } from '@/pages/GroupsPage';
import { GroupDetail } from '@/pages/GroupDetail';
import { GroupHistory } from '@/pages/GroupHistory';

function AppContent() {
  const { path, navigate } = useRouter();
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const segments = parsePath(path);
  const isLanding = path === '/';

  // Landing page has its own full-page layout (no sidebar)
  if (isLanding) {
    return <LandingPage onDemo={() => navigate('/dashboard')} />;
  }

  // Determine which page to render
  let page;
  let onAddExpense: (() => void) | undefined;
  let onAddGroup: (() => void) | undefined;

  if (segments[0] === 'dashboard') {
    onAddGroup = () => setShowCreateGroup(true);
    // Add Expense from dashboard navigates to first group's detail
    onAddExpense = () => navigate('/groups');
    page = <Dashboard onAddExpense={onAddExpense} onAddGroup={onAddGroup} />;
  } else if (segments[0] === 'groups' && segments.length === 1) {
    onAddGroup = () => setShowCreateGroup(true);
    page = <GroupsPage onAddGroup={onAddGroup} />;
  } else if (segments[0] === 'groups' && segments.length >= 2) {
    page = <GroupDetail groupId={segments[1]} />;
  } else if (segments[0] === 'history') {
    page = <GroupHistory />;
  } else {
    // Fallback: redirect to landing
    page = <LandingPage onDemo={() => navigate('/dashboard')} />;
  }

  return (
    <Layout onAddExpense={onAddExpense} onAddGroup={onAddGroup}>
      {page}
      <CreateGroupModal open={showCreateGroup} onClose={() => setShowCreateGroup(false)} />
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </ThemeProvider>
  );
}
