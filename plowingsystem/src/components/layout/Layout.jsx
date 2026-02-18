import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * Shared app shell: header (with Log Out) + outlet for child routes.
 */
function Layout() {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
