from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json
import time

from ..main import app, get_db, get_settings
from .. import config
from ..models import Base

SQLALCHEMY_DATABASE_URL = "sqlite:///api/tests/test.db"
_API_ROOT_ = "/api/v1"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

def get_settings_override():
    return config.Settings(test=True)

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_settings] = get_settings_override

client = TestClient(app)

def get_grid_fixture():
    with open("./api/tests/grid_test.json", "r") as file:
        grid = json.loads(file.read())
    return grid

def create_grid(grid_data):
    uri = f"{_API_ROOT_}/grid/launch"
    response = client.post(uri, headers={"Content-Type": "application/json"}, json = grid_data)
    return response

def get_grid_buildings(grid_id):
    uri = f"{_API_ROOT_}/grid/{grid_id}/buildings"
    response = client.get(uri)
    return response

def register_transaction(grid_id, sender_name, receiver_name, energy):
    uri = f"{_API_ROOT_}/grid/{grid_id}/transaction?{sender_name=!s}&{receiver_name=!s}&{energy=!s}"
    response = client.post(uri)
    return response

def get_non_fetched_transactions(grid_id, timestamp):
    uri = f"{_API_ROOT_}/grid/{grid_id}/transactions/{timestamp}"
    response = client.get(uri)
    return response

def get_building_address(latitude, longitude):
    uri = f"{_API_ROOT_}/building/address?{latitude=!s}&{longitude=!s}"
    response = client.get(uri)
    return response

def get_buildings_altitude(latitude, longitude):
    uri = f"{_API_ROOT_}/building/altitude?{latitude=!s}&{longitude=!s}"
    response = client.get(uri)
    return response

def test_create_grid():
    grid_data = get_grid_fixture()
    response = create_grid(grid_data)
    assert response.status_code == 201
    assert isinstance(response.json(), dict)

def test_get_grid_buildings():
    grid_data = get_grid_fixture()
    grid_id = create_grid(grid_data).json()["id"]
    response = get_grid_buildings(grid_id)
    assert response.status_code == 200
    response_dict = response.json()
    assert isinstance(response_dict, dict)
    assert len(response_dict.keys()) == 3

def test_register_transaction():
    grid_data = get_grid_fixture()
    grid_id = create_grid(grid_data).json()["id"]
    response_dict = get_grid_buildings(grid_id).json()
    dict_keys = list(response_dict.keys())
    building1_ol_id= response_dict[dict_keys[0]]["name"]
    building2_ol_id = response_dict[dict_keys[1]]["name"]
    response = register_transaction(grid_id, building1_ol_id, building2_ol_id, 80.432)
    assert response.status_code == 201
    assert isinstance(response_dict, dict)

def test_get_non_fetched_transactions():
    grid_data = get_grid_fixture()
    grid_id = create_grid(grid_data).json()["id"]
    response_dict = get_grid_buildings(grid_id).json()
    time_before_transaction_register = time.time()
    dict_keys = list(response_dict.keys())
    building1_name= response_dict[dict_keys[0]]["name"]
    building2_name = response_dict[dict_keys[1]]["name"]
    first_transaction_response = register_transaction(grid_id, building1_name, building2_name, 80.342)
    second_transaction_response = register_transaction(grid_id, building2_name, building1_name, 92.234)
    transactions_response = get_non_fetched_transactions(grid_id, time_before_transaction_register)
    response_text = transactions_response.text
    assert transactions_response.status_code == 200
    transactions_response_dict = transactions_response.json()
    assert isinstance(transactions_response_dict, list)
    assert len(transactions_response_dict) == 2

def test_get_building_address():
    grid_data = get_grid_fixture()
    building_data = grid_data[list(grid_data.keys())[1]]
    latitude, longitude = building_data["latitude"], building_data["longitude"]
    response = get_building_address(latitude, longitude)
    assert response.status_code == 200

def test_get_buildings_altitude():
    grid_data = get_grid_fixture()
    building_data =  list(grid_data.values())[0]
    latitude, longitude, = building_data["latitude"], building_data["longitude"]
    response = get_buildings_altitude(latitude, longitude)
    assert response.status_code == 200


