from haversine import haversine, Unit
from shapely.geometry import Polygon, MultiPolygon
from descartes.patch import PolygonPatch
from matplotlib import pyplot
import numpy as np
from .figures import BLUE, SIZE, set_limits, plot_coords, color_isvalid

def panel_placer(coordinates, panel_height, panel_width):
  building_polygon = Polygon(coordinates)
  minx, miny, maxx, maxy = building_polygon.bounds
  height_distance = haversine((minx, miny), (minx, maxy), Unit.METERS)
  width_distance = haversine((minx, miny), (maxx, miny), Unit.METERS)
  print(height_distance, width_distance)
  panel_rows = (height_distance / panel_width)

  panel_columns = (width_distance / panel_height)
  print(panel_rows, panel_columns)
  coordinate_panel_height = (maxy - miny) / panel_rows
  coordinate_panel_width = (maxy - miny) / panel_columns

  correctly_placed_panels = []
  x = minx
  y = miny
  counter = 0
  #From bottom to top and from left to right
  while(y <= maxy):
    y2 = y + coordinate_panel_height 
    while(x <= maxx):
      x2 = x + coordinate_panel_width
      panel_coordinates = [[x,y], [x,y2], [x2,y2],[x2, y]]
      panel = Polygon(panel_coordinates)
      if panel.within(building_polygon):
        correctly_placed_panels.append(panel)
      counter += 1
      x = x2

    x = minx
    y = y2 + coordinate_panel_height * 0.5
  
  building_with_panels = [building_polygon] + correctly_placed_panels
  mp = MultiPolygon(building_with_panels)
  plot_building(mp)

def plot_building(multipolygon):
  fig = pyplot.figure()
  ax = fig.add_subplot(111)
  for polygon in multipolygon:
    plot_coords(ax, polygon.exterior)
    patch = PolygonPatch(polygon, facecolor=color_isvalid(multipolygon), edgecolor=color_isvalid(multipolygon, valid=BLUE), alpha=0.5, zorder=2)
    ax.add_patch(patch)
  ax.set_title('Building')
  pyplot.show()





  


  

if __name__ == "__main__":
  coordinates = [    [
      -3.9270508000000013,
      38.98714050000002
    ],
    [
      -3.9271121000000004,
      38.98712040000001
    ],
    [
      -3.9271165,
      38.98713059999999
    ],
    [
      -3.927150600000001,
      38.9872102
    ],
    [
      -3.9271961,
      38.987194599999995
    ],
    [
      -3.9272222000000006,
      38.98719399999998
    ],
    [
      -3.927317,
      38.98719160000001
    ],
    [
      -3.9273216000000004,
      38.98724609999998
    ],
    [
      -3.9273201000000006,
      38.987261700000005
    ],
    [
      -3.9273155,
      38.98727969999997
    ],
    [
      -3.9270774000000004,
      38.98746640000001
    ],
    [
      -3.9270242000000004,
      38.98740079999997
    ],
    [
      -3.9270038000000005,
      38.9873756
    ],
    [
      -3.926945000000001,
      38.98730299999998
    ],
    [
      -3.9270505000000004,
      38.98721439999998
    ],
    [
      -3.9270667000000006,
      38.987170100000014
    ],
    [
      -3.9270566000000007,
      38.9871521
    ],
    [
      -3.9270508000000013,
      38.98714050000002
    ]]
  panel_width, panel_length = 0.6, 1.586
  panel_placer(coordinates, panel_length, panel_width)
