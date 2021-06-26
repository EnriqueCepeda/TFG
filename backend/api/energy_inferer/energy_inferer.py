from math import cos
import pandas as pd
import numpy as np
from pvlib.pvsystem import retrieve_sam
from pvlib.modelchain import get_orientation
from pvlib.forecast import GFS
from pvlib.temperature import TEMPERATURE_MODEL_PARAMETERS
import pvlib
from .panelplacer import PanelPlacer

ORIENTATION_STRATEGY='south_at_latitude_tilt'

def get_module(latitude):
    surface_tilt, surface_azimuth = get_orientation(ORIENTATION_STRATEGY, latitude=latitude)
    sandia_modules = retrieve_sam('SandiaMod')
    #http://www.solardesigntool.com/components/module-panel-solar/Silevo/2272/Triex-U300-Black/specification-data-sheet.html
    module = sandia_modules['Silevo_Triex_U300_Black__2014_'] #1.68 square meters
    module['m_length'] = 1.586
    module['m_width'] = 1.056
    module["m_projected_length"] = module["m_length"]
    module["m_projected_width"] = cos(surface_tilt) * module["m_width"] #module of projection vector
    return module

def convert_to_pvwatts(module):
    data = pd.DataFrame(
    np.array([[module['Isco'], module['Impo'], module['Voco'], module['Vmpo'], module['Vmpo']*module['Impo'], module['IXO'], module['IXXO']]]),
    columns=['i_sc', 'i_mp', 'v_oc', 'v_mp', 'p_mp', 'i_x', 'i_xx'],
    index=[0])
    return data

def get_panels_configuration(building_coordinates, latitude):
    module = get_module(latitude)
    panels = PanelPlacer.run(building_coordinates, module["m_projected_length"],  module["m_projected_width"])
    return {"panels" : panels}


def infere_energy_production(latitude, longitude, altitude=0, modules_per_string=2, strings_per_inverter=1):
    frequency = "1h"
    timezone = "UTC"
    temperature_model_parameters = TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']
    system = {}
    module = get_module(latitude)
    surface_tilt, surface_azimuth = get_orientation(ORIENTATION_STRATEGY, latitude=latitude)
    system["module"] = module
    system["surface_tilt"] = surface_tilt
    system["surface_azimuth"] = surface_azimuth

    #time series with only the current hour
    time_now = pd.Timestamp.now(tz=timezone).round('60min')
    start= time_now
    end= time_now
    times= pd.date_range(start, end, freq=frequency).tz_convert(timezone)


    #Gets real irradiance of the current hour
    start = time_now - pd.Timedelta(hours=3)
    end = start + pd.Timedelta(hours=6) 
    forecast_model = GFS()
    data = forecast_model.get_processed_data(latitude, longitude, start, end)
    weather = data.resample(frequency).interpolate()
    weather = weather.loc[time_now,:]



    solpos = pvlib.solarposition.get_solarposition(times, latitude, longitude)
    dni_extra = pvlib.irradiance.get_extra_radiation(times)
    airmass = pvlib.atmosphere.get_relative_airmass(solpos['apparent_zenith'])
    pressure = pvlib.atmosphere.alt2pres(altitude)
    am_abs = pvlib.atmosphere.get_absolute_airmass(airmass, pressure)
    angle_of_incidence = pvlib.irradiance.aoi(system['surface_tilt'], system['surface_azimuth'],
                               solpos['apparent_zenith'], solpos['azimuth'])
    total_irrad = pvlib.irradiance.get_total_irradiance(system['surface_tilt'],
                                                        system['surface_azimuth'],
                                                        solpos['apparent_zenith'],
                                                        solpos['azimuth'],
                                                        weather["dni"], weather["ghi"], weather["dhi"],
                                                        dni_extra=dni_extra,
                                                        model='haydavies')
    tcell = pvlib.temperature.sapm_cell(total_irrad['poa_global'],
                                        weather["temp_air"], weather["wind_speed"],
                                        **temperature_model_parameters)
    effective_irradiance = pvlib.pvsystem.sapm_effective_irradiance(
        total_irrad['poa_direct'], total_irrad['poa_diffuse'],
        am_abs, angle_of_incidence, system["module"])
    real_dc_data = pvlib.pvsystem.sapm(effective_irradiance, tcell, system["module"])
    real_dc_data_scaled = pvlib.pvsystem.scale_voltage_current_power(real_dc_data,
                                           voltage=modules_per_string,
                                           current=strings_per_inverter)

    
    #Is the maximum power with the current metheorological conditions
    pdc = real_dc_data_scaled.iloc[0]["p_mp"]

    module_pvwatts = convert_to_pvwatts(module)
    hypothetical_data_scaled = pvlib.pvsystem.scale_voltage_current_power(module_pvwatts,
                                        voltage=modules_per_string,
                                        current=strings_per_inverter)

    #Is the hypothetical maximum power, which is used as the inverter limit to avoid inverter clipping
    pdc0 = hypothetical_data_scaled.iloc[0]["p_mp"]
    ac_data = pvlib.inverter.pvwatts(pdc, pdc0) 
    ac_data = ac_data / 1000 #W to kW
    return ac_data 
    
if __name__ == "__main__":

    #coordinates = [[38.985699100000005,-3.9287349999999996],[38.985673700000035,-3.9288259999999995],[38.98571640000003,-3.9288482],[38.98574339999999,-3.9287609],[38.985699100000005,-3.9287349999999996]]
    #coordinates = [[-3.9322489000000007,38.98663880000001],[-3.932187,38.98674059999999],[-3.9323180000000004,38.986803799999976],[-3.9323816999999996,38.98669789999998],[-3.9322489000000007,38.98663880000001]]
    #coordinates = [[-3.927226,38.9863099],[-3.9272596,38.98668819999999],[-3.9270083000000002,38.98672400000002],[-3.9269712000000006,38.98634019999999],[-3.9270596000000006,38.98633059999998],[-3.927226,38.9863099]]
    #config = get_panels_configuration(coordinates, 38.986516950302786)
    production = infere_energy_production(38.985699100000005,-3.9287349999999996, modules_per_string=20, strings_per_inverter=1)
    print(production)