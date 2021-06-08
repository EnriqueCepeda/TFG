
import { UPDATE_BUILDING_TYPE, UPDATE_BUILDING_ADDRESS, UPDATE_BUILDING_CONSUMPTION, ADD_BUILDING, REMOVE_BUILDING, ADD_TRANSACTION, } from './types';

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


export const updateBuildingConsumption = (id, hour, value) => (
    {
        type: UPDATE_BUILDING_CONSUMPTION,
        building_id: id,
        hour: hour,
        value: value
    }
);

export const addBuilding = (id, latitude, longitude, address, area, coordinates, flatCoordinates) => (
    {
        type: ADD_BUILDING,
        building_id: id,
        building_data: {
            latitude: latitude,
            longitude: longitude,
            address: address,
            area: area,
            type: "Prosumer",
            coordinates: coordinates,
            flatCoordinates: flatCoordinates,
            consumption: defaultBuildingConsumption,
            transactions: {}
        }
    });

export const removeBuilding = (id) => ({
    type: REMOVE_BUILDING,
    building_id: id
});

export const addTransaction = (sender, receiver, energy, timestamp) => ({
    type: ADD_TRANSACTION,
    sender: sender,
    receiver: receiver,
    energy: energy,
    timestamp: timestamp
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

