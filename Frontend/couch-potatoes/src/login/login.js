import api from './../api';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
//Styling
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import { theme } from './../mainStyles';
import './../css/main.css';
import bg from './../media/background.jpg';
// Components
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { LoginHeader, Footer } from './../header';
import UseForm from './useForm';

export const useStyles = makeStyles((theme) => ({
  root: {
    backgroundImage: `url(${bg})`,
    padding: theme.spacing(20),
    minHeight: '100vh',
    minWidth: 'fit-content',
    width: '100%',
    top: '0px',
    position: 'inherit',    
    backgroundSize: 'contain'
  },
  container: {
    textAlign: 'center',
    borderRadius: '7px',
    padding: '55px',
    boxShadow: '0px 0px 3px #888888 !important',
    paddingTop: '36px',
    paddingBottom: '25px',
    minWidth: '680px',
  },

  btn: {
    marginTop: '25px !important',
  },

  textfield: {
    height: '68px',
  },
}));

export default function Login(props) {
  
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const formValuesInit = {
    username: '',
    password: '',
  };

  const [isValidCred, setIsValidCred] = useState(false);
  let onResponse = (response) => {
    if (response.res.status !== 201) {
      enqueueSnackbar(response.data, {variant: "error"});
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
    <ThemeProvider theme={theme}>
      <LoginHeader />
      <div className={classes.root}>
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
              <Typography component="h1" variant="h5">
                Login
                    </Typography>
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
                  <Grid item className={classes.btn}>
                    <Link to="/signup" variant="body2">
                      Don&apos;t have an account? Sign Up
                          </Link>
                  </Grid>
                </Grid>
              </form>
            </div>
          </Grid>
        </Grid>
      </div>
      <Footer />
    </ThemeProvider>);
}
