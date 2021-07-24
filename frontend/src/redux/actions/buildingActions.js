
import {
    UPDATE_BUILDING_TYPE, UPDATE_BUILDING_ADDRESS,
    UPDATE_BUILDING_CONSUMPTION, ADD_BUILDING,
    REMOVE_BUILDING, REMOVE_GRID_DATA, ADD_TRANSACTION,
    UPDATE_BUILDING_MAX_PANELS, UPDATE_BUILDING_PANELS,
    UPDATE_BUILDING_ALTITUDE
} from './types';

export const updateBuildingType = (id, type) => ({
    type: UPDATE_BUILDING_TYPE,
    building_id: id,
    building_type: type
});


export const updateBuildingAddress = (id, address) => ({
    type: UPDATE_BUILDING_ADDRESS,
    building_id: id,
    building_address: address
});

export const updateBuildingAltitude = (id, altitude) => ({
    type: UPDATE_BUILDING_ALTITUDE,
    building_id: id,
    building_altitude: altitude
});


export const updateBuildingConsumption = (id, hour, value) => (
    {
        type: UPDATE_BUILDING_CONSUMPTION,
        building_id: id,
        hour: hour,
        value: value
    }
);

export const updateBuildingMaxPanels = (building_id, panels) => (
    {
        type: UPDATE_BUILDING_MAX_PANELS,
        building_id: building_id,
        maxPanels: panels
    }
)

export const updateBuildingPanels = (building_id, panels) => (
    {
        type: UPDATE_BUILDING_PANELS,
        building_id: building_id,
        panels: panels
    }
)

export const addBuilding = (id, latitude, longitude, address, area, coordinates, flatCoordinates) => (
    {
        type: ADD_BUILDING,
        building_id: id,
        building_data: {
            latitude: latitude,
            longitude: longitude,
            altitude: 0,
            address: address,
            area: area,
            type: "Prosumer",
            coordinates: coordinates,
            flatCoordinates: flatCoordinates,
            consumption: defaultBuildingConsumption,
            transactions: {},
            maxPanels: 1,
            panels: 1,
        }
    });

export const removeBuilding = (id) => ({
    type: REMOVE_BUILDING,
    building_id: id
});

export const removeGridData = () => ({
    type: REMOVE_GRID_DATA
});

export const addTransaction = (sender, receiver, energy, timestamp, grid_timestamp) => ({
    type: ADD_TRANSACTION,
    sender: sender,
    receiver: receiver,
    energy: energy,
    timestamp: timestamp,
    grid_timestamp: grid_timestamp
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

