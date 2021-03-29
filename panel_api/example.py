import pandas as pd
import pvlib
import matplotlib.pyplot as plt

naive_times = pd.date_range(start='2015', end='2016', freq='15min')

# very approximate
# latitude, longitude, name, altitude, timezone
coordinates = [(30, -110, 'Tucson', 700, 'Etc/GMT+7'),
               (35, -105, 'Albuquerque', 1500, 'Etc/GMT+7'),
               (40, -120, 'San Francisco', 10, 'Etc/GMT+8'),
               (50, 10, 'Berlin', 34, 'Etc/GMT-1'),
               (38.98626, -3.92907, 'Ciudad Real', 628, 'Europe/Madrid')]



# get the module and inverter specifications from SAM
sandia_modules = pvlib.pvsystem.retrieve_sam('SandiaMod')

sapm_inverters = pvlib.pvsystem.retrieve_sam('cecinverter')

module = sandia_modules['Canadian_Solar_CS5P_220M___2009_']

inverter = sapm_inverters['ABB__MICRO_0_25_I_OUTD_US_208__208V_']

temperature_model_parameters = pvlib.temperature.TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']

# specify constant ambient air temp and wind for simplicity
temp_air = 20

wind_speed = 0

system = {'module': module, 'inverter': inverter,
          'surface_azimuth': 180}

energies = {}

for latitude, longitude, name, altitude, timezone in coordinates:
    times = naive_times.tz_localize(timezone, True, nonexistent='shift_forward')
    system['surface_tilt'] = latitude
    solpos = pvlib.solarposition.get_solarposition(times, latitude, longitude)
    dni_extra = pvlib.irradiance.get_extra_radiation(times)
    airmass = pvlib.atmosphere.get_relative_airmass(solpos['apparent_zenith'])
    pressure = pvlib.atmosphere.alt2pres(altitude)
    am_abs = pvlib.atmosphere.get_absolute_airmass(airmass, pressure)
    tl = pvlib.clearsky.lookup_linke_turbidity(times, latitude, longitude)
    cs = pvlib.clearsky.ineichen(solpos['apparent_zenith'], am_abs, tl,
                                 dni_extra=dni_extra, altitude=altitude)
    aoi = pvlib.irradiance.aoi(system['surface_tilt'], system['surface_azimuth'],
                               solpos['apparent_zenith'], solpos['azimuth'])
    total_irrad = pvlib.irradiance.get_total_irradiance(system['surface_tilt'],
                                                        system['surface_azimuth'],
                                                        solpos['apparent_zenith'],
                                                        solpos['azimuth'],
                                                        cs['dni'], cs['ghi'], cs['dhi'],
                                                        dni_extra=dni_extra,
                                                        model='haydavies')
    tcell = pvlib.temperature.sapm_cell(total_irrad['poa_global'],
                                        temp_air, wind_speed,
                                        **temperature_model_parameters)
    effective_irradiance = pvlib.pvsystem.sapm_effective_irradiance(
        total_irrad['poa_direct'], total_irrad['poa_diffuse'],
        am_abs, aoi, module)
    dc = pvlib.pvsystem.sapm(effective_irradiance, tcell, module)
    ac = pvlib.inverter.sandia(dc['v_mp'], dc['p_mp'], inverter)
    annual_energy = ac.sum()
    energies[name] = annual_energy


energies = pd.Series(energies)

# based on the parameters specified above, these are in W*hrs
print(energies.round(0))

energies.plot(kind='bar', rot=0)

plt.ylabel('Yearly energy yield (W hr)')


times = naive_times.tz_localize(timezone, True, nonexistent='shift_forward')
altitude = 628
pressure = pvlib.atmosphere.alt2pres(altitude)
result = pvlib.modelchain.basic_chain(times, 38.98626, -3.92907, module, inverter, temperature_model_parameters,  orientation_strategy='flat', altitude=altitude, pressure=pressure) 
print(result)
