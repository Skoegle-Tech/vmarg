import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, Login, PersonAdd, ExitToApp, Visibility, AccountCircle, SupervisorAccount } from '@mui/icons-material'; // Import SupervisorAccount for Admin
import { useLocation, Link } from 'react-router-dom'; // Import for routing and location tracking
import { useStore } from '../Store/Store';

const Menu = () => {
  const { isAdmin, isLogin, setisLogin } = useStore();
  const location = useLocation(); // Get the current route location

  const handleLogout = () => {
    console.log("logout")
    setisLogin(false);
    localStorage.clear()
  };

  const isActive = (path) => location.pathname === path; // Check if the current path is active

  return (
    <BottomNavigation
      showLabels
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        width: '100%', 
        backgroundColor: '#fff', // Set background color
        display: 'flex',
        justifyContent: 'space-around' // Center the Home icon
      }}
    >
      {/* Show Home and Live Preview only when the user is logged in */}
      {isLogin && (
        <>
          <BottomNavigationAction
            label="Home"
            icon={<Home />}
            component={Link} // Wrap with Link for routing
            to="/" // Home route
            style={{ color: isActive('/') ? 'primary' : 'inherit' }} // Highlight active route
          />
          {/* <BottomNavigationAction
            label="Live Preview"
            icon={<Visibility />}
            component={Link}
            to="/track" // Live preview route
            style={{ color: isActive('/live') ? 'primary' : 'inherit' }} // Highlight active route
          /> */}
          
          {/* Show Profile icon only when the user is not an admin */}
          {!isAdmin && (
            <BottomNavigationAction
              label="Profile"
              icon={<AccountCircle />}
              component={Link}
              to="/profile" // Profile route
              style={{ color: isActive('/profile') ? 'primary' : 'inherit' }} // Highlight active route
            />
          )}

          {/* Admin icon, shown only if user is an admin */}
          {isAdmin && (
            <BottomNavigationAction
              label="Admin"
              icon={<SupervisorAccount />} // Admin icon using SupervisorAccount
              component={Link}
              to="/mbpannel/admin" // Admin route
              style={{ color: isActive('/admin') ? 'primary' : 'inherit' }} // Highlight active route
            />
          )}
        </>
      )}

      {/* Conditional buttons for login/signup when not logged in */}
      {!isLogin ? (
        <>
          <BottomNavigationAction
            label="Login"
            icon={<Login />}
            component={Link}
            to="/login" // Login route
            style={{ color: isActive('/login') ? 'primary' : 'inherit' }} // Highlight active route
          />
          <BottomNavigationAction
            label="Signup"
            icon={<PersonAdd />}
            component={Link}
            to="/signup" // Signup route
            style={{ color: isActive('/signup') ? 'primary' : 'inherit' }} // Highlight active route
          />
        </>
      ) : (
        <BottomNavigationAction
          label="Logout"
          to="/login"
          component={Link}
          icon={<ExitToApp />}
          onClick={handleLogout}
          style={{ color: isActive('/login') ? 'primary' : 'inherit' }} 
        />
      )}
    </BottomNavigation>
  );
};

export default Menu;