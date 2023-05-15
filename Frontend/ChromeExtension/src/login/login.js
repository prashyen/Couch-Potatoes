import api from './../Api';
import { useState } from 'react';
//Styling
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import { theme } from './../mainStyles';
import './../main.css';
// Components
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import UseForm from './useForm';
// Extension Layout
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import logo from './../potato.png';
import MenuItem from '@material-ui/core/MenuItem';

export const useStyles = makeStyles((theme) => ({
  root: {
    width: 320,
    height: 430,
  },
  container: {
    textAlign: 'center',
    padding: '55px',
    boxShadow: '0px 0px 3px #888888 !important',
    paddingTop: '36px',
    paddingBottom: '25px',
    minWidth: 320,
  },

  btn: {
    marginTop: '25px !important',
  },
  textfield: {
    height: '68px',
  },
}));

export default function Login(props) {
  const classes = useStyles();
  const formValuesInit = {
    username: '',
    password: '',
  };

  const [isValidCred, setIsValidCred] = useState(false);
  let onResponse = (response) => {
    if (response.res.status !== 201) {
      setIsValidCred(true);
    } else {
      window.location.href = "/";
    }
  }

  const { formValues, handleChange, handleSubmit } = UseForm(api().login, formValuesInit, onResponse);

  let submit = function (e) {
    e.preventDefault();
    api().getCSRFToken(function () {
      handleSubmit(e);
    });
  }

  return (
    <div className={classes.root}>
    <ThemeProvider theme={theme}>
      <AppBar style={{backgroundColor:"#231F20"}} position="static">
        <Toolbar>
            <a href="/">
                <img alt="logo"  className="logo" src={logo}/>
            </a>
            <Typography variant="h5" style={{color:"#FFFFFF"}} >Couch Potatoes</Typography>
        </Toolbar>
      </AppBar>
      <div>
        <Grid
          container
          component="main"
          direction="column"
          alignItems="center"
          justify="center"
        >
          <CssBaseline />
          <Grid
            item
            className={classes.container}
            xs={4}
            component={Paper}
            elevation={0}
            square
          >
            <div >
              <form
                onSubmit={submit}>
                <TextField
                  className={classes.textfield}
                  variant="outlined"
                  margin="normal"
                  error={isValidCred}
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  value={formValues.username}
                  onChange={handleChange}
                />
                <TextField
                  className={classes.textfield}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  error={isValidCred}
                  label="Password"
                  name="password"
                  type="password"
                  value={formValues.password}
                  onChange={handleChange}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submitbutton}
                >
                  Login
                      </Button>
                <Grid container
                  justify="center"
                  alignItems="center"
                >

                </Grid>
              </form>
            </div>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
   </div>);
}
