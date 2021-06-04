import 'fontsource-roboto';

import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Header } from "./Common"
import { ConsumptionContainer } from './ConsumptionMenu';



const useStyles = makeStyles((theme) => ({
    GridDesigner: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    }
}));

const GridBuildingConsumption = () => {

    const classes = useStyles();

    return (
        <div className={classes.GridDesigner}>
            <Header title="Building Panels" />
            <ConsumptionContainer />
        </div >
    )
};

export default GridBuildingConsumption;
