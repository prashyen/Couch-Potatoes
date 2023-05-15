import React, { useState, useEffect } from 'react';
import api from './../api';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
// Card components
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Rating from './rating.js';
import ClearIcon from '@material-ui/icons/Clear';

import genericPic from './../media/defaultPhoto.png';

import handleDelete from './showProfile.js'
const useStyles = makeStyles((theme) => ({
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
  reviewSection:{
    padding: theme.spacing(2),
  },
  deleteIcon: {
    float: 'right',
    cursor: 'pointer',
  },
}));

Review.propTypes = {
  reviewId: PropTypes.any,
  username: PropTypes.any.isRequired,
  comment: PropTypes.any.isRequired,
  rating: PropTypes.any.isRequired,
  timestamp: PropTypes.any.isRequired,
};

export default function Review(props) {
  const { reviewId, username, comment, rating, timestamp} = props;
  const classes = useStyles();
  console.log(props);
  let req = api();

  // let backendHost = window.location.origin;
  let backendHost = 'http://127.0.0.1:8000';
  const [propic, setProPic] = useState('');
  useEffect(()=>{
    req.getUserPicture(username, function(res) {
      if(res.data === 'No Picture Found'){
        setProPic(genericPic);
      } else {
        setProPic(backendHost + res.data);
      }
    });
  },[])

  let d = new Date(timestamp);
  let time = d.getDate().toString() +"/"+ d.getMonth().toString() +
            "/"+ d.getFullYear().toString();
  return(
    <Card className={classes.reviewCard}>
      <CardMedia
        className={classes.propic}
        image={propic}
      />
    <CardContent className={classes.reviewDetails}>
        <ClearIcon className={classes.deleteIcon} onClick={handleDelete}/>
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
