import requests
import json
import os
from urllib.parse import urlencode

class AltitudeAPI:

    GOOGLE_MAPS_URL='https://maps.googleapis.com/maps/api/elevation/json?'
    
    @classmethod
    def get_altitude(cls, latitude: float, longitude: float):
        maps_api_key = os.getenv('GOOGLE_MAPS_APIKEY', '')
        vars = {"locations": f"{latitude},{longitude}", "key": maps_api_key}
        url = cls.GOOGLE_MAPS_URL + urlencode(vars)
        headers = {}
        payload = {}
        try:
            response = requests.post(url, headers=headers, data=payload)
            print(response.status_code)
            text = response.text
            print (text)
            if response.status_code != 200:
                return 0
            else:        
                json_response = response.json()
                elevation = json_response["results"][0]["elevation"]
            return elevation
        except Exception:
            return 0
            


