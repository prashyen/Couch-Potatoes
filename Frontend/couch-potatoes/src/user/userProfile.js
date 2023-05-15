import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from './../api';
// Styling
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './../mainStyles';
import { makeStyles } from '@material-ui/core/styles';
// Header and Footer
import { MainHeader, Footer } from './../header';
import { useSnackbar } from 'notistack';
// Tabs
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
// Card components
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
//icon buttons
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Button from '@material-ui/core/Button';
import genericPic from './../media/defaultPhoto.png';
import ClearIcon from '@material-ui/icons/Clear';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    minHeight: '100vh',
    padding: theme.spacing(4),
    display: 'flex',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
  },
  capsule: {
    textAlign: 'center',
    border: '1px solid black',
    borderRadius: 10,
    padding: theme.spacing(1),
    backgroundColor: '#231F20',
    color: 'white',
  },
  panel: {
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
  },
  deleteIcon: {
    float: 'right',
    cursor: 'pointer',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  return (
    <div
      className={classes.panel}
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function UserProfile(props) {
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
  useEffect(() => {
    if (getShows) {
      req.getUserShows(function (res) {
        if (res.data.length === 0) {
          setIsEmpty(true);
        }
        let shows = res.data;
        res.data.map((show) => {
          req.getShowImage(show.id, (image) => {
            let index = shows.findIndex(x => x.id === show.id)
            shows[index].image = image.data;
            setShows(shows.slice());
          })
          return 1;
        })
      })
      setGetShows(false);
    }
  }, [getShows]);

  // showId and action = increment/decrement
  function setCount(showId, totalEp, action) {
    const newShows = Object.assign([], shows);
    let index = shows.findIndex(x => x.id === showId)
    let curr_ep = newShows[index].ep_number;
    if (((curr_ep - 1 >= 0) && (action === 'decrement')) ||
      ((curr_ep + 1 <= totalEp) && (action === 'increment'))) {
      if (action === 'increment') {
        newShows[index].ep_number++;
      } else {
        newShows[index].ep_number--;
      }
      setCounter([newShows[index].id, newShows[index].ep_number]);
      setSendPatch(true);
      setShows(newShows);
    }
  }

  useEffect(() => {
    if (sendPatch) {
      let body = { show_id: counter[0], ep_number: counter[1] };
      req.patchUserEp(body, function (res) { });
      setCounter([]);
      setSendPatch(false);
    }
  }, [sendPatch]);

  // total number of Episdoes
  const [totalNoEp, setTotalNoEp] = useState([]);
  useEffect(() => {
    req.getShowTotalEpisodes(function (res) {
      setTotalNoEp(res.data);
    })
  }, [])

  // Series status
  const [seriesStatus, setSeriesStatus] = useState([]);
  useEffect(() => {
    req.getUserShows(function (res) {
      let shows = res.data;
      let entries = [];
      res.data.map((show) => {
        req.getShowInfo(show.id, function (res) {
          let index = shows.findIndex(x => x.id === show.id)
          let entry = { showId: show.id, status: res.data.tvdb.status.name };
          entries.push(entry);
          setSeriesStatus(entries.slice());
        });
        return 1;
      })
    })
  }, [])

  const { enqueueSnackbar } = useSnackbar();
  // Handle completed
  const [completed, setCompleted] = useState(false);
  const [completedShowId, setCompletedShowId] = useState('');
  useEffect(() => {
    if (completed) {
      // Check if show is still airing
      let index = seriesStatus.findIndex(x => x.showId === completedShowId)
      if (seriesStatus[index].status !== 'Continuing') {
        let reqBody = { show_id: completedShowId, status: 2 };
        req.patchUserShowWatchStatus(reqBody, function (response) {
          setCompletedShowId('');
          setCompleted(false);
          setGetShows(true);
          if (response.res.status === 200) {
            enqueueSnackbar(response.data, { variant: "success" });
          } else {
            enqueueSnackbar(response.data, { variant: "error" });
          }
        });
      }
    }
  }, [completed])

  let backendHost = window.location.origin;
  //let backendHost = 'http://127.0.0.1:8000';
  const [propic, setProPic] = useState('');
  useEffect(() => {
    req.getProfilePicture(function (res) {
      if (res.data === 'No Picture Found') {
        setProPic(genericPic);
      } else {
        setProPic(backendHost + res.data);
      }
    });
  }, [])

  const [totalWatchTime, setTotalWatchTime] = useState(0);
  useEffect(() => {
    req.getUserProfile(function (res) {
      let time = res.data.total_watch_time;
      let hours = (time / 60).toString().split('.')[0];
      let minsStr = '0.' + (time / 60).toString().split('.')[1];
      let mins = Math.round(Number(minsStr) * 60);
      let t = hours + "hrs " + mins + "mins";
      setTotalWatchTime(t);
    })
  }, []);
  function isOngoing(id) {
    let index = seriesStatus.findIndex(x => x.showId === id)
    if (index !== -1 && seriesStatus[index].status === 'Continuing') {
      return true
    }
    return false;
  }
  function EpCounter(props) {
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
    return (
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

  function ShowCard(props) {
    const { id, img, title, status, currEp } = props;
    const classes = useStyles();
    // handle delete show
    const [deleted, setDeleted] = useState(false);
    useEffect(() => {
      if (deleted) {
        req.deleteUserShowList(props.id, function (res) {
          setDeleted(false);
          setGetShows(true); // send get request
        })
      }
    }, [deleted])
    function handleDelete() {
      setDeleted(true);
    }

    return (
      <Card className={classes.card}>
        <a href={"/show/" + props.id}>
          <img alt="show poster" className={classes.cover} src={props.img} />
        </a>
        <CardContent className={classes.content}>
          <ClearIcon className={classes.deleteIcon} onClick={handleDelete} />
          <Typography component="h2" variant="h5">
            {props.title}
          </Typography>
          <EpCounter type={props.type} showId={props.id} currEp={props.currEp} />
          {status === 2 ? null :
            isOngoing(props.id) ?
              <Button variant="contained" disableElevation disabled>
                On Going
           </Button> :
              <Button variant="contained" disableElevation onClick={() => {
                setCompletedShowId(props.id);
                setCompleted(true);
              }}>
                Mark As Complete
            </Button>
          }
        </CardContent>
      </Card>
    );
  }

  ShowCard.propTypes = {
    id: PropTypes.any.isRequired,
    img: PropTypes.any.isRequired,
    title: PropTypes.any.isRequired,
    status: PropTypes.any.isRequired, //0 planning, 1 watching, 2 completed
    currEp: PropTypes.any.isRequired,
  };

  return (
    <ThemeProvider theme={theme}>
      <MainHeader />
      <div className={classes.root} >
        {/* User Profile Photo  */}
        <div className={classes.sidebar}>
          <div className={classes.imageCropper}>
            <img className={classes.propic} src={propic} alt="logo" />
          </div>
          <Box className={classes.capsule}>Total Watch Time {totalWatchTime}</Box>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            className={classes.tabs}
          >
            <Tab label="All" {...a11yProps(0)} />
            <Tab label="Watching" {...a11yProps(1)} />
            <Tab label="Completed" {...a11yProps(2)} />
            <Tab label="Plan To Watch" {...a11yProps(3)} />
          </Tabs>
        </div>
        <TabPanel value={value} index={0}>
          <h1>All</h1>
          <Box style={{ display: isEmpty ? 'block' : 'none' }}>
            <p>Currently no shows to view on this page. <br></br>
              Head to your dashboard to start tracking!</p>
          </Box>
          <Box display="flex" flexWrap="wrap">
            {shows.map(show => {
              return <ShowCard id={show.id}
                title={show.name}
                status={show.status}
                img={show.image}
                currEp={show.ep_number} />
            }
            )}
          </Box>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <h1>Currently Watching</h1>
          <Box style={{ display: isEmpty ? 'block' : 'none' }}>
            <p>Currently no shows to view on this page. <br></br>
              Head to your dashboard to start tracking!</p>
          </Box>
          <Box display="flex" flexWrap="wrap">
            {shows.map(show => {
              if (show.status === 1) {
                return <ShowCard id={show.id}
                  title={show.name}
                  status={show.status}
                  img={show.image}
                  currEp={show.ep_number} />
              }
              return (<span></span>);
            }
            )}
          </Box>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <h1>Completed</h1>
          <Box style={{ display: isEmpty ? 'block' : 'none' }}>
            <p>Currently no shows to view on this page. <br></br>
              Head to your dashboard to start tracking!</p>
          </Box>
          <Box display="flex" flexWrap="wrap">
            {shows.map(show => {
              if (show.status === 2) {
                return <ShowCard id={show.id}
                  title={show.name}
                  status={show.status}
                  img={show.image}
                  currEp={show.ep_number} />
              }
              return (<span></span>);
            }
            )}
          </Box>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <h1>Planning to Watch</h1>
          <Box style={{ display: isEmpty ? 'block' : 'none' }}>
            <p>Currently no shows to view on this page. <br></br>
              Head to your dashboard to start tracking!</p>
          </Box>
          <Box display="flex" flexWrap="wrap">
            {shows.map(show => {
              if (show.status === 0) {
                return <ShowCard id={show.id}
                  title={show.name}
                  status={show.status}
                  img={show.image}
                  currEp={show.ep_number} />
              }
              return (<span></span>);
            }
            )}
          </Box>
        </TabPanel>
      </div>
      <Footer />
    </ThemeProvider>);
}
