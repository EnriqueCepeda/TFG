
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
        polygonCoordinates: polygonCoordinates,
        consumption: defaultBuildingConsumption
    }
});

export const removeBuilding = (id) => ({
    type: REMOVE_BUILDING,
    building_id: id
});

const defaultBuildingConsumption = {
    0: 45,
    1: 37,
    2: 29,
    3: 25,
    4: 23,
    5: 21,
    6: 20,
    7: 19,
    8: 18,
    9: 17,
    10: 16,
    11: 15,
    12: 15.5,
    13: 14.5,
    14: 15,
    15: 16,
    16: 17,
    17: 18,
    18: 19,
    19: 20,
    20: 21,
    21: 24.5,
    22: 28,
    23: 38,
    24: 43,
}

