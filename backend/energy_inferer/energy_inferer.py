from datetime import datetime
from math import cos
import pandas as pd
from pvlib.pvsystem import PVSystem, retrieve_sam
from pvlib.location import Location
from pvlib.modelchain import ModelChain
from pvlib.forecast import GFS, OWM
from pvlib.temperature import TEMPERATURE_MODEL_PARAMETERS
from .altitude import AltitudeAPI
from .panelplacer import PanelPlacer



def get_module():
    sandia_modules = retrieve_sam('SandiaMod')
    #http://www.solardesigntool.com/components/module-panel-solar/Silevo/2272/Triex-U300-Black/specification-data-sheet.html
    module = sandia_modules['Silevo_Triex_U300_Black__2014_'] #1.68 square meters
    module['m_length'] = 1.586
    module['m_width'] = 1.056
    return module

def get_inverter():
    sapm_inverters = retrieve_sam('cecinverter')
    inverter = sapm_inverters['ABB__MICRO_0_25_I_OUTD_US_208__208V_']
    return inverter

def get_panels_organization(building_coordinates):
    module = get_module()
    modules_per_string, strings_per_inverter = PanelPlacer.run(building_coordinates, module["m_projected_length"],  module["m_projected_width"])
    return {"modules_per_string" : modules_per_string,
            "strings_per_inverter" : strings_per_inverter}

def infere_energy_production(modules_per_string=2, strings_per_inverter=1, latitude, longitude):
    module = get_module()
    inverter = get_inverter()
    temperature_model_parameters = TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']
    
    altitude = AltitudeAPI.get_altitude(latitude, longitude)
    system = PVSystem(module_parameters=module,
                    inverter_parameters=inverter,
                    temperature_model_parameters=temperature_model_parameters)
    location = Location(latitude, longitude, altitude=altitude)
    mc = ModelChain(system, location, orientation_strategy='south_at_latitude_tilt')
    
    surface_tilt, surface_azimuth = system.surface_tilt, system.surface_azimuth
    module["m_projected_width"] = cos(surface_tilt) * module["m_width"] #module of projection vector
    module["m_projected_length"] = module["m_length"]

    #rows, panels_per_row = PanelPlacer.run(building_coordinates, module["m_projected_length"],  module["m_projected_width"])
    system.modules_per_string = modules_per_string
    system.strings_per_inverter = string_per_inverter

    start = pd.Timedelta.now(tz="UTC")
    end = start + pd.Timedelta(hours=1)
    #manage error from OWM model
    forecast_data = forecast_model.get_processed_data(latitude=latitude, longitude=longitude, start=start, end=end)
    mc.run_model(forecast_data)
    weekly_energy = mc.ac.to_dict()
    return weekly_energy

if __name__ == "__main__":
    coordinates = [
    [42.39895182115834, -3.9239797040199833],
    [42.39892596199394, -3.924040860313712],
    [42.39893908455404, -3.92404524999857],
    [42.39904149204892, -3.9240792700554348],
    [42.3990214222293, -3.9241246633843017],
    [42.39902065031322, -3.9241507021937996],
    [42.39901756264913, -3.9242452799318532],
    [42.39908767838139,-3.9242498691467227],
    [42.399107748215656,-3.9242483726636084],
    [42.39913090572214,-3.9242437834487394],
    [42.39937110087334,-3.924006241661851],
    [42.39928670443304,-3.923953166377263],
    [42.39925428387012,-3.9239328141995804],
    [42.39916088183658,-3.923874152037573],
    [42.39904689546264,-3.9239794047232612],
    [42.39898990232922,-3.923995566745869],
    [42.39896674485852,-3.9239854904231657],
    [42.39895182115834,-3.9239797040199833]
    ]

    production = infere_energy_production(coordinates, 38.98626, -3.92907)
    print(production)