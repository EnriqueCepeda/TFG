import aiohttp
from flask import Flask, jsonify, abort, make_response, request
import os
from multiprocessing import Process
import subprocess
from flask_cors import CORS
from energy_inferer.energy_inferer import infere_energy_production, get_panels_configuration

API_ROOT = '/api/v1'
DEFAULT_PORT = 8000

_FLASK_APP_ = Flask(__name__.split('.')[0])
CORS(_FLASK_APP_)

@_FLASK_APP_.route(f"{API_ROOT}/building/configuration", methods = ['POST'])
def get_building_module_configuration():
    '''
    It returns the rows of solar modules and the solar modules per row of a building using the geometry vertices of its roof
    '''
    polygon_coordinates = request.json
    latitude = request.args.get('latitude')

    if not polygon_coordinates or not latitude:
        abort(400)
    else:
        latitude = float(latitude)

    return get_panels_configuration(polygon_coordinates, latitude)

@_FLASK_APP_.route(f"{API_ROOT}/building/production", methods = ['POST'])
def infere_building_energy():
    '''
    Returns the energy produced by a building in an hour on a certain location using a the building panel configuration
    '''
    modules_per_string = request.args.get('modules_per_string')
    strings_per_inverter = request.args.get('strings_per_inverter')
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')
    
    if not modules_per_string or not strings_per_inverter or not latitude or not longitude:
        abort(400)
    else:
        modules_per_string = float(modules_per_string)
        strings_per_inverter = float(strings_per_inverter)
        latitude = float(latitude)
        longitude = float(longitude)
    
    return infere_energy_production(latitude, longitude, modules_per_string, strings_per_inverter)

@_FLASK_APP_.route(f"{API_ROOT}/building/address", methods = ['GET'])
async def get_building_address():
    '''
    It returns the street address of a certain location 
    '''
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')

    if not latitude or not longitude:
        abort(400, "You should include latitude and longitude as URI parameters")

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
                    raise abort(404, "Address not found")
                return result["results"][0]["formatted_address"]
            except Exception:
                raise abort(500)


@_FLASK_APP_.post(f"{API_ROOT}/grid/launch")
def launch_grid(building_data):
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

if __name__ == '__main__':
    _FLASK_APP_.run(host='localhost', port=DEFAULT_PORT, debug=True)


  
