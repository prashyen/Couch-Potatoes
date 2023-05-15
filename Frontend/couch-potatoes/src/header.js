import './css/main.css';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import Link from '@material-ui/core/Link';
import Container from '@material-ui/core/Container';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import logo from './media/potato.png';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import TvIcon from '@material-ui/icons/Tv';
import DashboardIcon from '@material-ui/icons/Dashboard';
import LockIcon from '@material-ui/icons/Lock';
import api from './api'
import Cookies from 'js-cookie';
import { useSnackbar } from 'notistack';

export function Copyright() {
  return (
    <Typography variant="body2" color="secondary" align="center">
      Copyright ©
      <Link color="inherit" href="/">
        Couch Potatoes
        </Link>
      {' '}
      {new Date().getFullYear()}
        .
      {'  '}
      <a style={{ color: "white" }} href="/credits">Credits</a>
    </Typography>
  );
}

export function LoginHeader() {
  return (
    <AppBar position="static">
      <Toolbar>
        <a href="/">
          <img alt="logo" className="logo" src={logo} />
        </a>
        <h4 color="secondary" className="title">Couch Potatoes</h4>
      </Toolbar>
    </AppBar>
  );
}

export function MainHeader() {

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const { enqueueSnackbar } = useSnackbar();

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    api().logout(
      function (response) {
        if (response.res.status !== 200) {
          if (response.data === null) {
            enqueueSnackbar("Uh oh! Something went wrong", { variant: "error" });

          } else {
            enqueueSnackbar(response.data, { variant: "error" });
          }
        } else {
          window.location.href = "/login";
        }
      }
    )
  }
  return (
    <AppBar position="static">
      <Toolbar>
        <a href="/">
          <img alt="logo" className="logo" src={logo} />
        </a>
        <h4 color="secondary" className="title">Couch Potatoes</h4>

        <div>
          <Typography variant="h6" className="title">
            Hi, {Cookies.get('username')}!
          </Typography>
        </div>
        <div>
          <IconButton
            color="inherit"
            onClick={handleClick}
            edge="end"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Link
              color="primary"
              underline="none"
              href="/user"
            >
              <MenuItem>

                <TvIcon className="icon" /> My Shows
              </MenuItem>
            </Link>
            <Link
              color="primary"
              underline="none"
              href="/"
            >
              <MenuItem>
                <DashboardIcon className="icon" /> Dashboard
              </MenuItem>
            </Link>
            <MenuItem onClick={handleLogout}>
              <LockIcon className="icon" />Logout
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}


export function Footer() {
  return (

    <footer className="footer">
      <Container>
        <Copyright />
      </Container>
    </footer>
  );
}
