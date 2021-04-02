from haversine import haversine, Unit
from shapely.geometry import Polygon, MultiPolygon
from descartes.patch import PolygonPatch
from matplotlib import pyplot
from .figures import BLUE, PURPLE, plot_coords


class PanelPlacer:

  @staticmethod
  def get_cartesian_panel_height_width(panel_length, panel_width, building_bounds):
    minx, miny, maxx, maxy = building_bounds
    height_distance = haversine((minx, miny), (minx, maxy), Unit.METERS)
    width_distance = haversine((minx, miny), (maxx, miny), Unit.METERS)
    panel_rows = (height_distance / panel_width)

    panel_columns = (width_distance / panel_length)
    cartesian_panel_height = (maxy - miny) / panel_rows
    cartesian_panel_width = (maxy - miny) / panel_columns
    return cartesian_panel_height, cartesian_panel_width

  @staticmethod
  def run(coordinates, panel_length, panel_width):
    building_polygon = Polygon(coordinates)
    minx, miny, maxx, maxy = building_polygon.bounds
    cartesian_panel_height, cartesian_panel_width = PanelPlacer.get_cartesian_panel_height_width(panel_length, panel_width, building_polygon.bounds)
    correctly_placed_panels = []
    x = minx
    y = miny
    counter = 0
    #From bottom to top and from left to right
    while(y <= maxy):
      y2 = y + cartesian_panel_height 
      while(x <= maxx):
        x2 = x + cartesian_panel_width
        panel_coordinates = [[x,y], [x,y2], [x2,y2],[x2, y]]
        panel = Polygon(panel_coordinates)
        if panel.within(building_polygon):
          correctly_placed_panels.append(panel)
        counter += 1
        x = x2

      x = minx
      y = y2 + cartesian_panel_height * 0.5

    panels = len(correctly_placed_panels)
    panels_polygons = MultiPolygon(correctly_placed_panels)
    PanelPlacer.plot_building(panels_polygons, building_polygon)

  @staticmethod
  def add_polygon_to_plot(polygon, subplot, facecolor=BLUE, edgecolor=BLUE):
      plot_coords(subplot, polygon.exterior)
      patch = PolygonPatch(polygon, facecolor=facecolor, edgecolor=edgecolor, alpha=0.5, zorder=2)
      subplot.add_patch(patch)
      return subplot

  @staticmethod
  def plot_building(panels_polygons, building_polygon):
    fig = pyplot.figure()
    subplot = fig.add_subplot(111)
    subplot = PanelPlacer.add_polygon_to_plot(building_polygon, subplot, PURPLE, PURPLE)
    for polygon in panels_polygons:
      subplot= PanelPlacer.add_polygon_to_plot(polygon, subplot)
    #subplot.set(yticklabels=[], xticklabels=[])  # remove the tick labels
    #subplot.tick_params(left=False, bottom=False)  # remove the ticks
    #subplot.set_frame_on(False)
    #subplot.set_title('Building')
    subplot.axis("off")
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
