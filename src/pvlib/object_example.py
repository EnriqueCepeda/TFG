from pvlib.pvsystem import PVSystem
from pvlib.location import Location
from pvlib.modelchain import ModelChain, get_orientation
from pvlib.forecast import GFS
import datetime
import pvlib
import pandas as pd

sandia_modules = pvlib.pvsystem.retrieve_sam('SandiaMod')
sapm_inverters = pvlib.pvsystem.retrieve_sam('cecinverter')

#http://www.solardesigntool.com/components/module-panel-solar/Silevo/2272/Triex-U300-Black/specification-data-sheet.html
module = sandia_modules['Silevo_Triex_U300_Black__2014_'] #1.68 square meters
module['mm_length'] = '1.586'
module['mm_width'] = '1.056'
print(sapm_inverters)
inverter = sapm_inverters['ABB__MICRO_0_25_I_OUTD_US_208__208V_']

temperature_model_parameters = pvlib.temperature.TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']

tz= 'Europe/Madrid'
start = pd.Timestamp(datetime.date.today(), tz=tz)
end = start + pd.Timedelta(days=7)

# very approximate
# latitude, longitude, name, altitude, timezone
latitude, longitude, name, altitude, timezone = (38.98626, -3.92907, 'Ciudad Real', 628, 'Europe/Madrid')
system = PVSystem(module_parameters=module,
                  inverter_parameters=inverter,
                  temperature_model_parameters=temperature_model_parameters,
                  modules_per_string=7, strings_per_inverter=5)
energies = {}
location = Location(latitude, longitude, name=name, altitude=altitude,
                    tz=timezone)

mc = ModelChain(system, location, orientation_strategy='south_at_latitude_tilt')
print(mc)
forecast_model = GFS()
forecast_data = forecast_model.get_processed_data(latitude, longitude, start, end)
mc.run_model(forecast_data)
weekly_energy = mc.ac.sum()
energies[name] = weekly_energy

energies = pd.Series(energies)
print(energies.round(0))