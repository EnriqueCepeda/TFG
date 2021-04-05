
import { UPDATE_BUILDING_TYPE, UPDATE_BUILDING_CONSUMPTION, ADD_BUILDING, REMOVE_BUILDING } from './types'

export const updateBuildingType = (id, type) => ({
    type: UPDATE_BUILDING_TYPE,
    building_id: id,
    building_type: type
});

export const updateBuildingConsumption = (id, hour, value) => (
    {
        type: UPDATE_BUILDING_CONSUMPTION,
        building_id: id,
        hour: hour,
        value: value
    }
);

export const addBuilding = (id, longitude, latitude, area, polygonCoordinates) => ({
    type: ADD_BUILDING,
    building_id: id,
    building_data: {
        latitude: latitude,
        longitude: longitude,
        area: area,
        type: "Consumer & Producer",
        coordinates: polygonCoordinates,
        consumption: defaultBuildingConsumption
    }
});

export const removeBuilding = (id) => ({
    type: REMOVE_BUILDING,
    building_id: id
});

const defaultBuildingConsumption = [
    4.5,
    3.7,
    2.9,
    2.5,
    2.3,
    2.1,
    2.0,
    1.9,
    1.8,
    1.7,
    1.6,
    1.5,
    1.5,
    1.4,
    1.5,
    1.6,
    1.7,
    1.8,
    1.9,
    2.1,
    2.3,
    2.6,
    3.2,
    3.7,
]

