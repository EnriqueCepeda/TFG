from datetime import datetime
from math import cos
import pandas as pd
from pvlib.pvsystem import PVSystem, retrieve_sam
from pvlib.location import Location
from pvlib.modelchain import ModelChain, get_orientation
from pvlib.forecast import GFS, OWM
from pvlib.temperature import TEMPERATURE_MODEL_PARAMETERS
from .altitude import AltitudeAPI
from .panelplacer import PanelPlacer
import debugpy

debugpy.listen(5500)

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
    modules_per_string, strings_per_inverter = PanelPlacer.run(building_coordinates, module["m_projected_length"],  module["m_projected_width"])
    return {"modules_per_string" : modules_per_string,
            "strings_per_inverter" : strings_per_inverter}

def infere_energy_production(latitude, longitude, modules_per_string=2, strings_per_inverter=1) :
    module = get_module(latitude)
    inverter = get_inverter()
    temperature_model_parameters = TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']
    
    altitude = AltitudeAPI.get_altitude(latitude, longitude)
    system = PVSystem(module_parameters=module,
                    inverter_parameters=inverter,
                    temperature_model_parameters=temperature_model_parameters)
    location = Location(latitude, longitude, altitude=altitude)
    mc = ModelChain(system, location, orientation_strategy='south_at_latitude_tilt')
    system.modules_per_string = modules_per_string
    system.strings_per_inverter = strings_per_inverter

    start = datetime.now()
    forecast_model = OWM()

    #manage error from OWM model
    forecast_data = forecast_model.get_processed_data(latitude=latitude, longitude=longitude, start=start)
    mc.run_model(forecast_data)
    weekly_energy = mc.ac.to_dict()
    result = [[key, value] for key, value in weekly_energy.items()]
    return result

if __name__ == "__main__":
    coordinates = [[-3.9257092,38.98680649999998],[-3.9257349000000006,38.987052500000004],[-3.9258518000000002,38.98705109999998],[-3.9258518000000002,38.9870466],[-3.9258518000000002,38.98702580000002],[-3.925874100000001,38.98702580000002],[-3.9258751999999997,38.9870464],[-3.9259189000000014,38.9870464],[-3.9259178,38.9870084],[-3.9259555,38.987007699999985],[-3.9259595000000003,38.9868852],[-3.925937200000001,38.98688599999999],[-3.9259382,38.986861499999975],[-3.9259107,38.98686229999996],[-3.92591,38.98682209999996],[-3.9259098000000003,38.986808199999984],[-3.925869,38.98680790000002],[-3.9258711000000006,38.98683149999999],[-3.9258426000000006,38.98683149999999],[-3.925843700000001,38.986807699999964],[-3.9257092,38.98680649999998]]
    config = get_panels_configuration(coordinates, 38.98626)
    production = infere_energy_production(38.98626, -3.92907, config["modules_per_string"], config["strings_per_inverter"])
    print(config)
    print(production)