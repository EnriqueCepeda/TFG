import React, { useContext } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core/';
import BuildingCard from './BuildingCard'
import { useSelector, useDispatch } from 'react-redux'
import { Scrollbars } from 'react-custom-scrollbars';
import Button from '@material-ui/core/Button';
import { Divider } from '@material-ui/core';
import {
    Link
} from "react-router-dom";


const useStyles = makeStyles(() => ({
    buildingContainer: {
        flex: 2,
        display: 'flex',
        flexDirection: "column",
    },
    buildingList: {
        flex: 12
    },
    buildingDetailButton: {
        flex: 1,
        height: "100%",
        width: "100%"
    }
}));

const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
        borderRadius: 6,
        backgroundColor: 'rgba(35, 49, 86, 0.8)'
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
};

const CustomScrollbars = props => (
    <Scrollbars
        renderThumbHorizontal={renderThumb}
        renderThumbVertical={renderThumb}
        {...props}
    />
);

function BuildingContainer({ centerSetter, zoomSetter }) {

    const classes = useStyles();
    const buildingList = useSelector(state => state.buildings);

    return (
        <div className={classes.buildingContainer}>
            <div className={classes.buildingList}>
                <CustomScrollbars autoHide autoHideTimeout={500} autoHideDuration={200}>
                    <Typography variant="h5" align="center"> SELECTED BUILDINGS </Typography>
                    <Divider variant="middle" />
                    {
                        Object.keys(buildingList).map((dictkey, index) => (
                            <React.Fragment key={dictkey}>
                                <BuildingCard ol_uid={dictkey} centerSetter={centerSetter} zoomSetter={zoomSetter} />
                            </React.Fragment>
                        ))
                    }
                </CustomScrollbars>
            </div>
            <div className={classes.buildingDetailButton}>
                <Button color="primary" component={Link} to="/detail" fullWidth={true}>
                    grid detail
                </Button>
            </div>

        </div >

    )

}

export default BuildingContainer