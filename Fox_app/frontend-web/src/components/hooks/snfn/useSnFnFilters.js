// hooks/useSnFnFilters.js
import { useState, useCallback, useMemo } from 'react';

export function useSnFnFilters(allStations, allErrorCodes, allModels,groupByWorkstation) {
    const [stationFilter, setStationFilter] = useState([]);
    const [errorCodeFilter, setErrorCodeFilter] = useState([]);
    const [modelFilter, setModelFilter] = useState([]);
    const [searchStations, setSearchStations] = useState('');
    const [searchErrorCodes, setSearchErrorCodes] = useState('');
    const [searchModels, setSearchModels] = useState('');

    const onStationChange = useCallback(e => {
        const v = e.target.value;
        if (v.includes('__CLEAR__')) setStationFilter([]);
        else setStationFilter(v);
    }, []);
    const onSearchStations = useCallback(e => {
        setSearchStations(e.target.value);
    }, []);
    const onErrorCodeChange = useCallback(e => {
        const v = e.target.value;
        if (v.includes('__CLEAR__')) setErrorCodeFilter([]);
        else setErrorCodeFilter(v);
    }, []);
    const onSearchErrorCodes = useCallback(e => {
        setSearchErrorCodes(e.target.value);
    }, []);
    const onModelChange = useCallback(e => {
        const v = e.target.value;
        if (v.includes('__CLEAR__')) setModelFilter([]);
        else setModelFilter(v);
    }, []);
    const onSearchModels = useCallback(e => {
        setSearchModels(e.target.value);
    }, []);

    const filters = useMemo(() => [
        { id:groupByWorkstation ? 'Workstations' : 'Fixtures',
            label:groupByWorkstation ? 'Workstations' : 'Fixtures',
             allOptions:allStations, selectedOptions:stationFilter, onChange:onStationChange, searchValue:searchStations, onSearchChange:onSearchStations },
        { id:'Error Codes',label:'Error Codes', allOptions:allErrorCodes, selectedOptions:errorCodeFilter, onChange:onErrorCodeChange, searchValue:searchErrorCodes, onSearchChange:onSearchErrorCodes },
        { id:'Models',label:"Models", allOptions:allModels, selectedOptions:modelFilter, onChange:onModelChange, searchValue:searchModels, onSearchChange:onSearchModels },
    ], [allStations, allErrorCodes, allModels, stationFilter, errorCodeFilter, modelFilter, searchStations, searchErrorCodes, searchModels]);

    return {
        stationFilter, errorCodeFilter, modelFilter,
        searchStations, searchErrorCodes, searchModels,
        onStationChange, onSearchStations, onErrorCodeChange,onSearchErrorCodes, onSearchModels, onModelChange,
        filters
    };
}
