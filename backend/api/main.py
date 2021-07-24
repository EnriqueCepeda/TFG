from urllib.parse import urlencode
import aiohttp
import os
import subprocess
from functools import lru_cache
from typing import Dict, List, Tuple
from fastapi import FastAPI, HTTPException, Depends, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import requests



from . import config
from . import grid_operations
from . import  models
from .database import SessionLocal, engine

from .energy_inferer.energy_inferer import infere_energy_production, get_panels_configuration, infere_energy_production_without_real_weather

tags_metadata = [
  {
    "name": "Building",
    "description": "Operations related with a concrete building on the Smart Grid."

  },
  {
    "name": "Grid",
    "description": "Operations related with the whole Smart Grid."
  }

]

app = FastAPI(title="Smart Grid Builder",
              description="Smart Grid Builder API to comunicate the Frontend application with the multiagent system among other functions",
              version="1.0.0",
              openapi_tags=tags_metadata)

origins = [
    "*",
]

@lru_cache
def get_settings():
  return config.Settings()

settings = get_settings()
if not settings.test:
  subprocess.Popen(["java", "jade.Boot", "-name", "SmartGrid", "-gui"])

models.Base.metadata.create_all(bind=engine)
infere_energy_production_without_real_weather(38.98588920007077, -3.9280376043217236, 635.1846923828125, 1, 1)

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
MULTIAGENT_API_DIRECTION = "http://localhost:8080"
MULTIAGENT_API_URI = MULTIAGENT_API_DIRECTION + "/api/v1/grid/"

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
  return PlainTextResponse(str(exc), status_code=400)

@app.post(f"{_API_ROOT_}/building/configuration", status_code=200, tags=["Building"])
def get_building_module_configuration(polygon_coordinates: List, latitude:float):
  '''
  Returns the rows of solar modules and the solar modules per row of a building using the geometry vertices of its roof
  '''
  return get_panels_configuration(polygon_coordinates, latitude)

@app.get(f"{_API_ROOT_}/building/production", status_code=200, tags=["Building"])
def infere_building_energy_production(latitude:float, longitude:float, altitude: float, modules_per_string:int, strings_per_inverter:int ):
    '''
    Returns the energy produced by a building in an hour on a certain location using a the building panel configuration
    '''
    return {"production": infere_energy_production(latitude, longitude, altitude, modules_per_string, strings_per_inverter)}


@app.get(f"{_API_ROOT_}/building/address", status_code=200, tags=["Building"])
async def get_building_address(latitude: float, longitude: float):
  '''
  Returns the street address of a certain geographic location 
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

@app.get(f"{_API_ROOT_}/building/altitude", status_code=200, tags=["Building"])
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

@app.post(_API_ROOT_ + "/grid/{grid_id}/transaction", status_code=201, tags=["Grid"])
def new_transaction(grid_id: int, sender_name: str, receiver_name: str, energy: float, 
                    db: Session = Depends(get_db)):
  '''
  Registers a new energy transaction which have occurred on a certain grid
  '''
  sender_name = sender_name.replace("_", " ")
  receiver_name = receiver_name.replace("_", " ")
  transaction = grid_operations.create_transaction(db, grid_id, sender_name, receiver_name, energy)
  if transaction is not None:
    return {"id": transaction.id}
  else:
    raise HTTPException(status_code=404, detail="Server error")


@app.get(_API_ROOT_ + "/grid/{grid_id}/transactions/{timestamp}", status_code=200, tags=["Grid"])
def get_non_fetched_transactions(grid_id: int, timestamp: float, db: Session = Depends(get_db)):
  dt = datetime.utcfromtimestamp(timestamp // 1000)
  transactions = grid_operations.get_non_fetched_transactions(db, grid_id, dt)
  return [transaction.to_dict() for transaction in transactions]

@app.post(f"{_API_ROOT_}/grid/launch", status_code=201, tags=["Grid"])
async def launch_grid(building_data: Dict , db: Session = Depends(get_db), settings: config.Settings = Depends(get_settings)):
    '''
    Launches a multiagent system to simulate the behaviour of a Smart Grid configuration using the data from the Frontend Application
    '''
    
    building_roles = {}
    for building_id in building_data:
      building_roles[building_id] = building_data[building_id]["type"]
    command_list = ["java", "jade.Boot", "-container", "-agents" ]
    grid = grid_operations.create_grid(db)
    agents_str = f'Grid{grid.id}-grid_agent:com.multiagent.GridAgent;'
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
      agents_str += f'Grid{grid.id}-{building_id.replace(" ", "_")}:com.multiagent.BuildingAgent({latitude}, {longitude}, {btype}, {coordinates}, {consumption}, {building_roles_str}, {grid.id}, {panels}, {altitude})'
      agents_str += ";"
    command_list.append(agents_str)
    if not settings.test:
      child_id = subprocess.Popen(command_list)
    return {"id": grid.id}

@app.post(f"{_API_ROOT_}/grid/", status_code=201, tags=["Grid"])
async def launch_grid(building_data: Dict , response: Response, db: Session = Depends(get_db)):
    '''
    Launches a multiagent system to simulate the behaviour of a Smart Grid configuration using the data from the Frontend Application
    '''
    print(building_data)
    
    grid = grid_operations.create_grid(db)
    grid_id = grid.id
    grid_operations.create_building(db, "grid agent", "", "Producer", grid_id)
    for building_id, building in building_data.items():
      btype = building["type"]
      address = building["address"]
      grid_operations.create_building(db, building_id, address, btype, grid_id)
    
    try:
      response_api = requests.post(f"{MULTIAGENT_API_URI}{grid_id}/", json=building_data)
      if response_api.status_code != 201:
        grid_operations.delete_grid(db, grid_id)
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
      return response_api.json()
    except requests.exceptions.RequestException:
      grid_operations.delete_grid(db, grid_id)
      response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
      return {"error": "Multiagent API is not active"}
    

@app.delete(_API_ROOT_ + "/grid/{grid_id}/", status_code=200, tags=["Grid"])
async def delete_grid(grid_id: int, response: Response):
    response_api = requests.delete(f"{MULTIAGENT_API_URI}{grid_id}/")
    if response_api.status_code != 200:
      response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    return response_api.json()



@app.get(_API_ROOT_ + "/grid/{grid_id}/buildings/", status_code=200, tags=["Grid"])
def get_buildings(grid_id: int, db: Session = Depends(get_db)):
  '''
  Returns the building components of a Smart Grid
  '''
  response = {}
  buildings = grid_operations.get_grid_buildings(db, grid_id)
  for building in buildings:
    response[building.id] = building.to_dict()
  return response