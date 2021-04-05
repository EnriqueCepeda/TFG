import { useSelector, useDispatch } from "react-redux";
import { Pagination } from '@material-ui/lab';

import React, { useEffect, useState } from "react";
import { getProducerBuildings } from "../redux/selectors";
import DetailCard from "./DetailCard";



export default function DetailContainer() {
    const [currentPage, setCurrentPage] = useState(1);
    const producerBuildings = useSelector(getProducerBuildings);

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
        debugger;
        setCurrentPage(newPage);
    }

    return (
        <div style={{ marginTop: 10 }}>
            <Pagination
                count={pageCount}
                page={currentPage}
                siblingCount={1}
                onChange={handlePageClick}
                shape="rounded"
            />

            {
                currentPageData()
            }

        </div >
    )
}

