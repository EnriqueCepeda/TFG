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
    module = sandia_modules['Canadian_Solar_CS5P_220M___2009_'] #1.68 square meters
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

def infere_energy_production(latitude, longitude, altitude=0, modules_per_string=2, strings_per_inverter=1) :
    module = get_module(latitude)
    inverter = get_inverter()
    temperature_model_parameters = TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']


    start = pd.Timestamp.now(tz='UTC')
    end = start + pd.Timedelta(hours=6)
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
    module = get_module(38.98626)
    print(module)
    inverter = get_inverter()
    print(inverter)
    #coordinates = [[38.985699100000005,-3.9287349999999996],[38.985673700000035,-3.9288259999999995],[38.98571640000003,-3.9288482],[38.98574339999999,-3.9287609],[38.985699100000005,-3.9287349999999996]]
    #coordinates = [[-3.9322489000000007,38.98663880000001],[-3.932187,38.98674059999999],[-3.9323180000000004,38.986803799999976],[-3.9323816999999996,38.98669789999998],[-3.9322489000000007,38.98663880000001]]
    #coordinates = [[-3.927226,38.9863099],[-3.9272596,38.98668819999999],[-3.9270083000000002,38.98672400000002],[-3.9269712000000006,38.98634019999999],[-3.9270596000000006,38.98633059999998],[-3.927226,38.9863099]]
    #config = get_panels_configuration(coordinates, 38.986516950302786)
    production = infere_energy_production(38.985699100000005,-3.9287349999999996, modules_per_string=1, strings_per_inverter=1)
    print(production)
    #print(config)