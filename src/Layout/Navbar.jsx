import { useState } from "react";
import { Button, Typography, Box, AppBar, Toolbar, IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { useStore } from "../Store/Store";
import { MoreVert } from "@mui/icons-material";
export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAdmin, isLogin, setisLogin } = useStore();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  function LogotManage() {
    localStorage.clear();
    setisLogin(false);
    console.clear();
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "rgb(4, 4, 38)" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h6" sx={{ position: "absolute", left: 20 }}>Skoegle</Typography>
        <Typography variant="h6" sx={{ textAlign: "center" }}>V-Marg</Typography>
        <Box sx={{ position: "absolute", right: 20, display: { xs: "none", md: "block" } }}>
          {isLogin && !isAdmin && <Button component={Link} to="/profile" variant="outlined" sx={{ color: "white", borderColor: "white", mr: 1 }}>Profile</Button>}
          {isAdmin && isLogin && <Button component={Link} to="/admin" variant="outlined" sx={{ color: "white", borderColor: "white", mr: 1 }}>Admin</Button>}
          {!isLogin ? (
            <>
              <Button component={Link} to="/login" variant="outlined" sx={{ color: "white", borderColor: "white", mr: 1 }}>Login</Button>
              <Button component={Link} to="/signup" variant="contained" sx={{ backgroundColor: "white", color: "rgb(4, 4, 38)", mr: 1 }}>Sign Up</Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/" variant="outlined" sx={{ color: "white", borderColor: "white", mr: 1 }}>Live</Button>
              {/* <Button component={Link} to="/track" variant="outlined" sx={{ color: "white", borderColor: "white", mr: 1 }}>Track</Button> */}
              <Button component={Link} to="/settings" variant="outlined" sx={{ color: "white", borderColor: "white", mr: 1 }}>Add Device</Button>
              <Button component={Link} to="/login" onClick={LogotManage} variant="contained" sx={{ backgroundColor: "white", color: "rgb(4, 4, 38)", mr: 1 }}>Logout</Button>
            </>
          )}
        </Box>
    
<IconButton
  sx={{ display: { xs: "block", md: "none" }, color: "white", position: "absolute", right: 20 }}
  onClick={handleMenuOpen}
>
  <MoreVert />
</IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {!isLogin ? (
            <>
              <MenuItem component={Link} to="/login" onClick={handleMenuClose}>Login</MenuItem>
              <MenuItem component={Link} to="/signup" onClick={handleMenuClose}>Sign Up</MenuItem>
            </>
          ) : (
            <>
              <MenuItem component={Link} to="/" onClick={handleMenuClose}>Live</MenuItem>
              {/* <MenuItem component={Link} to="/track" onClick={handleMenuClose}>Track</MenuItem> */}
              <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>Add Device</MenuItem>
             {isLogin && !isAdmin && <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>Profile</MenuItem>}
              {isAdmin && <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>Admin</MenuItem>}
              <MenuItem component={Link} to="/login" onClick={() => { LogotManage(); handleMenuClose(); }}>Logout</MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}