import _ from "lodash";

export const getBuildings = state => {
    var filteredItems = {};
    Object.keys(state.buildings).map((dictkey) => {
        if (dictkey !== "grid agent") {
            filteredItems[dictkey] = state.buildings[dictkey];
        }
    })
    return filteredItems;


}

export const getBuilding = (state, ol_uid) => getBuildings(state)[ol_uid]

export const getConsumerBuildings = (state) => {
    const buildings = getBuildings(state);
    var filteredItems = {};
    Object.keys(buildings).map((dictkey) => {
        if (buildings[dictkey].type !== "Producer") {
            filteredItems[dictkey] = buildings[dictkey];
        }
    })
    return filteredItems;
}


export const getProducerBuildings = (state) => {
    const buildings = getBuildings(state);
    var filteredItems = {};
    Object.keys(buildings).map((dictkey) => {
        if (buildings[dictkey].type !== "Consumer") {
            filteredItems[dictkey] = buildings[dictkey];
        }
    })
    return filteredItems;
}

export const getBuildingConsumption = (state, building_id) => {
    const buildings = getBuildings(state);
    return buildings[building_id].consumption
}

export const getTotalConsumedEnergy = (state) => {
    const buildingList = getBuildings(state);
    var totalConsumedEnergy = 0.0;
    var buildingConsumedEnergy = 0.0;
    Object.keys(buildingList).forEach((building_id) => {
        buildingConsumedEnergy = getConsumedEnergy(state, building_id)
        totalConsumedEnergy = totalConsumedEnergy + buildingConsumedEnergy;
    })
    return totalConsumedEnergy;

}


export const getTotalGeneratedEnergy = (state) => {
    const buildingList = getBuildings(state);
    var totalGeneratedEnergy = 0.0;
    var buildingGeneratedEnergy = 0.0;
    Object.keys(buildingList).forEach((building_id) => {
        buildingGeneratedEnergy = getGeneratedEnergy(state, building_id)
        totalGeneratedEnergy = totalGeneratedEnergy + buildingGeneratedEnergy;
    })
    return totalGeneratedEnergy;

}


export const getConsumedEnergy = (state, building_id) => {
    const selectedBuilding = getBuilding(state, building_id);

    if (selectedBuilding === undefined) {
        return 0;
    }
    if (!Object.values(selectedBuilding.transactions).length) {
        return 0;
    }

    var values = [];
    Object.values(selectedBuilding.transactions).forEach((hourTransactions) => (
        hourTransactions.forEach((transaction) => {
            if (transaction[1] > 0) {
                values.push(transaction[1]);
            }
        })));
    return _.sum(values);
}

export const getGeneratedEnergy = (state, building_id) => {
    const selectedBuilding = getBuilding(state, building_id);

    if (selectedBuilding === undefined) {
        return 0;
    }
    if (!Object.values(selectedBuilding.transactions).length) {
        return 0;
    }

    var values = [];
    Object.values(selectedBuilding.transactions).forEach((hourTransactions) => (
        hourTransactions.forEach((transaction) => {
            if (transaction[1] < 0) {
                values.push(-transaction[1]);
            }
        })));
    return _.sum(values);
}


export const getLastHourConsumedEnergy = (state, building_id) => {
    const selectedBuilding = getBuilding(state, building_id);

    if (selectedBuilding === undefined) {
        return 0;
    }
    if (!Object.values(selectedBuilding.transactions).length) {
        return 0;
    }

    var values = [];
    Object.values(selectedBuilding.transactions).pop().forEach((transaction) => {
        if (transaction[1] > 0) {
            values.push(transaction[1]);
        }
    });
    return _.sum(values);
}

export const getLastHourGeneratedEnergy = (state, building_id) => {
    const selectedBuilding = getBuilding(state, building_id);

    if (selectedBuilding === undefined) {
        return 0;
    }
    if (!Object.values(selectedBuilding.transactions).length) {
        return 0;
    }

    var values = [];
    Object.values(selectedBuilding.transactions).pop().forEach((transaction) => {
        if (transaction[1] < 0) {
            values.push(-transaction[1]);
        }
    });
    return _.sum(values);
}

export const getTotalLastHourConsumedEnergy = (state) => {
    const buildingList = getBuildings(state);
    var total = 0.0;
    Object.keys(buildingList).forEach((buildingId) => {
        total = total + getLastHourConsumedEnergy(state, buildingId);
    });
    return total;


}


export const getTotalLastHourGeneratedEnergy = (state) => {
    const buildingList = getBuildings(state);
    var total = 0.0;
    Object.keys(buildingList).forEach((buildingId) => {
        total = total + getLastHourGeneratedEnergy(state, buildingId);
    });
    return total;


}

