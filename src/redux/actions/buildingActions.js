
import { UPDATE_BUILDING_TYPE, ADD_BUILDING, REMOVE_BUILDING } from './types'

export const updateBuildingType = (id, type) => ({
    type: UPDATE_BUILDING_TYPE,
    building_id: id,
    building_type: type
});

export const addBuilding = (id, longitude, latitude, area) => ({
    type: ADD_BUILDING,
    building_id: id,
    building_data: {
        longitude: longitude,
        latitude: latitude,
        area: area,
        type: "Consumer & Producer"
    }
});

export const removeBuilding = (id) => ({
    type: REMOVE_BUILDING,
    building_id: id
});
