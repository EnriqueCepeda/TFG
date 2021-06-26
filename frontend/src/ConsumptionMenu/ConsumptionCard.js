import React, { useState } from "react";
import { Card, Divider, Typography, makeStyles } from '@material-ui/core';
import { PurpleTypography } from "../Common";
import ConsumptionSlider from "./ConsumptionSlider";
import { useSelector } from 'react-redux'
import BuildingDataCard from "./BuildingDataCard";
import { getBuildingConsumption } from "../redux/selectors"
import _ from "lodash";
import CountUp from "react-countup"

const useStyles = makeStyles(() => ({
    consumptionCard: {
        minWidth: "auto",
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 10,
        display: "inline-block",
    },
    cardHeader: {
        flexGrow: 1,
    },
    cardContent: {
        display: "flex",
        marginRight: 10,
    },
    sliders: {
        display: "flex",
        height: "25vh",
        margin: "15px 0px 15px 25px",
    },
    graph: {
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        width: 160,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around"
    },
    energyQuantity: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    }

}));

export default function ConsumptionCard({ ol_uid }) {

    const buildingConsumption = useSelector((state) => getBuildingConsumption(state, ol_uid));
    const [lastConsumption, setLastConsumption] = useState(0);
    const [lastMeanConsumption, setLastMeanConsumption] = useState(0);
    const classes = useStyles();

    function getHourSliders() {
        let sliders = [];
        for (let i = 0; i <= 23; i++) {
            var marginTitle = 3;
            if (i <= 9) {
                marginTitle = 8;
            }
            sliders.push(<React.Fragment key={i}> <ConsumptionSlider ol_uid={ol_uid} hour={i}
                marginTitle={marginTitle} initialValue={buildingConsumption[i]}
                lastTotalConsumptionSetter={setLastConsumption}
                lastMeanConsumptionSetter={setLastMeanConsumption} />
            </React.Fragment >)
        }
        return sliders
    }

    return (
        <Card variant="outlined" className={classes.consumptionCard}>
            <div className={classes.cardContent}>
                <BuildingDataCard building_id={ol_uid} />
                <div className={classes.sliders}>
                    {getHourSliders()
                    }
                </div>
                <Divider orientation="vertical" flexItem variant="middle" />
                <div className={classes.graph}>
                    <div>
                        <Typography variant="h6" align="center" > CONSUMPTION </ Typography >
                        <Divider variant="middle" />
                    </div>

                    <div>
                        <Typography variant="h6" align="center" > TOTAL / 24H </ Typography >
                        <Divider variant="middle" />
                        <PurpleTypography variant="h5" align="center"> <CountUp start={lastConsumption} end={_.sum(buildingConsumption)} duration={0.75} decimals={2} suffix="Kw"></CountUp> </ PurpleTypography >
                    </div>

                    <div>
                        <Typography variant="h6" align="center" > AVERAGE </ Typography >
                        <Divider variant="middle" />
                        <PurpleTypography variant="h5" align="center"> <CountUp start={lastMeanConsumption} end={_.mean(buildingConsumption)} duration={0.75} decimals={2} suffix="Kwh"></CountUp> </ PurpleTypography >
                    </div>

                </div>
            </div>
        </Card >);
}