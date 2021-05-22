from typing import Dict
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import uvicorn

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
    command_list.append(f'{building_id.replace(" ", "_")}:com.multiagent.BuildingAgent({latitude}, {longitude}, {btype}, {coordinates}, {consumption}, {building_roles_str} )')
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


if __name__ == "__main__":
    uvicorn.run("gridlauncherapi:app", host="127.0.0.1", port=8500)