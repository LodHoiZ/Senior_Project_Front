import React from 'react';
import '../resourses/layout.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Layout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);

  const { user } = useSelector((state) => state.users);

  const adminMenu = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'ri-dashboard-3-line',
    },
    {
      name: 'Events',
      path: '/event',
      icon: 'ri-calendar-event-fill',
    },
    {
      name: 'Logout',
      path: '/logout',
      icon: 'ri-logout-box-line',
    },
  ];

  return (
    <div className="row layout-parent">
      <div className="col-2 sidebar">
        <div className="sidebar-header text-center">
          <img src={process.env.PUBLIC_URL + '/images/logo.png'} alt="Logo" className="logo-image mt-5" />
          <p style={{ color: 'white', paddingTop: '30px' }}>
            {user.firstname} {user.lastname}
          </p>
        </div>

        <div className="d-flex flex-column gap-3 justify-content-start menu">
          {adminMenu.map((item, index) => {
            return (
              <div className="active-menu-item menu-item">
                <i className={item.icon}></i>
                {!collapsed && (
                  <span
                    onClick={() => {
                      if (item.path === '/logout') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/login');
                      } else {
                        navigate(item.path);
                      }
                    }}
                  >
                    {item.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="col-10 content">{children}</div>
    </div>
  );
}

export default Layout;
