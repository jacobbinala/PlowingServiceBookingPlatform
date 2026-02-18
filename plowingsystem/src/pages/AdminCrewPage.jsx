import { useState } from 'react';
import CreateCrewMemberForm from '../components/admin/CreateCrewMemberForm';
import CrewMemberList from '../components/admin/CrewMemberList';

function AdminCrewPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="admin-crew-page">
      <h1>Crew management</h1>
      <CreateCrewMemberForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <CrewMemberList refreshKey={refreshKey} />
    </div>
  );
}

export default AdminCrewPage;
