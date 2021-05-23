from typing import Dict
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import uvicorn
import random

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

@app.post("/grid/launch")
def launch_grid(building_data: Dict):
    '''
    It launches the multiagent grid using the frontend data
    '''
    
    
    building_roles = {}
    for building_id in building_data:
      building_roles[building_id] = building_data[building_id]["type"]
    command_list = ["java", "jade.Boot", "-gui", "-agents" ]
    agents_str = ''
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

@app.post("/post_agent")
def launch_grid(building_data: Dict):
    '''
    It launches the multiagent grid using the frontend data
    '''
    
    command_list = ["java", "jade.Boot", "-gui", "-agents", "ga:com.multiagent.GridAgent"]
    building_roles = {}
    for building_id in building_data.keys():
      building_roles[building_id] = building_data[building_id]["type"]
    building_id = list(building_data.keys())[0]
    building = building_data[building_id]
    latitude = building["latitude"]
    longitude = building["longitude"]
    btype = building["type"]
    building_roles_str = str(building_roles).replace(",", "?")
    coordinates = str(building["coordinates"]).replace(",", "?")
    consumption = str(building["consumption"]).replace(",", "?")
    command_list.append(f'{building_id.replace(" ", "_")}:com.multiagent.PostRequestAgent({latitude}, {longitude}, {btype}, {coordinates}, {consumption}, {building_roles_str} )')
    subprocess.Popen(command_list)


@app.post("/consumer")
def launch_consumer():
  command_list = ["java", "jade.Boot", "-gui", "-container", "-agents"]
  building_data = {f"Building {random.randrange(1, 100)}":{"latitude":38.98679890008654,"longitude":-3.9270577033021428,"address":"Latitude: 38.98679890 \n Longitude: -3.92705770","area":"533.07","type":"Consumer","coordinates":[[-3.9272596,38.98668819999999],[-3.9272667,38.986772099999996],[-3.9272418999999994,38.98680649999998],[-3.9269091999999994,38.9869096],[-3.9268815,38.98683519999999],[-3.9268715999999997,38.98680850000001],[-3.9268473000000004,38.98674320000001],[-3.9270083000000002,38.98672400000002],[-3.9272596,38.98668819999999]],"flatCoordinates":[[-437180.5388849953,4719764.950784083],[-437181.3292533799,4719776.966485994],[-437178.5685300082,4719781.893071106],[-437141.53253542125,4719796.658519321],[-437138.4489855263,4719786.003334356],[-437137.34692256746,4719782.179500549],[-437134.64185894124,4719772.827583491],[-437152.5642969589,4719770.077863731],[-437180.5388849953,4719764.950784083]],"consumption":[4.5,3.7,2.9,2.5,2.3,2.1,2,1.9,1.8,1.7,1.6,1.5,1.5,1.4,1.5,1.6,1.7,1.8,1.9,2.1,2.3,2.6,3.2,3.7]}}
  building_roles = {}
  for building_id in building_data.keys():
    building_roles[building_id] = building_data[building_id]["type"]
  building_id = list(building_data.keys())[0]
  building = building_data[building_id]
  latitude = building["latitude"]
  longitude = building["longitude"]
  btype = building["type"]
  building_roles_str = str(building_roles).replace(",", "?")
  coordinates = str(building["coordinates"]).replace(",", "?")
  consumption = str(building["consumption"]).replace(",", "?")
  command_list.append(f'{building_id.replace(" ", "_")}:com.multiagent.BuildingAgent({latitude}, {longitude}, {btype}, {coordinates}, {consumption}, {building_roles_str} )')
  subprocess.Popen(command_list)

