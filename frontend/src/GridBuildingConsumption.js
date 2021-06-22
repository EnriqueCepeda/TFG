import 'fontsource-roboto';

import React from 'react';
import { makeStyles } from '@material-ui/core';
import { ConsumptionContainer } from './ConsumptionMenu';



const useStyles = makeStyles((theme) => ({
    GridDesigner: {
        height: 'calc(100% - 64px)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        marginRight: 10,
    }
}));

const GridBuildingConsumption = () => {

    const classes = useStyles();

    return (
        <div className={classes.GridDesigner}>
            <ConsumptionContainer />
        </div >
    )
};

export default GridBuildingConsumption;
