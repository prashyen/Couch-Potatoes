import PropTypes from 'prop-types';
// Ratings
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';

ShowRating.propTypes = {
  showId: PropTypes.any,
  value: PropTypes.number.isRequired,
};

export default function ShowRating(props) {
  const { showId, value, } = props;
  let remainder = 5-value;
  let stars = [];
  for (var i = 0; i < value; i++) {
    stars.push(<StarIcon />);
  }
  for (var j = 0; j < remainder; j++) {
    stars.push(<StarBorderIcon />);
  }
  return stars;
}
