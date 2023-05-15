import api from './../api';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
// Styling
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './../mainStyles';
import './../css/main.css';
import { makeStyles } from '@material-ui/core/styles';
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

const useStyles = makeStyles((theme) => ({
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
  textfield: {
    height: '68px',
  },
  btn: {
    marginTop: '25px !important',
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
}));

export default function Signup(props) {
  const classes = useStyles();

  const formValuesInit = {
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  };

  const [isValidCred, setIsValidCred] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const { enqueueSnackbar } = useSnackbar();
  const handlePhotoChange = (event, newValue) => {
    setProfilePhoto(event.target.files[0]);
  };

  let onResponse = (response) => {
    if (response.res.status !== 201) {
      enqueueSnackbar(response.data, {variant: "error"});
      setIsValidCred(true);
    } else {
      window.location.href = "/";
    }
  }

  const { formValues, handleChange, handleSubmit } = UseForm(api().signup, formValuesInit, onResponse);
  const [isPassMatch, setIsPassMatch] = useState(true);

  let submit = function (e) {
    e.preventDefault();
    setIsPassMatch(true);
    if (formValues.password !== formValues.confirmPassword) {
      setIsPassMatch(false);
    } else {
      api().getCSRFToken(function () {
        handleSubmit(e, profilePhoto);
      });
    }
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
              <Typography component="h1" variant="h5"> Sign Up!</Typography>
              <form onSubmit={submit}>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <TextField
                      className={classes.textfield}
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      label="First Name"
                      name="first_name"
                      error={isValidCred}
                      value={formValues.first_name}
                      onChange={handleChange}
                    />
                    <TextField
                      className={classes.textfield}
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      label="Last Name"
                      name="last_name"
                      error={isValidCred}
                      value={formValues.last_name}
                      onChange={handleChange}
                    />
                    <TextField
                      className={classes.textfield}
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      inputProps={{ pattern: ".{8,}" }}
                      helperText="Password must be minimum 8 characters"
                      error={isValidCred}
                      value={formValues.password}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      className={classes.textfield}
                      variant="outlined"
                      margin="normal"
                      type="email"
                      required
                      fullWidth
                      label="Email"
                      name="email"
                      error={isValidCred}
                      value={formValues.email}
                      onChange={handleChange}
                    />
                    <TextField
                      className={classes.textfield}
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      label="Username"
                      name="username"
                      error={isValidCred}
                      value={formValues.username}
                      onChange={handleChange}
                    />
                    {!isPassMatch ?
                      <TextField
                        className={classes.textfield}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        error
                        helperText="Passwords don't match"
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formValues.confirmPassword}
                        onChange={handleChange}
                      /> :
                      <TextField
                        className={classes.textfield}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        error={isValidCred}
                        value={formValues.confirmPassword}
                        onChange={handleChange}
                      />
                    }
                  </Grid>
                </Grid>
                <TextField
                  className={classes.textfield}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Profile picture"
                  name="profilePhoto"
                  type="file"
                  onChange={handlePhotoChange}
                  inputProps={{
                    accept: 'image/*'
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Button type="submit" fullWidth variant="contained"
                  color="primary" className={classes.btn}>
                  Sign Up
                      </Button>
                <Grid container justify="center" alignItems="center">
                  <Grid item className={classes.btn}>
                    <Link to="/login" variant="body2">
                      Already a member? Login
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
