import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  trailer: {
    marginTop: theme.spacing(2),
  },
}));

Trailer.propTypes = {
  embedId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  exists: PropTypes.any.isRequired,
};

export default function Trailer(props){
  const { embedId, title, exists } = props;
  const classes = useStyles();
  // if trailer array has information then render embeded video
  if (exists !== 0) {
    return(
      <div className={classes.trailer}>
        <iframe
          width="853"
          height="480"
          src={`https://www.youtube.com/embed/${embedId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`Trailer for ${title}`}
        />
      </div>
    );
  }
  return(<div aria-label="no trailer for show found"></div>);
}
