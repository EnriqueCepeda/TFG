import { useSelector } from "react-redux";
import { Pagination } from '@material-ui/lab';

import React, { useState } from "react";
import { getConsumerBuildings } from "../redux/selectors";
import ConsumptionCard from "./ConsumptionCard";
import { ContainerScrollbar, PurpleButton } from "../Common"
import { makeStyles, Divider } from '@material-ui/core';
import { Link } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
    pagination: {
        marginTop: 10,
        marginBottom: 20
    },
    footer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
}));


export default function ConsumptionContainer() {
    const [currentPage, setCurrentPage] = useState(1);
    const producerBuildings = useSelector(getConsumerBuildings);
    const classes = useStyles();


    const COMPONENTS_PER_PAGE = 4;

    const offset = (currentPage - 1) * COMPONENTS_PER_PAGE;

    const currentPageData = () => {
        let data = []
        Object.keys(producerBuildings).map((dictkey, index) => {
            if (index >= offset && index < offset + COMPONENTS_PER_PAGE) {
                data.push(<React.Fragment key={dictkey}> <ConsumptionCard ol_uid={dictkey} /> </React.Fragment>);
            }
        });
        return data;
    }

    const pageCount = Math.ceil(Object.keys(producerBuildings).length / COMPONENTS_PER_PAGE);



    function handlePageClick(event, newPage) {
        setCurrentPage(newPage);
    }

    return (
        <React.Fragment>
            <Divider variant="middle" />
            <ContainerScrollbar autoHide>
                {
                    currentPageData()
                }

            </ContainerScrollbar >
            <Divider variant="middle" />
            <div className={classes.footer}>
                <Pagination
                    count={pageCount}
                    page={currentPage}
                    siblingCount={1}
                    onChange={handlePageClick}
                    shape="rounded"
                    className={classes.pagination}
                />
                <PurpleButton variant="outlined" color="primary" component={Link} to="/panels" style={{ marginRight: 20 }} >
                    Building Panels
                </PurpleButton>
            </div>
        </React.Fragment>
    )
}

