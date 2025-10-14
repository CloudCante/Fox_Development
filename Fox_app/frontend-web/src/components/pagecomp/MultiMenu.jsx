// MultiMenu.jsx
import React, { memo} from 'react';
import { Divider, Menu, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';
 

export const MultiMenu = memo(function MultiMenu({ anchorEl, open, onClose, buttonData=[],'aria-label':arialabel='Menu options'}) {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose} MenuListProps={{'aria-label':arialabel, role:'menu'}}>
        {buttonData.map((item, idx) => {
          if(item.divider){
            return<Divider key={item.id || `divider-${idx}`}/>
          }
          const { handleClick, label, itemDisabled = false, id } = item;
          const itemKey = id || `item-${idx}`;
          return(
            <MenuItem
              key={itemKey}
              onClick={(e) => {
                if(typeof handleClick ==='function'){
                  handleClick(e);
                }
                onClose();          // close the menu after click
              }}
              disabled={itemDisabled}
            >
              {label}
            </MenuItem>
          )
        })}
    </Menu>
  );
})
MultiMenu.propTypes = {
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  buttonData: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string.isRequired,
        handleClick: PropTypes.func,
        itemDisabled: PropTypes.bool,
        divider: PropTypes.bool,
      }),
    ])
  )
};
export default MultiMenu;