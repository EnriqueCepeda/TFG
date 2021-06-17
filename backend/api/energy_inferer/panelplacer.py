from haversine import haversine, Unit
from shapely.geometry import Polygon, MultiPolygon
from descartes.patch import PolygonPatch
from matplotlib import pyplot
import math
from .figures import BLUE, PURPLE, plot_coords


class PanelPlacer:

  @classmethod
  def __get_cartesian_panel_height_width(cls, panel_length, panel_width, building_bounds):
    minx, miny, maxx, maxy = building_bounds
    height_distance = haversine((minx, miny), (minx, maxy), Unit.METERS)
    width_distance = haversine((minx, miny), (maxx, miny), Unit.METERS)
    panel_rows = (height_distance / panel_width)

    panel_columns = (width_distance / panel_length)
    cartesian_panel_height = (maxy - miny) / panel_rows
    cartesian_panel_width = (maxy - miny) / panel_columns
    return cartesian_panel_height, cartesian_panel_width

  @classmethod
  def run(cls, coordinates, panel_length, panel_width):
    building_polygon = Polygon(coordinates)
    minx, miny, maxx, maxy = building_polygon.bounds
    cartesian_panel_height, cartesian_panel_width = cls.__get_cartesian_panel_height_width(panel_length, panel_width, building_polygon.bounds)
    correctly_placed_panels = []
    x = minx
    y = miny
    panels = 0

    #From bottom to top and from left to right
    while(y <= maxy):
      y2 = y + cartesian_panel_height 
      while(x <= maxx):
        x2 = x + cartesian_panel_width
        panel_coordinates = [[x,y], [x,y2], [x2,y2],[x2, y]]
        panel = Polygon(panel_coordinates)
        if panel.within(building_polygon):
          correctly_placed_panels.append(panel)
          panels += 1
        x = x2

      x = minx
      y = y2 + cartesian_panel_height * 0.5

    ''' TO-DO: Find the optimum number for the inverter and remove the rest of the division'''
    panels_per_row = 10 
    rows = math.floor(panels / panels_per_row)
    return rows, panels_per_row 

  @classmethod
  def __add_polygon_to_plot(cls, polygon, subplot, facecolor=BLUE, edgecolor=BLUE):
      plot_coords(subplot, polygon.exterior)
      patch = PolygonPatch(polygon, facecolor=facecolor, edgecolor=edgecolor, alpha=0.5, zorder=2)
      subplot.add_patch(patch)
      return subplot

  @classmethod
  def plot_building(cls, correctly_placed_panels, building_polygon):
    panels_polygons = MultiPolygon(correctly_placed_panels)
    fig = pyplot.figure()
    subplot = fig.add_subplot(111)
    subplot = cls.__add_polygon_to_plot(building_polygon, subplot, PURPLE, PURPLE)
    for polygon in panels_polygons:
      subplot= cls.__add_polygon_to_plot(polygon, subplot)
    subplot.axis("off")
    pyplot.show()
