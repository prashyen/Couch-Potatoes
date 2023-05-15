import React, { useEffect } from 'react';
import api from './../api';
import Cookies from 'js-cookie';
import { useSnackbar } from 'notistack';
// Styling
import { theme } from './../mainStyles';
import { ThemeProvider, fade, makeStyles } from '@material-ui/core/styles';
import noImage from './../media/NoImage.jpg';
import bg from './../media/dashBackground.jpg';
// Components
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
// local components
import { MainHeader, Footer } from './../header';
import ErrorModal from './errorModal';

const UseStyles = makeStyles((theme) => ({
     root: {
          backgroundImage: `url(${bg})`,    
          backgroundSize: 'contain',
          backgroundAttachment: 'fixed',
     },
     body: {
          backgroundColor: '#00000080',
          marginLeft: '10vw',
          marginRight: '10vw',
          padding: '3%',
          minHeight: '79.5vh',
     },
     search: {
          position: 'relative',
          borderRadius: theme.shape.borderRadius,
          backgroundColor: fade(theme.palette.common.white, 0.15),
          '&:hover': {
               backgroundColor: fade(theme.palette.common.white, 0.25),
          },
          marginRight: theme.spacing(2),
          marginLeft: 0,
          width: '100% !important',
          [theme.breakpoints.up('sm')]: {
               marginLeft: theme.spacing(3),
               width: 'auto',
          },
     },
     searchIcon: {
          padding: '6px',
          paddingLeft: '13px',
          height: '100%',
          position: 'absolute',
     },
     inputRoot: {
          color: 'white',
     },
     inputInput: {
          padding: '8px',
          paddingLeft: '50px',

     },
     banner: {
          width: '100%',
          height: '90%',
          border: '2px solid white',
     },
     item: {
          transition: '0.1s',
          height: 'fit-content',
          position: 'relative',
          "&:hover": {
               transform: 'scale(1.15)',
          }
     },
     itemName: {
          height: 'fit-content',
          textAlign: '-webkit-center',
          fontWeight: 'bold',
          color: 'white',
     },
     groupedTitle: {
          fontSize: '300%',
          color: 'white',
          transformOrigin: 'center',
          padding: '20px',
          fontFamily: 'fantasy',
     },
     addShowBtn: {
          width: '12%',
     },
     searchBar: {
          borderRadius: '10px',
     },
     showLink: {
          textDecoration: 'none',
     },
     loader: {
          left: '48%',
          position: 'absolute',
          top: '50%',
     },
     noShowText: {
          color: 'white',
          paddingLeft: '36px',

     },
     plusBtn :{
          position: 'absolute',
          top: '6%',
          left:'9%',
     }
}));

