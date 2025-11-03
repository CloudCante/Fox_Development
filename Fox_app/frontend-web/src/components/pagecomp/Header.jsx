import React, { memo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';

export const Header = memo(function Header({
  title,
  subTitle,
  titleVariant = 'h4',
  subTitleVariant = 'body1',
  titleColor = 'text.primary',
  subTitleColor = 'text.secondary',
  settings = false,
  settingOnClick,
}) {
  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant={titleVariant} color={titleColor} gutterBottom>
        {title}
      </Typography>

      {(subTitle || settings) && (
        <Box
          sx={subTitle?
              settings?{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1}:{}:
              settings?{
              display: 'flex',
              justifyContent: 'right',
              alignItems: 'right',
              mb: 1}:{}
          }
        >
          {subTitle && (
            <Typography
              variant={subTitleVariant}
              color={subTitleColor}
              gutterBottom
            >
              {subTitle}
            </Typography>
          )}

          {settings && (
            <IconButton
              aria-label="settings"
              size="large"
              onClick={settingOnClick}
            >
              <MiscellaneousServicesIcon />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
});

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  titleVariant: PropTypes.string,
  subTitleVariant: PropTypes.string,
  titleColor: PropTypes.string,
  subTitleColor: PropTypes.string,
  settings: PropTypes.bool,
  settingOnClick: PropTypes.func,
};

export default Header;
