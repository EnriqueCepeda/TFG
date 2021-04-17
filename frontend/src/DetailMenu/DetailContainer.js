import { useSelector } from "react-redux";
import { Pagination } from '@material-ui/lab';

import React, { useState } from "react";
import { getProducerBuildings } from "../redux/selectors";
import DetailCard from "./DetailCard";
import { ContainerScrollbar } from "../Common"
import { makeStyles } from '@material-ui/core';
import { Divider } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    cardContainer: {
        display: 'flex',
        flexDirection: 'column'
    },
    pagination: {
        marginTop: 10,
        marginBottom: 10

    }
}));


export default function DetailContainer() {
    const [currentPage, setCurrentPage] = useState(1);
    const producerBuildings = useSelector(getProducerBuildings);
    const classes = useStyles();


    const COMPONENTS_PER_PAGE = 4;

    const offset = (currentPage - 1) * COMPONENTS_PER_PAGE;

    const currentPageData = () => {
        let data = []
        Object.keys(producerBuildings).map((dictkey, index) => {
            if (index >= offset && index < offset + COMPONENTS_PER_PAGE) {
                data.push(<React.Fragment key={dictkey}> <DetailCard ol_uid={dictkey} /> </React.Fragment>);
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
            <ContainerScrollbar autoHide autoHideTimeout={500} autoHideDuration={200} >
                {
                    currentPageData()
                }
            </ContainerScrollbar >
            <Divider variant="middle" />
            <Pagination
                count={pageCount}
                page={currentPage}
                siblingCount={1}
                onChange={handlePageClick}
                shape="rounded"
                className={classes.pagination}
            />

        </React.Fragment>
    )
}

