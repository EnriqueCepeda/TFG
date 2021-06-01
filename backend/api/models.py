from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy import func
from sqlalchemy.orm import relationship
from sqlalchemy.sql.visitors import ReplacingExternalTraversal
from sqlalchemy.util.langhelpers import set_creation_order

from .database import Base

class Grid(Base):
    __tablename__ = "grids"
    id = Column(Integer, primary_key=True, index=True)
    buildings = relationship("Building")


class Building(Base):
    __tablename__ = "buildings"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    grid = relationship("Grid", back_populates="buildings")
    transactions = relationship("EnergyTransaction")


class EnergyTransaction(Base):
    __tablename__ = "energy transactions"
    id = Column(Integer, primary_key=True, index=True)
    sender = relationship("Building")
    receiver = relationship("Building")
    timestamp = Column('timestamp', DateTime, nullable=False, default=func.now())
