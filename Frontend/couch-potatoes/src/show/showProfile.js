import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import api from './../api';
import { useSnackbar } from 'notistack';
import {
  useParams
} from "react-router-dom";
// Styling
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './../mainStyles';
import { makeStyles } from '@material-ui/core/styles';
// Font
import Typography from '@material-ui/core/Typography';
import 'fontsource-roboto';
// Structure
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
// Form components
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
// ToggleButton
import ToggleButton from '@material-ui/lab/ToggleButton';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Button from '@material-ui/core/Button';
// Components
import CharCard from './characterCard.js';
import Trailer from './trailer.js';
import ShowRating from './rating.js';
import Rating from '@material-ui/lab/Rating';
import TextField from '@material-ui/core/TextField';
// Header and Footer
import { MainHeader, Footer } from './../header';

import Modal from '@material-ui/core/Modal';
// Card components
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import ClearIcon from '@material-ui/icons/Clear';
import genericPic from './../media/defaultPhoto.png';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    minHeight: '100vh',
    padding: theme.spacing(4),
  },
  sidebar: {
    borderRight: `1px solid ${theme.palette.divider}`,
    minHeight: '100vh',
  },
  box: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  unorderedList: {
    padding: 0,
    margin: 0,
    marginTop: theme.spacing(2),
  },
  toggle: {
    height: '10%',
  },
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  modal: {
    position: 'absolute',
    width: '40vw',
    height: '20vh',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%)`,
  },
  reviewForm: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
  propic: {
    margin: theme.spacing(2),
    borderRadius: '50%',
    width: 100,
    height: 85,
  },
  reviewCard: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(2),
  },
  reviewHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
  reviewDetails: {
    width: '100%',
  },
  reviewSection: {
    padding: theme.spacing(2),
  },
  deleteIcon: {
    float: 'right',
    cursor: 'pointer',
  },
  poster: {
    width: '18vw',
    alignSelf: 'center'

  }
}));


ShowProfile.propTypes = {
  componentId: PropTypes.any,
};

export default function ShowProfile(props) {
  const { componentId } = props;
  let { id } = useParams();
  let showId = id;
  let req = api();
  const classes = useStyles();

  // Show informations
  const [title, setTitle] = useState('');
  const [genres, setGenres] = useState([]); // all the genres
  const [poster, setPoster] = useState('');
  const [totalSeasons, setTotalSeasons] = useState('Unknown');
  const [totalEp, setTotalEp] = useState('Unknown');
  const [avgRuntime, setRuntime] = useState('Unknown');
  const [lang, setLang] = useState('Unknown');
  const [airdays, setAirdays] = useState([]); // array of air days
  const [seriesStatus, setSeriesStatus] = useState('');
  const [firstAired, setFirstAired] = useState('Unknown');
  const [nextAiring, setNextAiring] = useState('Unknown');
  const [lastAired, setLastAired] = useState('N/A');
  const [characters, setCharacters] = useState([]); // array of characters
  const [trailer, setTrailer] = useState([]); // [0] Title [1] embed id
  // Fetch Show details
  useEffect(() => {
    req.getShowInfo(showId, function (res) {
      if (res.data.cpdb !== null) {
        setTitle(res.data.cpdb.name);
        setTotalEp(res.data.cpdb.num_episodes);
        setTotalSeasons(res.data.tvdb.seasons.length);
        setRuntime(Math.round(res.data.cpdb.avg_runtime));
      } else {
        setTitle(res.data.tvdb.name);
      }
      // Store cast information
      let chars = [];
      let i = 0;
      while (i < 20 && res.data.tvdb.characters[i].name !== null) {
        let char = [];
        char.push(res.data.tvdb.characters[i].id);
        char.push(res.data.tvdb.characters[i].name);
        char.push(res.data.tvdb.characters[i].person.name);
        if (res.data.tvdb.characters[i].image !== null) {
          char.push(res.data.tvdb.characters[i].image);
        } else {
          char.push('https://artworks.thetvdb.com' + res.data.tvdb.characters[i].person.image);
        }
        chars.push(char);
        i++;
      }
      if (chars.length !== 0) {
        setCharacters(chars);
        setCastEmpty(false);
      }

      // Store genre
      let genres = [];
      res.data.tvdb.genres.map((genre => {
        genres.push(genre.name);
      }));
      setGenres(genres);

      // Store airdays
      let airdays = [];
      let obj = res.data.tvdb.airsDays;
      for (var day in obj) {
        if (obj[day]) {
          airdays.push(day.charAt(0).toUpperCase() + day.slice(1));
        }
      }
      setAirdays(airdays);
      // other data
      setLang(res.data.tvdb.originalLanguage.toUpperCase());
      setPoster(res.data.tvdb.image);
      setFirstAired(res.data.tvdb.firstAired);
      if (res.data.tvdb.status.name === 'Continuing') {
        setSeriesStatus('Ongoing');
      } else {
        setSeriesStatus(res.data.tvdb.status.name);
      }

      if (res.data.tvdb.status.name === 'Ended') {
        setLastAired(res.data.tvdb.lastAired);
        setNextAiring("[Series ended]");
      } else if (res.data.tvdb.nextAired === '') {
        setNextAiring('Unknown');
      } else {
        setNextAiring(res.data.tvdb.nextAired);
      }
      // Trailer
      if (res.data.tvdb.trailers.length !== 0) {
        let trailerInfo = [];
        trailerInfo.push(res.data.tvdb.trailers[0].name);
        trailerInfo.push(res.data.tvdb.trailers[0].url.split('=')[1]);
        setTrailer(trailerInfo);
      }
    });
  }, []);

  // Watch Status
  const [selected, setSelected] = useState(false); // selection flag
  const [status, setStatus] = useState('');
  const handleChange = (event) => {
    setStatus(event.target.value);
    setSelected(true);
  };
  // Initially set current watch status if any
  useEffect(() => {
    if (status === '') {
      req.getUserShowWatchStatus(showId, function (res) {
        if (res.data.watch_status !== null) {
          if (res.data.watch_status === 0) {
            setStatus('Planning');
          } else if (res.data.watch_status === 1) {
            setStatus('Watching');
          } else if (res.data.watch_status === 2) {
            setStatus('Completed');
          } else {
            setStatus('');
          }
        }
      });
    }
  }, []);
  // update when user selects a new watch status
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (selected) {
      let watchStatus = 0;
      if (status === 'Watching') {
        watchStatus = 1;
      } else if (status === 'Completed') {
        watchStatus = 2;
      }
      let body = { user: Cookies.get('username'), show_id: showId, status: watchStatus };
      // add to user show list
      req.postUserShowList(body, function (res) {
        // if already exists, update list
        if (res.res.status === 201) {
          enqueueSnackbar(res.data, { variant: "success" });
        } else if (res.res.status !== 409) {
          enqueueSnackbar("Uh Oh! Something went wrong.", { variant: "error" });
        }
        if (res.data === 'Show already exists in user list') {
          let reqBody = { show_id: showId, status: watchStatus };
          req.patchUserShowWatchStatus(reqBody, function (response) {
            if (response.res.status === 200) {
              enqueueSnackbar(response.data, { variant: "success" });
            } else {
              enqueueSnackbar(response.data, { variant: "error" });
            }
          });
        }
      });
    }
  }, [status]);

  // Rating
  const [rating, setRating] = useState(0);
  const [getRating, setGetRating] = useState(true);
  useEffect(() => {
    if (getRating) {
      req.getShowRating(showId, function (res) {
        setRating(res.data.rating);
        setGetRating(false);
      });
    }
  }, [getRating]);

  // toggle
  const [expand, setExpand] = useState(true);
  const handleExpand = (event, newValue) => {
    if (expand) {
      setExpand(false);
    } else {
      setExpand(true);
    }
  };

  // Post Review
  // Modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  // Form
  const [userRating, setUserRating] = useState(0);
  const [userComment, setComment] = useState('');
  const [postReview, setPostReview] = useState(false);
  const [getReviews, setGetReviews] = useState(true);
  function handleFormChange(event) {
    setComment(event.target.value);
  }
  function handleSubmit(event) {
    event.preventDefault();
    setPostReview(true); // send post request
    setOpen(false);
  }
  // Post Req
  useEffect(() => {
    if (postReview) {
      let body = { show_id: showId, comment: userComment, rating: userRating };
      req.postReview(body, function (res) {
        setUserRating(0);
        setComment('');
        setGetReviews(true); // fetch new reviews
        setGetRating(true); // fetch ratings
        setReviewEmpty(false);
        setPostReview(false);
      });
    }
  }, [postReview]);

  // Fetch reviews
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    if (getReviews) {
      req.getReviews(showId, function (res) {
        let revs = [];
        let i = 0;
        while (i < res.data.length) {
          let rev = [];
          rev.push(res.data[i].id);
          rev.push(res.data[i].username);
          rev.push(res.data[i].comment);
          rev.push(res.data[i].rating);
          rev.push(res.data[i].last_modified);
          revs.push(rev);
          i++;
        }
        setReviews(revs);
        if (revs.length !== 0) {
          setReviewEmpty(false);
        }
        setGetReviews(false);
      });
    }

  }, [getReviews]);

  // handle delete review
  const [deleted, setDeleted] = useState(false);
  useEffect(() => {
    if (deleted) {
      req.deleteReview(showId, function (res) {
        setDeleted(false);
        setGetReviews(true); // send get request
      })
    }

  }, [deleted])
  function handleDelete() {
    setDeleted(true);
  }

  Review.propTypes = {
    reviewId: PropTypes.any,
    username: PropTypes.any.isRequired,
    comment: PropTypes.any.isRequired,
    rating: PropTypes.any.isRequired,
    timestamp: PropTypes.any.isRequired,
  };

  function Review(props) {
    const { reviewId, username, comment, rating, timestamp } = props;
    const classes = useStyles();
    let req = api();

    // let backendHost = window.location.origin;
    let backendHost = 'http://127.0.0.1:8000';
    const [propic, setProPic] = useState('');
    useEffect(() => {
      req.getUserPicture(username, function (res) {
        if (res.data === null) {
          setProPic(genericPic);
        } else {
          setProPic(backendHost + res.data);
        }
      });
    }, [])

    let d = new Date(timestamp);
    let time = d.getDate().toString() + "/" + d.getMonth().toString() +
      "/" + d.getFullYear().toString();
    return (
      <Card className={classes.reviewCard}>
        <CardMedia
          className={classes.propic}
          image={propic}
        />
        <CardContent className={classes.reviewDetails}>
          <ClearIcon className={classes.deleteIcon} onClick={handleDelete} />
          <div className={classes.reviewHeader}>
            <Typography component="body" variant="body1">
              {props.username}
            </Typography>
            <Typography component="subtitle1" variant="body1" color="textSecondary">
              {time}
            </Typography>
          </div>

          <Typography component="span" variant="body1" color="primary">
            <div className={classes.ratings}>
              <Rating value={props.rating} />
            </div>
          </Typography>
          <Typography component="body" variant="subtitle1" color="primary">
            {props.comment}
          </Typography>
        </CardContent>
      </Card>);
  }
  const [isCastEmpty, setCastEmpty] = useState(true);
  const [isReviewEmpty, setReviewEmpty] = useState(true);
  return (
    <ThemeProvider theme={theme}>
      <MainHeader />
      <div className={classes.root} >
        <Grid container direction="row" justify="center">
          <Grid item xs={3} className={classes.sidebar}>
            <Box className={classes.box}>
              {/* Show Poster  */}
              <img src={poster} alt="TV Show poster" width="200" height="auto" className={classes.poster} />
              {/* Drop down Add to List  */}
              <FormControl className={classes.formControl} margin="normal" size="medium">
                <Select
                  value={status}
                  onChange={handleChange}
                  displayEmpty
                  className={classes.selectEmpty}
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  <MenuItem value="" > Add to List</MenuItem>
                  <MenuItem value={"Watching"}>Watching</MenuItem>
                  <MenuItem value={"Planning"}>Planning</MenuItem>
                  <MenuItem value={"Completed"}>Completed</MenuItem>
                </Select>
                <FormHelperText>Add to List</FormHelperText>
              </FormControl>
              <ul className={classes.unorderedList}>
                <Typography variant="body1" component="h4">
                  Total Number of Seasons: {totalSeasons}
                </Typography>
                <Typography variant="body1" component="h4">
                  Total Number of Episodes: {totalEp}
                </Typography>
                <Typography variant="body1" component="h4">
                  Episode Duration: {avgRuntime} mins
                </Typography>
                <Typography variant="body1" component="h4">
                  Series Status: {seriesStatus}
                </Typography>
                <Typography variant="body1" component="h4">
                  Aired on {airdays.join(', ')}
                </Typography>
                <Typography variant="body1" component="h4">
                  First aired on {firstAired}
                </Typography>
                <Typography variant="body1" component="h4">
                  Next airing on {nextAiring}
                </Typography>
                <Typography variant="body1" component="h4">
                  Last aired on {lastAired}
                </Typography>

              </ul>
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box className={classes.box}>
              <div>
                <h1>{title}</h1>
                <Typography variant="body1" component="h4">
                  Genre : {genres.join(', ')}
                </Typography>
                <Typography variant="body1" component="h4">
                  Language: {lang}
                </Typography>
                <div>
                  <div className={classes.ratings}>
                    <ShowRating value={rating} />
                  </div>
                  <div>
                    <Button variant="contained" color="primary" onClick={handleOpen}>
                      Review
                    </Button>
                    <Modal
                      open={open}
                      onClose={handleClose}
                      aria-labelledby="simple-modal-title"
                      aria-describedby="simple-modal-description"
                    >
                      <div className={classes.modal}>
                        <form className={classes.reviewForm} noValidate autoComplete="off"
                          onSubmit={handleSubmit}>
                          <Rating
                            name="simple-controlled"
                            value={userRating}
                            onChange={(event, newValue) => {
                              setUserRating(newValue);
                            }}
                          />
                          <TextField id="outlined-basic" label="Comment" variant="outlined" required
                            name="comment" value={userComment} onChange={handleFormChange} />
                          <Button type="submit" variant="contained" color="primary"> Submit </Button>
                        </form>
                      </div>
                    </Modal>
                  </div>
                </div>

                <Trailer exists={trailer.length} title={trailer[0]} embedId={trailer[1]} />
              </div>

              <Box display='flex' flexDirection='row' alignItems='baseline' justifyContent='space-between'>
                <h2>Cast</h2>
                <ToggleButton className={classes.toggle} size="small" value="expand" aria-label="expand" onChange={handleExpand}>
                  <ArrowDropDownIcon />
                </ToggleButton>
              </Box>
              <Box style={{ display: isCastEmpty ? 'block' : 'none' }}>
                <p>Sorry we do not have cast information for this show</p>
              </Box>
              <Grid style={{ display: expand ? 'block' : 'none' }} container spacing={4}>{/*Cast Cards*/}
                <Box display="flex" flexWrap="wrap">
                  {characters.map(character => {
                    return <CharCard charId={character[0]}
                      charName={character[1]}
                      actorName={character[2]}
                      image={character[3]} />
                  }
                  )}
                </Box>
              </Grid>

              <Box className={classes.reviewSection}>
                <h2>Review</h2>
                <Box style={{ display: isReviewEmpty ? 'block' : 'none' }}>
                  <p>Currently there are no Reviews for this show <br></br>
                  Post a review!</p>
                </Box>
                {reviews.map(review => {
                  return <Review reviewId={review[0]}
                    username={review[1]}
                    comment={review[2]}
                    rating={review[3]}
                    timestamp={review[4]} />
                }
                )}
              </Box>
            </Box>
            {/*End of Show details*/}

          </Grid>
        </Grid>
      </div>
      <Footer />
    </ThemeProvider>);
}
