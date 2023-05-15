import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
// Card components
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  // Card Styles
  card: {
    flex: '0 1 45%',
    display: 'flex',
    height: '19vh',
    margin: theme.spacing(2),
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 120,    
    backgroundSize: 'contain',
  },
}));

CharCard.propTypes = {
  charId: PropTypes.any,
  charName: PropTypes.any.isRequired,
  actorName: PropTypes.any.isRequired,
  image: PropTypes.any.isRequired,
};

export default function CharCard(props){
    const { charId, charName, actorName, image} = props;
    const classes = useStyles();
    return (
      <Card className={classes.card}>
        <CardMedia
          className={classes.cover}
          image={props.image}
        />
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography component="h5" variant="h5">
              {props.actorName}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {props.charName}
            </Typography>
          </CardContent>
        </div>
      </Card>
    );
}
