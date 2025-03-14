import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useStore } from "./Store/Store";
import { Box, CircularProgress } from "@mui/material";
import Layout from "./Layout/Layout"; // Ensure Layout is imported
import Live from "./Pages/Live/Live";
import Track from "./Pages/Track";
import Profile from "./Pages/Profile";
import Admin from "./Pages/Admin/Admin";

// Lazy loading components
const Login = React.lazy(() => import("./Pages/Login"));
const SignUp = React.lazy(() => import("./Pages/Signup"));
const Setings = React.lazy(() => import("./Pages/Register/Setings"));

function Loading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  const { isLogin, isAdmin } = useStore();

  const GuestRoute = ({ element }) => (!isLogin ? element : <Navigate to="/" />);
  const ProtectedRoute = ({ element }) => (isLogin ? element : <Navigate to="/login" />);
  const AdminRoute = ({ element }) => (isLogin && isAdmin ? element : <Navigate to="/login" />);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <ProtectedRoute element={<Live />} />,
    },
    {
      path: "/signup",
      element: <GuestRoute element={<SignUp />} />,
    },
    {
      path: "/login",
      element: <GuestRoute element={<Login />} />,
    },
    {
      path: "/settings",
      element: (
        <ProtectedRoute
          element={
           <Setings/>
          }
        />
      ),
    },
    {
      path: "/track",
      element: (
        <ProtectedRoute
          element={
           <Track/>
          }
        />
      ),
    },
    {
      path: "/profile",
      element: (
        <ProtectedRoute
          element={
           <Profile/>
          }
        />
      ),
    },
    
{
  path:"/admin",
  element:(
    <AdminRoute element={<Admin/>} />
  )
}


  ]);

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