@app.post("/prosumer")
def launch_prosumer():
  command_list = ["java", "jade.Boot", "-gui", "-container", "-agents"]
  building_data = {f"Building {random.randrange(1, 100)}":{"latitude":38.986870250075555,"longitude":-3.926766128550927,"address":"Latitude: 38.98687025 \n Longitude: -3.92676613","area":"284.79","type":"Prosumer","coordinates":[[-3.9266751000000006,38.98697369999999],[-3.9268224000000003,38.986933399999984],[-3.9267879,38.986856800000005],[-3.926700500000001,38.98688049999998],[-3.926688300000001,38.98685759999999],[-3.9267777000000006,38.986833899999986],[-3.9267523,38.98676679999998],[-3.9266844999999995,38.98676799999998],[-3.9265550000000005,38.98677309999997],[-3.9266019,38.986868699999995],[-3.9266303000000002,38.98686159999998],[-3.9266588000000002,38.98685369999996],[-3.926673,38.98688759999998],[-3.9266434,38.986894399999954],[-3.9266751000000006,38.98697369999999]],"flatCoordinates":[[-437115.4726426266,4719805.838600293],[-437131.87000362045,4719800.0670351535],[-437128.02948118804,4719789.096774001],[-437118.3001576928,4719792.490965801],[-437116.9420599051,4719789.211345855],[-437126.89402238204,4719785.817155149],[-437124.0665073158,4719776.207448381],[-437116.51904584,4719776.379305948],[-437102.10317178234,4719777.10970064],[-437107.3240559005,4719790.801030503],[-437110.48552943906,4719789.784205157],[-437113.6581349267,4719788.652808063],[-437115.23887169594,4719793.507791416],[-437111.94381476846,4719794.48165266],[-437115.4726426266,4719805.838600293]],"consumption":[4.5,3.7,2.9,2.5,2.3,2.1,2,1.9,1.8,1.7,1.6,1.5,1.5,1.4,1.5,1.6,1.7,1.8,1.9,2.1,2.3,2.6,3.2,3.7]}}
  building_roles = {}
  for building_id in building_data.keys():
    building_roles[building_id] = building_data[building_id]["type"]
  building_id = list(building_data.keys())[0]
  building = building_data[building_id]
  latitude = building["latitude"]
  longitude = building["longitude"]
  btype = building["type"]
  building_roles_str = str(building_roles).replace(",", "?")
  coordinates = str(building["coordinates"]).replace(",", "?")
  consumption = str(building["consumption"]).replace(",", "?")
  command_list.append(f'{building_id.replace(" ", "_")}:com.multiagent.BuildingAgent({latitude}, {longitude}, {btype}, {coordinates}, {consumption}, {building_roles_str} )')
  subprocess.Popen(command_list)


@app.post("/grid_agent")
def launch_grid_agent():
  command_list = ["java", "jade.Boot", "-gui", "-agents", "ga:com.multiagent.GridAgent"]
  subprocess.Popen(command_list)

@app.post("/producer")
def launch_producer():
  command_list = ["java", "jade.Boot", "-gui", "-container", "-agents"]
  building_data = {f"Building {random.randrange(1, 100)}":{"latitude":38.98691290013804,"longitude":-3.926494146332348,"address":"Latitude: 38.98691290 \n Longitude: -3.92649415","area":"608.69","type":"Producer","coordinates":[[-3.9263341000000005,38.98685319999998],[-3.9263437000000003,38.98702189999999],[-3.926388400000001,38.98705269999999],[-3.9266751000000006,38.98697369999999],[-3.9266434,38.986894399999954],[-3.9266303000000002,38.98686159999998],[-3.9266019,38.986868699999995],[-3.9265550000000005,38.98677309999997],[-3.926443800000001,38.986777599999996],[-3.926445600000001,38.9868202],[-3.926396,38.9868202],[-3.9263996000000003,38.98685319999998],[-3.9263341000000005,38.98685319999998]],"flatCoordinates":[[-437077.5126962661,4719788.581200657],[-437078.58136337774,4719812.741568372],[-437083.5573446162,4719817.15259608],[-437115.4726426266,4719805.838600293],[-437111.94381476846,4719794.48165266],[-437110.48552943906,4719789.784205157],[-437107.3240559005,4719790.801030503],[-437102.10317178234,4719777.10970064],[-437089.72444440617,4719777.754166592],[-437089.9248194896,4719783.855112939],[-437084.4033727462,4719783.855112939],[-437084.80412291305,4719788.581200657],[-437077.5126962661,4719788.581200657]],"consumption":[4.5,3.7,2.9,2.5,2.3,2.1,2,1.9,1.8,1.7,1.6,1.5,1.5,1.4,1.5,1.6,1.7,1.8,1.9,2.1,2.3,2.6,3.2,3.7]}}
  building_roles = {}
  for building_id in building_data.keys():
    building_roles[building_id] = building_data[building_id]["type"]
  building_id = list(building_data.keys())[0]
  building = building_data[building_id]
  latitude = building["latitude"]
  longitude = building["longitude"]
  btype = building["type"]
  building_roles_str = str(building_roles).replace(",", "?")
  coordinates = str(building["coordinates"]).replace(",", "?")
  consumption = str(building["consumption"]).replace(",", "?")
  command_list.append(f'{building_id.replace(" ", "_")}:com.multiagent.BuildingAgent({latitude}, {longitude}, {btype}, {coordinates}, {consumption}, {building_roles_str} )')
  subprocess.Popen(command_list)

if __name__ == "__main__":
    uvicorn.run("gridlauncherapi:app", host="127.0.0.1", port=8500, reload=True)