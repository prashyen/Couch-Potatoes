import React from 'react';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import PropTypes from 'prop-types';



export default function ErrorModal(props) {
  
  return (
    <div>
      <Modal
        className="error-modal"
        open={props.open}
        onClose={props.handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={props.open}>
          <div className='modal-content'>
            <h2>{props.title}</h2>
            <p>{props.content}</p>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}

ErrorModal.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};