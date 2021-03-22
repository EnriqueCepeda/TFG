
const getBuildings = state => state.buildings;

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