from math import cos
import pandas as pd
import numpy as np
from pvlib.pvsystem import retrieve_sam
from pvlib.modelchain import get_orientation
from pvlib.forecast import GFS
from pvlib.temperature import TEMPERATURE_MODEL_PARAMETERS
import pvlib
from .panel_placer import PanelPlacer

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


def infere_energy_production(latitude, longitude, altitude, modules_per_string, strings_per_inverter):
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
    ac_data = ac_data / 1000 #Wh to kWh
    return ac_data 

def infere_energy_production_without_real_weather(latitude, longitude, altitude, modules_per_string, strings_per_inverter):

    frequency = "1h"
    timezone = "UTC"
    temperature_model_parameters = TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']
    system = {}
    module = get_module(latitude)
    surface_tilt, surface_azimuth = get_orientation(ORIENTATION_STRATEGY, latitude=latitude)
    system["module"] = module
    system["surface_tilt"] = surface_tilt
    system["surface_azimuth"] = surface_azimuth
    temp_air = 20
    wind_speed = 0

    #time series with only the current hour
    time_now = pd.Timestamp.now(tz=timezone).round('60min')
    start= time_now
    end= time_now
    times= pd.date_range(start, end, freq=frequency).tz_convert(timezone)

    solpos = pvlib.solarposition.get_solarposition(times, latitude, longitude)
    dni_extra = pvlib.irradiance.get_extra_radiation(times)
    airmass = pvlib.atmosphere.get_relative_airmass(solpos['apparent_zenith'])
    pressure = pvlib.atmosphere.alt2pres(altitude)
    am_abs = pvlib.atmosphere.get_absolute_airmass(airmass, pressure)
    tl = pvlib.clearsky.lookup_linke_turbidity(times, latitude, longitude)
    cs = pvlib.clearsky.ineichen(solpos['apparent_zenith'], am_abs, tl,
                                dni_extra=dni_extra, altitude=altitude)
    angle_of_incidence = pvlib.irradiance.aoi(system['surface_tilt'], system['surface_azimuth'],
                            solpos['apparent_zenith'], solpos['azimuth'])
    total_irrad = pvlib.irradiance.get_total_irradiance(system['surface_tilt'],
                                                        system['surface_azimuth'],
                                                        solpos['apparent_zenith'],
                                                        solpos['azimuth'],
                                                        cs["dni"], cs["ghi"], cs["dhi"],
                                                        dni_extra=dni_extra,
                                                        model='haydavies')
    tcell = pvlib.temperature.sapm_cell(total_irrad['poa_global'],
                                        temp_air, wind_speed,
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
    ac_data = ac_data / 1000 #Wh to kWh
    return ac_data 

    
if __name__ == "__main__":

    production = infere_energy_production(38.985699100000005,-3.9287349999999996, 0, modules_per_string=10, strings_per_inverter=5)
    print(production)