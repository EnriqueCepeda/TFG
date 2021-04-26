from typing import Dict
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse
import aiohttp
from energy_inferer.energy_inferer import infere_energy_production
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

def infere_building_production(building_parameters):
    latitude, longitude = float(building_parameters['latitude']), float(building_parameters['longitude'])
    building_name, coordinates =  building_parameters['name'], building_parameters['coordinates'],
    return {building_name: infere_energy_production(coordinates, latitude, longitude)}

@app.post("/infere")
def infere_building_view(building_parameters: Dict):
    return infere_building_production(building_parameters)

@app.post("/bulk_infere")
def infere_buildings_view(building_parameters: Dict):
    response = {}
    for building in building_parameters:
        building_dict = infere_building_production(building)
        response.update(building_dict)
    return response

@app.get("/building_address")
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
        print(result["results"][0]["formatted_address"])
        return result["results"][0]["formatted_address"]
      except Exception:
          raise HTTPException(status_code=500, detail="Server error")

