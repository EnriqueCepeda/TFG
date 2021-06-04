from sqlalchemy.orm import Session

from . import models

def create_transaction(db: Session, sender_id, receiver_id, energy):
    db_transaction = models.EnergyTransaction(sender_id=sender_id, receiver_id=receiver_id, energy=energy)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

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

def get_building(db: Session, building_id: int):
    return db.query(models.Building).filter(models.Building.id == building_id).one()

def get_non_fetched_transactions(db: Session, timestamp):
    return db.query(models.EnergyTransaction).filter(models.EnergyTransaction.timestamp > timestamp)



