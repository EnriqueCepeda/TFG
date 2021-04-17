import 'fontsource-roboto';

import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Header } from "./Common"
import { DetailContainer } from './DetailMenu';



const useStyles = makeStyles((theme) => ({
    GridDesigner: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    Content: {
        height: '93%',
        width: '100%',
        overflow: "hidden",
        display: 'flex',
    },
}));

const GridDetail = () => {

    const classes = useStyles();

    return (
        <div className={classes.GridDesigner}>
            <Header title="Grid detail" />
            <DetailContainer />
        </div >
    )
};

export default GridDetail;
