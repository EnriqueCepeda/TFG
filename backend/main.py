from typing import Dict, List, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse
import aiohttp
from energy_inferer.energy_inferer import infere_energy_production, get_panels_configuration
from fastapi.middleware.cors import CORSMiddleware
import os

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

@app.post("/building/module_configuration")
def get_building_module_configuration(polygon_coordinates: List[Tuple[float, float]], latitude:float, longitude:float):
    return get_panels_configuration(polygon_coordinates, latitude, longitude)

@app.post("/building/infere_consumption")
def infere_building_view(modules_per_string:int, strings_per_inverter:int, latitude:float, longitude:float):
    '''
    Returns the energy produced on an hour on a certain location with a certain panel config
    '''

    return {'result' : infere_energy_production(modules_per_string, strings_per_inverter, latitude, longitude)}

@app.get("/building/address")
async def get_building_address(latitude: float, longitude: float):
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