export default function Dashboard(props) {
     const classes = UseStyles();
     let req = api();
     const [openModal, setOpenModal] = React.useState(false);
     const [searchQuery, setSearchQuery] = React.useState('');
     const [searchedShows, setSearchedShows] = React.useState([]);
     const [userShows, setUserShows] = React.useState(null);
     const [allUserShows, setAllUserShows] = React.useState([]);
     const [popularShows, setPopularShows] = React.useState([]);
     const [ratedShows, setRatedShows] = React.useState([]);
     const [currentlySearching, setCurrentlySearching] = React.useState(false);

     const { enqueueSnackbar } = useSnackbar();

     const handleModalClose = () => {
          setOpenModal(false);
     };
     useEffect(() => {
          update();
     }, []);

     function updateRecentShows(){
          req.getUserShows(function (resp) {
               let shows = resp.data;
               let showIds = [];
               resp.data.map((show) => {
                    req.getShowImage(show.id, (res) => {
                         let index = shows.findIndex(x => x.id === show.id)
                         shows[index].image = res.data;
                         setUserShows(shows.slice(0, 6));
                    })
                    showIds.push(show.id)
                    return 1;
               })
               setAllUserShows(showIds);
               if (shows.length === 0) {
                    setUserShows([]);
               }
          })
     }
     function update(){
          updateRecentShows();
          req.getPopularShows(function (resp) {
               let shows = resp.data;
               resp.data.map((show) => {
                    req.getShowImage(show.show_id, (res) => {
                         let index = shows.findIndex(x => x.show_id === show.show_id)
                         shows[index].image = res.data;
                         setPopularShows(shows.slice());
                    })
                    return 1;
               })
          })
          req.getHighlyRatedShows(function (resp) {
               let shows = resp.data;
               resp.data.map((show) => {
                    req.getShowImage(show.show_id, (res) => {
                         let index = shows.findIndex(x => x.show_id === show.show_id)
                         shows[index].image = res.data;
                         setRatedShows(shows.slice());
                    })
                    return 1;
               })
          })
     }
     function addShow(showId) {
          let body = { user: Cookies.get('username'), show_id: showId, status: 0 }
          // add to user show list
          req.postUserShowList(body, function (res) {
               if (res.res.status === 201) {
                    enqueueSnackbar(res.data, {variant: "success"});
                    updateRecentShows();
               } else {
                    enqueueSnackbar(res.data, {variant: "error"});
               }
          })
     }
     function submitSearch(e) {
          if (e.keyCode === 13) {
               setSearchedShows([])
               setPopularShows([])
               setRatedShows([]);
               setUserShows(null)
               setSearchQuery(e.target.value);
               if (e.target.value !== '') {
                    setCurrentlySearching(true);
                    req.search(e.target.value,
                         function (res) {
                              setSearchedShows(res.data.slice())
                              setCurrentlySearching(false);
                         })
               } else if (e.target.value === '') {
                    update();
                    setSearchedShows([])
               }
          }
     }

     return (
          <ThemeProvider theme={theme}>
               <MainHeader />
               <div className={classes.root}>
                    <div className={classes.body} >
                         <ErrorModal
                              handleClose={handleModalClose}
                              title={"Adblocker Enabled?"}
                              content={"Please ensure adblock is turned off"}
                              open={openModal}>
                         </ErrorModal>
                         <AppBar position="static" className={classes.searchBar}>
                              <Toolbar>
                                   <div className={classes.search}>
                                        <div className={classes.searchIcon}>
                                             <SearchIcon />
                                        </div>
                                        <InputBase
                                             style={{ width: '100%' }}
                                             placeholder="Search…"
                                             onKeyUp={submitSearch}
                                             classes={{
                                                  root: classes.inputRoot,
                                                  input: classes.inputInput,
                                             }}
                                        />
                                   </div>
                              </Toolbar>
                         </AppBar>
                         {currentlySearching ? <CircularProgress color="secondary" size={100} className={classes.loader} />
                              :
                              (searchQuery === '' ?
                                   (
                                   <div>
                                        <div className={classes.groupedTitle}>My Recent Shows</div>
                                        <Grid container justify="flex-start" spacing={3} wrap='wrap' style={{ marginBottom: '35px' }}>
                                             {userShows != null ?
                                                  userShows.length !== 0 ?
                                                       <Grid container justify="flex-start" spacing={3} wrap='wrap' style={{ marginBottom: '35px' }}>
                                                            {userShows.map((show) => (
                                                                 <Grid key={show.id} className={classes.item} item md={2} xs={6}>
                                                                      <a className={classes.showLink} href={"/show/" + show.id} >
                                                                           {show.image == null ?
                                                                           <img className={classes.banner} src={noImage} alt="Show Poster"/>
                                                                           :<img alt="Show Poster" className={classes.banner} src={show.image} onError={(e) => { e.target.onerror = null; e.target.src = noImage }} alt={show.name} />}
                                                                           <div className={classes.itemName}> {show.name}</div>
                                                                      </a>
                                                                 </Grid>
                                                            ))}
                                                       </Grid>
                                                       :
                                                       <p className={classes.noShowText}>No Shows Found, start tracking!</p>

                                                  :
                                                  <Grid container justify="center" size={75} spacing={3} wrap='wrap' style={{ marginBottom: '35px' }}>
                                                       <CircularProgress color="secondary" />
                                                  </Grid>
                                             }
                                        </Grid>
                                        <div className={classes.groupedTitle}>Most Popular Shows</div>
                                        { popularShows ?
                                             popularShows.length !== 0 ?
                                                  <Grid container justify="flex-start" spacing={3} wrap='wrap' style={{ marginBottom: '35px' }}>
                                                       {popularShows.map((show) => (
                                                            <Grid key={show.id} className={classes.item} item md={2} xs={6}>
                                                                 <a className={classes.showLink} href={"/show/" + show.show_id} >
                                                                      <img className={classes.banner} src={show.image} onError={(e) => { e.target.onerror = null; e.target.src = noImage }} alt={show.name} />
                                                                      <div className={classes.itemName}> {show.name}</div>
                                                                 </a>
                                                                 {!allUserShows.includes(show.show_id.toString()) && show.image ? <Fab  className={classes.plusBtn} size="small" color="primary" onClick={()=>addShow(show.show_id)}>
                                                                      <AddIcon />
                                                                 </Fab> : null}
                                                            </Grid>
                                                       ))}
                                                  </Grid>
                                                  :
                                                  <Grid container justify="center" size={75} spacing={3} wrap='wrap' style={{ marginBottom: '35px' }}>
                                                       <CircularProgress color="secondary" />
                                                  </Grid>
                                             :
                                             <p className={classes.noShowText}>No Shows Found</p>
                                        }
                                        <div className={classes.groupedTitle}>Highly Rated Shows</div>
                                        { ratedShows ?
                                             ratedShows.length !== 0 ?
                                                  <Grid container justify="flex-start" spacing={3} wrap='wrap' style={{ marginBottom: '35px' }}>
                                                       {ratedShows.map((show) => (
                                                            <Grid key={show.id} className={classes.item} item md={2} xs={6}>
                                                                 <a className={classes.showLink} href={"/show/" + show.show_id} >
                                                                      <img className={classes.banner} src={show.image} onError={(e) => { e.target.onerror = null; e.target.src = noImage }} alt={show.name} />

                                                                      <div className={classes.itemName}> {show.name}</div>
                                                                 </a>
                                                                 {!allUserShows.includes(show.show_id.toString()) && show.image ? <Fab className={classes.plusBtn} size="small" color="primary" onClick={()=>addShow(show.show_id)}>
                                                                      <AddIcon />
                                                                 </Fab> : null}
                                                            </Grid>
                                                       ))}
                                                  </Grid>
                                                  :
                                                  <Grid container justify="center" size={75} spacing={3} wrap='wrap' style={{ marginBottom: '35px' }}>
                                                       <CircularProgress color="secondary" />
                                                  </Grid>
                                             :
                                             <p className={classes.noShowText}>No Shows Found</p>
                                        }
                                   </div>)
                                   :
                                   (<Grid container justify="flex-start" spacing={2} wrap='wrap' style={{ marginBottom: '35px', marginTop: '40px' }}>
                                        {searchedShows.length === 0 ? <p className={classes.noShowText}>No Shows Found</p> : null}
                                        {searchedShows.map((show) => (
                                             <Grid key={show.tvdb_id} className={classes.item} item md={2} xs={6}>
                                                  <a className={classes.showLink} href={"/show/" + show.tvdb_id} >
                                                       <img className={classes.banner} src={show.image_url} onError={(e) => { e.target.onerror = null; e.target.src = noImage }} alt={show.name} />
                                                       <div className={classes.itemName}> {show.name}</div>
                                                  </a>
                                                  {!allUserShows && !allUserShows.includes(show.tvdb_id.toString())(show.tvdb_id) && show.image ? <Fab className={classes.plusBtn} size="small" color="primary" onClick={()=>addShow(show.tvdb_id)}>
                                                       <AddIcon />
                                                  </Fab> : null}
                                             </Grid>
                                        ))}
                                   </Grid>)
                              )
                         }
                    </div>
               </div>
               <Footer style={{ position: 'inherit !important' }} />
          </ThemeProvider>);

}
