from typing import Dict
from fastapi import FastAPI
from energy_inferer.energy_inferer import infere_energy_production
import pdb

app = FastAPI()

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

'''
{ "name": "Building 558237030",
  "latitude": "38.98695700026889" ,
  "longitude": "-3.928070645675773" ,
  "area": "995.25" ,
  "type": "Consumer & Producer",
  "coordinates": [
    [
      -3.9282782000000003,
      38.9868703
    ],
    [
      -3.9281011000000006,
      38.98676190000001
    ],
    [
      -3.927859700000001,
      38.98696619999996
    ],
    [
      -3.927954,
      38.98705169999999
    ],
    [
      -3.9279771,
      38.98702969999997
    ],
    [
      -3.9280001,
      38.987044799999985
    ],
    [
      -3.9279753000000004,
      38.987070899999985
    ],
    [
      -3.9280674,
      38.98714660000001
    ],
    [
      -3.9282461000000004,
      38.9871521
    ],
    [
      -3.9282514,
      38.987112200000006
    ],
    [
      -3.9282302000000002,
      38.98711079999999
    ],
    [
      -3.9282302000000002,
      38.98707919999999
    ],
    [
      -3.9282601999999995,
      38.98707919999999
    ],
    [
      -3.9282613,
      38.98706709999998
    ],
    [
      -3.9282763000000003,
      38.98689179999999
    ],
    [
      -3.9282782000000003,
      38.9868703
    ]
  ],
  "consumption": [
    4.5,
    3.7,
    2.9,
    2.5,
    2.3,
    2.1,
    2,
    1.9,
    1.8,
    1.7,
    1.6,
    1.5,
    1.5,
    1.4,
    1.5,
    1.6,
    1.7,
    1.8,
    1.9,
    2.1,
    2.3,
    2.6,
    3.2,
    3.7
  ]
}
'''