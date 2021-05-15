import aiohttp
import os
from typing import Dict, List, Tuple, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Cookie, Depends, Query, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import subprocess

from energy_inferer.energy_inferer import infere_energy_production, get_panels_configuration

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
  return PlainTextResponse(str(exc), status_code=400)

@app.get("/building/configuration")
def get_building_module_configuration(polygon_coordinates: List[Tuple[float, float]], latitude:float, longitude:float):
  '''
  It returns the rows and the solar modules per row of a building using the geometry vertices of its roof to fit them
  '''
  return get_panels_configuration(polygon_coordinates, latitude, longitude)

@app.get("/building/consumption")
def infere_building_energy(modules_per_string:int, strings_per_inverter:int, latitude:float, longitude:float):
    '''
    Returns the energy produced on an hour on a certain location using a certain panel config
    '''

    return {'result' : infere_energy_production(latitude, longitude, modules_per_string, strings_per_inverter) }

@app.get("/building/address")
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

@app.post("/grid/launch")
async def launch_grid(building_data: Dict):
    '''
    It launches the multiagent grid using the frontend data
    '''
    #They don't execute in order. TO-DO: execute first a grid agent and then the rest of the agent
    command = "java jade.Boot -gui -agents ga:com.multiagent.GridAgent"
    building_str = json.dumps(building_data)
    building_id = building_data.keys()[0]
    command += f' {building_id.replace(" ", "_")}:com.multiagent.BuildingAgent({building_str})'
    command_list = command.split()
    print(command_list)
    subprocess.Popen(command_list)


@app.websocket("/grid/report")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    data = await websocket.receive_text()
    print(data)
    await websocket.send_text(f"Message text was: {data}")

