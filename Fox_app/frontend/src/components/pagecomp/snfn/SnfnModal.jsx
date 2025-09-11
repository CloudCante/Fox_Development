import React,{memo} from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography } from '@mui/material';
import { sanitizeText } from '../../../utils/textUtils';

export const SnfnModal= memo(function SnfnModal({
  open,
  onClose,
  stationData,
  codeData,
  allCodeDesc,
  groupByWorkstation,
  style,
  scrollThreshold,
}) {
  const [stationId, secondaryId] = stationData[0];
  const [errorCode, , snList] = codeData;
  const codeKey = stationId + errorCode;
  const codeDisc =
    allCodeDesc.find(([k]) => k === codeKey)?.[1] ?? 'NAN';

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h5">
          {groupByWorkstation
            ? `Workstation ${secondaryId}`
            : `Fixture ${stationId}`}
        </Typography>
        <Typography id="modal-sub-title" variant="subtitle2">
          {groupByWorkstation
            ? `Fixture "${stationId}"`
            : `Workstation "${secondaryId}"`}
        </Typography>

        <Typography id="modal-desc-summary" variant="body1" sx={{ mt: 1 }}>
          Error Code: {errorCode} — {snList.length} serial number
          {snList.length !== 1 && 's'}
        </Typography>

        <Box
          sx={{
            maxHeight: 200,
            overflowY: 'auto',
            mt: 1,
            pr: 1,
          }}
        >
          <Typography id="modal-desc-detail" variant="body2">
            Error Description: {sanitizeText(codeDisc)}
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: 300,
            overflowY: snList.length > scrollThreshold ? 'auto' : 'visible',
            mt: 2,
            pr: 1,
          }}
        >
          {snList.map(([sn, pn], idx) => (
            <Box key={sn + idx} mb={1}>
              <strong>SN:</strong> {sn}
              <br />
              – {pn}
            </Box>
          ))}
        </Box>
      </Box>
    </Modal>
  );
})
SnfnModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  stationData: PropTypes.array.isRequired,    // [[id, secondary], …]
  codeData: PropTypes.array.isRequired,       // [code, count, snList]
  allCodeDesc: PropTypes.array.isRequired,    // [[key, desc], …]
  groupByWorkstation: PropTypes.bool.isRequired,
  style: PropTypes.object.isRequired,
  scrollThreshold: PropTypes.number,
};

SnfnModal.defaultProps = {
  scrollThreshold: 5,
};
export default memo(SnfnModal);