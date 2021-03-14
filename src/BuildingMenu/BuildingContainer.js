import React, { useContext } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Box } from "@material-ui/core"
import { Typography } from '@material-ui/core/';
import BuildingCard from './BuildingCard'
import { useSelector, useDispatch } from 'react-redux'
import { Scrollbars } from 'react-custom-scrollbars';


const useStyles = makeStyles(() => ({
    buildingContainer: {
        flex: 2,
        marginLeft: '10px'
    },
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

function BuildingContainer() {

    const classes = useStyles();
    const buildingList = useSelector(state => state.buildings);

    return (
        <Box className={classes.buildingContainer}>
            <CustomScrollbars autoHide autoHideTimeout={500} autoHideDuration={200}>
                <Typography variant="h5" align="center"> Edificios seleccionados</Typography>
                {
                    Object.keys(buildingList).map((dictkey, index) => (
                        <BuildingCard ol_uid={dictkey} />
                    ))
                }
            </CustomScrollbars>
        </Box >
    )

}

export default BuildingContainer