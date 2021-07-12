from sqlalchemy import Float, Column, ForeignKey, Integer, String, TIMESTAMP, DateTime
from sqlalchemy import func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import pandas as pd

Base = declarative_base()

class Grid(Base):
    __tablename__ = "grids"

    id = Column(Integer, primary_key=True, index=True)
    buildings = relationship("Building", back_populates="grid")

class EnergyTransaction(Base):
    __tablename__ = "energytransactions"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey('buildings.id'))
    sender = relationship("Building", foreign_keys=[sender_id], back_populates="sent_transactions")
    receiver_id = Column(Integer, ForeignKey('buildings.id'))
    receiver = relationship("Building", foreign_keys=[receiver_id], back_populates="received_transactions")
    energy = Column(Float)
    timestamp = Column(TIMESTAMP, nullable=False, default=func.now())
    grid_timestamp = Column(TIMESTAMP, nullable=True)


    def to_dict(self):
        return {
            'sender': self.sender.name,
            'receiver': self.receiver.name,
            'energy': self.energy,
            'timestamp': self.timestamp,
            'grid_timestamp': self.grid_timestamp
        }

class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    direction = Column(String, nullable=True)
    type = Column(String, nullable=False)
    grid_id = Column(Integer, ForeignKey('grids.id'))
    grid = relationship("Grid", back_populates="buildings")
    sent_transactions = relationship("EnergyTransaction", foreign_keys=[EnergyTransaction.sender_id], back_populates="sender")
    received_transactions = relationship("EnergyTransaction", foreign_keys=[EnergyTransaction.receiver_id], back_populates="receiver")


    def to_dict(self):
        return {
            'name': self.name,
            'direction': self.direction,
            'type': self.type,
        }



