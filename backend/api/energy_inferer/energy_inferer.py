from datetime import datetime, timedelta
from math import cos
import pandas as pd
from pvlib.pvsystem import PVSystem, retrieve_sam
from pvlib.location import Location
from pvlib.modelchain import ModelChain, get_orientation
from pvlib.forecast import GFS
from pvlib.temperature import TEMPERATURE_MODEL_PARAMETERS
from .altitude import AltitudeAPI
from .panelplacer import PanelPlacer

def get_module(latitude):
    sandia_modules = retrieve_sam('SandiaMod')
    #http://www.solardesigntool.com/components/module-panel-solar/Silevo/2272/Triex-U300-Black/specification-data-sheet.html
    module = sandia_modules['Silevo_Triex_U300_Black__2014_'] #1.68 square meters
    module['m_length'] = 1.586
    module['m_width'] = 1.056
    module["m_projected_length"] = module["m_length"]
    surface_tilt, surface_azimuth = get_orientation('south_at_latitude_tilt', latitude=latitude)
    module["m_projected_width"] = cos(surface_tilt) * module["m_width"] #module of projection vector
    return module

def get_inverter():
    sapm_inverters = retrieve_sam('cecinverter')
    inverter = sapm_inverters['ABB__MICRO_0_25_I_OUTD_US_208__208V_']
    return inverter

def get_panels_configuration(building_coordinates, latitude):
    module = get_module(latitude)
    panels = PanelPlacer.run(building_coordinates, module["m_projected_length"],  module["m_projected_width"])
    return {"panels" : panels}

def infere_energy_production(latitude, longitude, modules_per_string=2, strings_per_inverter=1) :
    module = get_module(latitude)
    inverter = get_inverter()
    temperature_model_parameters = TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']


    start = pd.Timestamp.now(tz='UTC')
    end = start + pd.Timedelta(hours=6)
    
    altitude = AltitudeAPI.get_altitude(latitude, longitude)
    system = PVSystem(module_parameters=module,
                    inverter_parameters=inverter,
                    temperature_model_parameters=temperature_model_parameters)
    location = Location(latitude, longitude, altitude=altitude)
    mc = ModelChain(system, location, orientation_strategy='south_at_latitude_tilt')
    system.modules_per_string = modules_per_string
    system.strings_per_inverter = strings_per_inverter

    forecast_model = GFS()
    data = forecast_model.get_processed_data(latitude, longitude, start, end)
    weather = data.resample('1h').interpolate()

    mc.run_model(weather)
    energy = mc.ac.to_dict()
    response = {str(key): value for key,value in energy.items()}
    return response 

if __name__ == "__main__":
    coordinates = [[-3.927226,38.9863099],[-3.9272596,38.98668819999999],[-3.9270083000000002,38.98672400000002],[-3.9269712000000006,38.98634019999999],[-3.9270596000000006,38.98633059999998],[-3.927226,38.9863099]]
    config = get_panels_configuration(coordinates, 38.986516950302786)
    production = infere_energy_production(38.986516950302786, -3.9271163376922886, config["modules_per_string"], config["strings_per_inverter"])
    print(config)
    print(production)