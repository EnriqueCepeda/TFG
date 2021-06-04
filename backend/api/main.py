import aiohttp
import os
from typing import Dict, List
from fastapi import FastAPI, HTTPException, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse
from . import grid_operations
from sqlalchemy.orm import Session

import subprocess
from .database import SessionLocal, engine
from . import  models
from energy_inferer.energy_inferer import infere_energy_production, get_panels_configuration

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
def new_transaction(
  sender_building_id: int, receiver_building_id: int, energy: float, db: Session = Depends(get_db)
):

  sender = grid_operations.get_building(db, sender_building_id)
  print(sender)
  receiver = grid_operations.get_building(db, receiver_building_id)
  transaction = grid_operations.create_transaction(db, sender.id, receiver.id, energy)

  return {"id": transaction.id}

@app.get(_API_ROOT_ + "/grid/transactions/{timestamp}", status_code=200)
def get_non_fetched_transactions(timestamp: int, db: Session = Depends(get_db)):
  transactions = grid_operations.get_non_fetched_transactions(db, timestamp)
  return {transaction.id : transaction.to_dict() for transaction in transactions}

@app.post(f"{_API_ROOT_}/grid/launch")
async def launch_grid(building_data: Dict):
    '''
    It launches the multiagent grid using the frontend data
    '''
    
    building_roles = {}
    for building_id in building_data:
      building_roles[building_id] = building_data[building_id]["type"]
    command_list = ["java", "jade.Boot", "-gui", "-agents" ]
    agents_str = 'grid_agent:com.multiagent.GridAgent;'
    for building_id in building_data:
      building = building_data[building_id]
      latitude = building["latitude"]
      longitude = building["longitude"]
      btype = building["type"]
      building_roles_str = str(building_roles).replace(",", "?")
      coordinates = str(building["coordinates"]).replace(",", "?")
      consumption = str(building["consumption"]).replace(",", "?")
      agents_str += f'{building_id.replace(" ", "_")}:com.multiagent.BuildingAgent({latitude}, {longitude}, {btype}, {coordinates}, {consumption}, {building_roles_str} )'
      agents_str += ";"
    command_list.append(agents_str)
    subprocess.Popen(command_list)
