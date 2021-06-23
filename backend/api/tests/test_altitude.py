from ..energy_inferer.altitude import AltitudeAPI


def test_ciudad_real_altitude():
    latitude, longitude = 38.98626, -3.92907
    altitude = AltitudeAPI.get_altitude(latitude, longitude) 
    assert altitude != 0
    assert altitude == 634.2696533203125