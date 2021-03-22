import { useSelector } from "react-redux"
import React from "react"
import { getProducerBuildings } from "../redux/selectors"
import DetailCard from "./DetailCard";



export default function DetailContainer() {
    const producerBuildings = useSelector(getProducerBuildings);

    return (
        <div>
            {
                Object.keys(producerBuildings).map((dictkey, index) => (
                    <React.Fragment key={dictkey}>
                        <DetailCard ol_uid={dictkey} />
                    </React.Fragment>
                ))
            }
        </div>
    )
}

