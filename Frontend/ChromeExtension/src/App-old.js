import './App.css';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import logo from './potato.png';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

const statuses = [
  {
    value: '0',
    label: 'Planning',
  },
  {
    value: '1',
    label: 'Watching',
  },
  {
    value: '2',
    label: 'Completed',
  },
];

function App() {
  return (
    <div>
    <AppBar style={{backgroundColor:"#231F20"}} position="static">
    <Toolbar>
        <a href="/">
            <img alt="logo"  className="logo" src={logo}/>
        </a>
        <Typography variant="h5" style={{color:"#FFFFFF"}} >Couch Potatoes</Typography>
    </Toolbar>
    </AppBar>
    <Grid container style={{padding:'28px'}} justify="center" direction="column">
      <Grid item xs={12} style={{paddingBottom:'18px'}}>
          <TextField
          id="outlined-select-currency"
          select
          label="Select"
          fullWidth
          helperText="Show:"
          variant="outlined"
        >
          {statuses.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} style={{paddingBottom:'18px'}}>
          <TextField
          id="outlined-select-currency"
          select
          fullWidth
          label="Select"
          helperText="Status:"
          variant="outlined"
        >
          {statuses.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            style={{backgroundColor:"#231F20", color:"white"}}
            className = "submit-button"
            href="/"
          >
              Login
          </Button>
      </Grid>
    </Grid>
   </div>
  );
}

export default App;
