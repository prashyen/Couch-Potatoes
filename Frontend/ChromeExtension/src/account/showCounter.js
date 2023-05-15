import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from './../Api';
// Styling
import { ThemeProvider } from '@material-ui/core/styles';
import {theme} from './../mainStyles';
import { makeStyles } from '@material-ui/core/styles';
// Card components
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
//icon buttons
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Button from '@material-ui/core/Button';
// Extension Layout
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import logo from './../potato.png';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    width: 320,
    height: 430,
    border: '1px solid black',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
  },
  panel:{
    width: '100%',
  },
  imageCropper: {
    width: 200,
    height: 200,
    padding: theme.spacing(2),
  },
  propic: {
    display: 'inline',
    margin: '0 auto',
    height: '100%',
    width: '100%',
    borderRadius: '50%',
  },
  // Card Styles
  card: {
    flex: '0 1 45%',
    display: 'flex',
    margin: theme.spacing(2),
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 100,
    height: '100%',
  },
  action: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    border: '1px solid black',
    borderRadius: 5,
  },
}));

export default function ShowCounter(props){
  const classes = useStyles();
  let req = api();
  const [value, setValue] = useState(0);
  const [shows, setShows] = useState([]);
  // store count for patch req
  const [counter, setCounter] = useState([]); // [0] showId [1] currEp
  // flag for sending patch req
  const [sendPatch, setSendPatch] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // flag for getting user shows
  const [getShows, setGetShows] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  useEffect(()=>{
    if (getShows) {
      req.getUserShows(function (res) {
        if(res.data.length === 0){
          setIsEmpty(true);
        }
        console.log(res.data);
        setShows(res.data);
      })
      setGetShows(false);
    }
  },[getShows]);

  // showId and action = increment/decrement
  function setCount(showId, totalEp, action){
    const newShows = Object.assign([], shows);
    let index = shows.findIndex(x => x.id === showId)
    let curr_ep =  newShows[index].ep_number;
    if(((curr_ep-1 >= 0) && (action==='decrement')) ||
       ((curr_ep+1 <= totalEp) && (action==='increment'))){
      if(action==='increment'){
        newShows[index].ep_number++;
      } else {
        newShows[index].ep_number--;
      }
      setCounter([newShows[index].id ,newShows[index].ep_number]);
      setSendPatch(true);
      setShows(newShows);
    }
  }

  useEffect(()=>{
    if(sendPatch){
      let body = {show_id: counter[0], ep_number: counter[1]};
      req.patchUserEp(body, function(res){console.log(res);});
      setCounter([]);
      setSendPatch(false);
    }
  },[sendPatch]);

  // total number of Shows
  const [totalNoEp, setTotalNoEp] = useState([]);
  useEffect(()=> {
    req.getShowTotalEpisodes(function(res) {
      setTotalNoEp(res.data);
    })
  },[])

  // Series status
  const [seriesStatus, setSeriesStatus] = useState('');
  useEffect(()=>{
    req.getUserShows(function (res) {
      let shows = res.data;
      let entries = [];
      res.data.map((show) => {
        req.getShowInfo(show.id, function(res){
          let index = shows.findIndex(x => x.id === show.id)
          let entry = {showId: show.id, status: res.data.tvdb.status.name};
          entries.push(entry);
          setSeriesStatus(entries.slice());
        });
       return 1;
      })
    })
  },[])
  const handleLogout = () => {
    req.logout(
      function (response) {
        if (response.res.status !== 200) {
          console.log("error logout");
        } else {
          window.location.href = "/login";
        }
      }
    )
  }

  function EpCounter(props){
    const { showId, currEp, status } = props;
    const classes = useStyles();

    let currentEp = 0;
    let totalEp = 0;
    if (shows.length !== 0) {
      let index = shows.findIndex(x => x.id === showId);
      currentEp = shows[index].ep_number;
    }
    if (totalNoEp.length !== 0) {
      totalEp = totalNoEp.[showId];
    }
    return(
      <div className={classes.action}>
        <IconButton aria-label="decrement" onClick={() => setCount(props.showId, totalEp, 'decrement')}>
          <RemoveIcon />
        </IconButton>
        <Typography component="span" variant="body1">
          Episode {currentEp} / {totalEp}
        </Typography>
        <IconButton aria-label="increment" onClick={() => setCount(props.showId, totalEp, 'increment')}>
          <AddIcon />
        </IconButton>
      </div>
    );
  }
  EpCounter.propTypes = {
    showId: PropTypes.any.isRequired,
    currEp: PropTypes.any.isRequired,
    status: PropTypes.any.isRequired,
  };
  const [show, setShow] = useState('');
  function handleShowSelection(event) {
    let showId = event.target.value;
    let index = shows.findIndex(x => x.id === showId);
    setShow(shows[index]);
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
      <Grid container style={{padding:'28px'}} justify="center" direction="column">
        <Grid item xs={12} style={{paddingBottom:'18px'}}>
            <TextField
            id="outlined-select-currency"
            select
            label="Select"
            fullWidth
            helperText="Show:"
            variant="outlined"
            onChange={handleShowSelection}
          >
          {shows.map((show) => (
            <MenuItem key={show.name} value={show.id}>
              {show.name}
            </MenuItem>
          ))}
          </TextField>
        </Grid>
        <Grid item xs={12} style={{paddingBottom:'18px'}}>
          {show !== ''?<EpCounter type={show.status}
                           showId={show.id}
                           currEp={show.ep_number}/>:<span></span>}
        </Grid>
        <Button variant="contained" color="primary" onClick={handleLogout}>Logout</Button>
      </Grid>
    </ThemeProvider>
  </div>
  );
}
