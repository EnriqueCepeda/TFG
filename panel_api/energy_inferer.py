from pvlib.pvsystem import PVSystem
from pvlib.location import Location
from pvlib.modelchain import ModelChain
from pvlib.forecast import GFS, RAP
import datetime
import pvlib
import pandas as pd
from math import cos
from .pvpanel_placer import PanelPlacer


def infere_energy_production(building_coordinates):
    sandia_modules = pvlib.pvsystem.retrieve_sam('SandiaMod')
    sapm_inverters = pvlib.pvsystem.retrieve_sam('cecinverter')

    #http://www.solardesigntool.com/components/module-panel-solar/Silevo/2272/Triex-U300-Black/specification-data-sheet.html
    module = sandia_modules['Silevo_Triex_U300_Black__2014_'] #1.68 square meters
    module['m_length'] = 1.586
    module['m_width'] = 1.056
    inverter = sapm_inverters['ABB__MICRO_0_25_I_OUTD_US_208__208V_']
    print(inverter)
    temperature_model_parameters = pvlib.temperature.TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']

    tz = 'Europe/Madrid'
    start = pd.Timestamp(datetime.date.today(), tz=tz)
    end = start + pd.Timedelta(days=7)

    # very approximate
    # latitude, longitude, name, altitude, timezone
    latitude, longitude, name, altitude, timezone = (38.98626, -3.92907, 'Ciudad Real', 628, tz)
    system = PVSystem(module_parameters=module,
                    inverter_parameters=inverter,
                    temperature_model_parameters=temperature_model_parameters,
                    modules_per_string=7, 
                    strings_per_inverter=5)
    energies = {}
    location = Location(latitude, longitude, name=name, altitude=altitude,
                        tz=timezone)

    mc = ModelChain(system, location, orientation_strategy='south_at_latitude_tilt')
    surface_tilt, surface_azimuth = system.surface_tilt, system.surface_azimuth
    module["m_projected_width"] = cos(surface_tilt) * module["m_width"] #module of projection vector
    module["m_projected_length"] = module["m_length"]
    print(module["m_projected_width"], module["m_projected_length"])
    rows, panels_per_row = PanelPlacer.run(building_coordinates, module["m_projected_length"],  module["m_projected_width"])
    system.modules_per_string = panels_per_row
    system.strings_per_inverter = rows
    print(system.modules_per_string, system.strings_per_inverter)

    '''
    forecast_model = GFS()
    forecast_data = forecast_model.get_processed_data(latitude, longitude, start, end)
    mc.run_model(forecast_data)
    weekly_energy = mc.ac.sum()
    energies[name] = weekly_energy
    energies = pd.Series(energies)

    print(energies.round(0))
    '''

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

    infere_energy_production(coordinates)