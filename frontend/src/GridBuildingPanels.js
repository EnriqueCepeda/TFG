import 'fontsource-roboto';

import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Header } from "./Common"
import { PanelContainer } from './PanelMenu';



const useStyles = makeStyles((theme) => ({
    GridDesigner: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    }
}));

const GridBuildingPanels = () => {

    const classes = useStyles();

    return (
        <div className={classes.GridDesigner}>
            <Header title="Grid Panels" />
            <PanelContainer />
        </div >
    )
};

export default GridBuildingPanels;
