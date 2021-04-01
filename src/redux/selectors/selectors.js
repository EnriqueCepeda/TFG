
export const getBuildings = state => state.buildings;

export const getBuilding = (state, ol_uid) => getBuildings(state)[ol_uid]

export const getProducerBuildings = (state) => {
    const buildings = getBuildings(state);
    var filteredItems = {};
    Object.keys(buildings).map((dictkey, index) => {
        if (buildings[dictkey].type !== "Producer") {
            filteredItems[dictkey] = buildings[dictkey];
        }
    })
    return filteredItems;
}

export const getBuildingConsumption = (state, building_id) => {
    const buildings = getBuildings(state);
    return buildings[building_id].consumption
}