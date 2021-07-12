from sqlalchemy.orm import Session
import pandas as pd

from . import models

def create_transaction(db: Session, grid_id, sender_name, receiver_name, energy):
    sender = get_building_by_name_grid(db, grid_id, sender_name)
    receiver = get_building_by_name_grid(db, grid_id, receiver_name)
    if sender is not None and receiver is not None:
        db_transaction = models.EnergyTransaction(sender_id=sender.id, receiver_id=receiver.id, energy=energy, grid_timestamp=pd.Timestamp.now('UTC').round('60min'))
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    else: 
        print("Transaction could not be performed")

def create_building(db: Session, name, direction, type, grid_id):
    db_building = models.Building( name=name, direction=direction, type=type, grid_id=grid_id)
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building

def create_grid(db: Session):
    db_grid = models.Grid()
    db.add(db_grid)
    db.commit()
    db.refresh(db_grid)
    return db_grid

def get_building_by_name_grid(db: Session, grid_id, building_name):
    return db.query(models.Building).filter(models.Building.grid_id == grid_id, models.Building.name == building_name).one_or_none()

def get_building(db: Session, building_id: int):
    return db.query(models.Building).get(building_id)

def get_grid_buildings(db: Session, grid_id: int):
    return db.query(models.Grid).get(grid_id).buildings

def get_non_fetched_transactions(db: Session, grid_id, timestamp):
    return db.query(models.EnergyTransaction).filter(models.EnergyTransaction.sender.has(models.Building.grid_id == grid_id), 
                                                    models.EnergyTransaction.receiver.has(models.Building.grid_id == grid_id), 
                                                    models.EnergyTransaction.timestamp > timestamp)



