import requests
import json

class AltitudeAPI:

    URL='https://api.open-elevation.com/api/v1/lookup'
    
    @classmethod
    def get_altitude(cls, latitude: float, longitude: float):
        data= {"locations": [ {"latitude": latitude, "longitude": longitude} ] }
        serialized_data = json.dumps(data)
        headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
        try:
            response = requests.post(cls.URL, headers=headers, data=serialized_data)
            json_response = response.json()
            elevation = json_response["results"][0]["elevation"]
            return elevation
        except Exception:
            return 0
            


