import aiohttp
import os
from typing import Dict, List
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse
from . import grid_operations
from sqlalchemy.orm import Session

import subprocess
from .database import SessionLocal, engine
from . import  models
from .energy_inferer.energy_inferer import infere_energy_production, get_panels_configuration

app = FastAPI()
origins = [
    "*",
]


models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

_API_ROOT_ = "/api/v1"

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
  return PlainTextResponse(str(exc), status_code=400)

@app.post(f"{_API_ROOT_}/building/configuration")
def get_building_module_configuration(polygon_coordinates: List, latitude:float):
  '''
  It returns the rows of solar modules and the solar modules per row of a building using the geometry vertices of its roof
  '''
  return get_panels_configuration(polygon_coordinates, latitude)

@app.post(f"{_API_ROOT_}/building/production")
def infere_building_energy(modules_per_string:int, strings_per_inverter:int, latitude:float, longitude:float):
    '''
    Returns the energy produced by a building in an hour on a certain location using a the building panel configuration
    '''
    return infere_energy_production(latitude, longitude, modules_per_string, strings_per_inverter)


@app.get(f"{_API_ROOT_}/building/address")
async def get_building_address(latitude: float, longitude: float):
  '''
  It returns the street address of a certain location 
  '''
  maps_api_key = os.getenv('GOOGLE_MAPS_APIKEY', '')
  base_url = 'https://maps.googleapis.com/maps/api/geocode/json'
  key = maps_api_key
  result_type = 'street_address'
  latlng = f"{latitude},{longitude}"

  async with aiohttp.ClientSession() as session:
    geocoding_url = f'{base_url}?{result_type=!s}&{latlng=!s}&{key=!s}'
    async with session.get(geocoding_url) as response:
      try:
        result = await response.json()
        if len(result) == 0:
            raise HTTPException(status_code=404, detail="Address not found")
        return result["results"][0]["formatted_address"]
      except Exception:
          raise HTTPException(status_code=500, detail="Server error")

@app.post(f"{_API_ROOT_}/grid/transaction", status_code=201)
def new_transaction(grid_id: int, sender_name: str, receiver_name: str, energy: float, db: Session = Depends(get_db)
):
  
  transaction = grid_operations.create_transaction(db, grid_id, sender_name, receiver_name, energy)
  return {"id": transaction.id}

@app.get(_API_ROOT_ + "/grid/{grid_id}/transactions/{timestamp}", status_code=200)
def get_non_fetched_transactions(grid_id: int, timestamp: float, db: Session = Depends(get_db)):
  transactions = grid_operations.get_non_fetched_transactions(db, grid_id, timestamp)
  return {transaction.id : transaction.to_dict() for transaction in transactions}

@app.post(f"{_API_ROOT_}/grid/launch", status_code=201)
async def launch_grid(building_data: Dict , request: Request, db: Session = Depends(get_db)):
    '''
    It launches the multiagent grid using the frontend data
    '''
    
    building_roles = {}
    for building_id in building_data:
      building_roles[building_id] = building_data[building_id]["type"]
    command_list = ["java", "jade.Boot", "-gui", "-agents" ]
    agents_str = 'grid_agent:com.multiagent.GridAgent;'
    grid = grid_operations.create_grid(db)
    for building_id in building_data:
      building = building_data[building_id]
      latitude = building["latitude"]
      longitude = building["longitude"]
      btype = building["type"]
      address = building["address"]
      building_db = grid_operations.create_building(db, building_id, address, btype, grid.id)
      building_roles_str = str(building_roles).replace(",", "?")
      coordinates = str(building["coordinates"]).replace(",", "?")
      consumption = str(building["consumption"]).replace(",", "?")
      agents_str += f'{building_id.replace(" ", "_")}:com.multiagent.BuildingAgent({latitude}, {longitude}, {btype}, {coordinates}, {consumption}, {building_roles_str} )'
      agents_str += ";"
    command_list.append(agents_str)
    if not request.app.state.TEST:
      pid = subprocess.Popen(command_list)
    return {"id": grid.id}

@app.get(_API_ROOT_ + "/grid/{grid_id}/buildings/", status_code=200)
def get_buildings(grid_id: int, db: Session = Depends(get_db)):
  response = {}
  buildings = grid_operations.get_grid_buildings(db, grid_id)
  for building in buildings:
    response[building.id] = building.to_dict()
  return response


