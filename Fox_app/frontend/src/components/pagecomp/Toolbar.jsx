// Global Variable Toolbar for Dashboard
// import { MultiMenu } from '../MultiMenu.jsx';
// import { MultiFilter } from '../MultiFilter.jsx';
// import { DateRange } from '../DateRange.jsx'
// import { NumberRange } from '../NumberRange.jsx';
import React,{useContext, useMemo} from 'react';
import { Box, Button, Typography } from '@mui/material';
import { toolbarStyle } from '../theme/themes.js';
import { GlobalSettingsContext } from '../../data/GlobalSettingsContext.js';


export function Toolbar({
    toolbox=[]
}) {
    //const [toolbox,setToolbox] = useState([])
    const {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        barLimit,
        setBarLimit,
        weekRange,
        handlePrevWeek,
        handleNextWeek
    } = useContext(GlobalSettingsContext);

    // Build a props‐lookup for each toolId
    const toolProps = useMemo(() => ({
        'date-range': {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        inline: true,
        },
        'bar-limit': {
        value: barLimit,
        onChange: setBarLimit,
        },
        'week-range': {
        weekRange,
        onPrev: handlePrevWeek,
        onNext: handleNextWeek,
        },
        // you can add more tool‐to‐props mappings here
    }), [
        startDate, endDate, setStartDate, setEndDate,
        barLimit, setBarLimit,
        weekRange, handlePrevWeek, handleNextWeek
    ]);

    if(!Array.isArray(toolbox) || toolbox.length === 0){
        return;
    };

    return (
        <Box sx={toolbarStyle} >
            {toolbox.map(({id,Part})=>{
                const props = toolProps[id] || {}
                return <Part key={id} {...props}/>
            })}
        </Box>
    );
}
