import 'fontsource-roboto';

import React from 'react';
import { makeStyles } from '@material-ui/core';
import { PanelContainer } from './PanelMenu';



const useStyles = makeStyles((theme) => ({
    GridDesigner: {
        height: 'calc(100% - 64px)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    }
}));

const GridBuildingPanels = () => {

    const classes = useStyles();

    return (
        <div className={classes.GridDesigner}>
            <PanelContainer />
        </div >
    )
};

export default GridBuildingPanels;
