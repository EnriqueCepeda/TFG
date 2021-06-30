from urllib.parse import urlencode
import aiohttp
import os
import subprocess
from functools import lru_cache
from typing import Dict, List, Tuple
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import config
from . import grid_operations
from . import  models
from .database import SessionLocal, engine

from .energy_inferer.energy_inferer import infere_energy_production, get_panels_configuration, infere_energy_production_without_real_weather

app = FastAPI()
origins = [
    "*",
]

@lru_cache
def get_settings():
  return config.Settings()

settings = get_settings()
if not settings.test:
  subprocess.Popen(["java", "jade.Boot", "-name", "SmartGrid"])

models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

_API_ROOT_ = "/api/v1"
ACTIVE_GRID = None

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
  return PlainTextResponse(str(exc), status_code=400)

@app.post(f"{_API_ROOT_}/building/configuration", status_code=200)
def get_building_module_configuration(polygon_coordinates: List, latitude:float):
  '''
  It returns the rows of solar modules and the solar modules per row of a building using the geometry vertices of its roof
  '''
  return get_panels_configuration(polygon_coordinates, latitude)

@app.post(f"{_API_ROOT_}/building/production")
def infere_building_energy(latitude:float, longitude:float, altitude: float, modules_per_string:int, strings_per_inverter:int ):
    '''
    Returns the energy produced by a building in an hour on a certain location using a the building panel configuration
    '''
    return {"production": infere_energy_production_without_real_weather(latitude, longitude, altitude, modules_per_string, strings_per_inverter)}


@app.get(f"{_API_ROOT_}/building/address", status_code=200)
async def get_building_address(latitude: float, longitude: float):
  '''
  It returns the street address of a certain location 
  '''
  maps_api_key = os.getenv('GOOGLE_MAPS_APIKEY', '')
  base_url = 'https://maps.googleapis.com/maps/api/geocode/json'
  key = maps_api_key
  result_type = 'street_address'
  latlng = f"{latitude},{longitude}"
  language = "en"

  async with aiohttp.ClientSession() as session:
    geocoding_url = f'{base_url}?{language=!s}&{result_type=!s}&{latlng=!s}&{key=!s}'
    async with session.get(geocoding_url) as response:
      try:
        result = await response.json()
        if len(result) == 0:
            raise HTTPException(status_code=404, detail="Address not found")
        return {"response" : result["results"][0]["formatted_address"]}
      except Exception:
          raise HTTPException(status_code=500, detail="Server error")

@app.get(f"{_API_ROOT_}/building/altitude", status_code=200)
async def get_building_altitude(latitude: float, longitude: float):
  maps_api_key = os.getenv('GOOGLE_MAPS_APIKEY', '')
  base_url = 'https://maps.googleapis.com/maps/api/elevation/json?'
  locations_str = f"{latitude},{longitude}"
  vars = {"key": maps_api_key, "locations": locations_str}
  url = base_url + urlencode(vars)

  async with aiohttp.ClientSession() as session:
    async with session.get(url) as response:
      try:
        result = await response.json()
        if len(result) == 0:
            raise HTTPException(status_code=404, detail="Altitude not found")
        return {"response" : result["results"][0]["elevation"]}
      except Exception:
          raise HTTPException(status_code=500, detail="Server error")

@app.post(_API_ROOT_ + "/grid/{grid_id}/transaction", status_code=201)
def new_transaction(grid_id: int, sender_name: str, receiver_name: str, energy: float, db: Session = Depends(get_db)
):
  sender_name = sender_name.replace("_", " ")
  receiver_name = receiver_name.replace("_", " ")
  transaction = grid_operations.create_transaction(db, grid_id, sender_name, receiver_name, energy)
  if transaction is not None:
    return {"id": transaction.id}
  else:
    raise HTTPException(status_code=404, detail="Server error")


@app.get(_API_ROOT_ + "/grid/{grid_id}/transactions/{timestamp}", status_code=200)
def get_non_fetched_transactions(grid_id: int, timestamp: float, db: Session = Depends(get_db)):
  transactions = grid_operations.get_non_fetched_transactions(db, grid_id, timestamp)
  return [transaction.to_dict() for transaction in transactions]

@app.post(f"{_API_ROOT_}/grid/launch", status_code=201)
async def launch_grid(building_data: Dict , db: Session = Depends(get_db), settings: config.Settings = Depends(get_settings)):
    '''
    It launches the multiagent grid using the frontend data
    '''
    
    building_roles = {}
    for building_id in building_data:
      building_roles[building_id] = building_data[building_id]["type"]
    command_list = ["java", "jade.Boot", "-container", "-agents" ]
    agents_str = 'grid_agent:com.multiagent.GridAgent;'
    grid = grid_operations.create_grid(db)
    grid_operations.create_building(db, "grid agent", "", "Producer", grid.id)
    for building_id in building_data:
      building = building_data[building_id]
      latitude = building["latitude"]
      longitude = building["longitude"]
      btype = building["type"]
      address = building["address"]
      altitude = building["altitude"]
      panels = building["panels"]
      grid_operations.create_building(db, building_id, address, btype, grid.id)
      building_roles_str = str(building_roles).replace(",", "?")
      coordinates = str(building["coordinates"]).replace(",", "?")
      consumption = str(building["consumption"]).replace(",", "?")
      agents_str += f'{building_id.replace(" ", "_")}:com.multiagent.BuildingAgent({latitude}, {longitude}, {btype}, {coordinates}, {consumption}, {building_roles_str}, {grid.id}, {panels}, {altitude})'
      agents_str += ";"
    command_list.append(agents_str)
    if not settings.test:
      subprocess.Popen(command_list, start_new_session=True)
    return {"id": grid.id}

@app.get(_API_ROOT_ + "/grid/{grid_id}/buildings/", status_code=200)
def get_buildings(grid_id: int, db: Session = Depends(get_db)):
  response = {}
  buildings = grid_operations.get_grid_buildings(db, grid_id)
  for building in buildings:
    response[building.id] = building.to_dict()
  return response