from haversine import haversine as haversine_distance, Unit
from shapely.geometry import Polygon, MultiPolygon
from descartes.patch import PolygonPatch
from matplotlib import pyplot

BLUE = '#6699cc'
PURPLE = '#5f468a'

class PanelPlacer:

  @classmethod
  def __get_cartesian_panel_height_width(cls, panel_length, panel_width, building_bounds):
    '''
    It converts the panel width and height on meters into distance in the cartesian system
    '''
    minx, miny, maxx, maxy = building_bounds
    #Calculates the distance between de x/y min point and the x/y max point
    width_distance = haversine_distance((minx, miny), (maxx, miny), Unit.METERS)  
    height_distance = haversine_distance((minx, miny), (minx, maxy), Unit.METERS)
    #It divides the distances previously calculated between the panel width and height
    #to obtain the maximum rows and columns of PV panels
    max_rows = height_distance / panel_width
    max_columns = width_distance / panel_length
    #It calculates finally the height and the width of a panel
    cartesian_panel_height = (maxy - miny) / max_rows
    cartesian_panel_width = (maxx - minx) / max_columns
    return cartesian_panel_height, cartesian_panel_width

  
  @classmethod
  def __coordinates_to_lonlat(cls, coordinates):
    '''
    It transforms the list of coordinates from the form
    [(lat,lon),(lat,lon),...] to the form [(lon,lat),(lon,lat),...] 
    
    This process is needed because in a cartesian system the longitude is the X axis 
    and the latitude the Y axis, but the coordinates are normally represented 
    by the form (latitude, longitude) 
    '''
    lonlat_list = []
    for vertex in coordinates:
      latitude, longitude = vertex
      lonlat_list.append([longitude, latitude])
    return lonlat_list

  @classmethod
  def run(cls, lanlon_coordinates, panel_length, panel_width):
    lonlat_coordinates = cls.__coordinates_to_lonlat(lanlon_coordinates)
    building_polygon = Polygon(lonlat_coordinates)
    building_bounds = building_polygon.bounds
    #The panel height and with in the cartesian coordinate system is gotten
    cartesian_panel_height, cartesian_panel_width = cls.__get_cartesian_panel_height_width(panel_length, panel_width, building_bounds)
    #The bounds are the maximum and minimum points of the building polygon on the y and x axis 
    minx, miny, maxx, maxy = building_bounds
    correctly_placed_panels = []
    max_panels = 0
    x = minx
    y = miny

    #An iteration from the bottom of the polygon to top and from the left part to the right one is done
    while(y <= maxy):
      y2 = y + cartesian_panel_height 
      while(x <= maxx):
        x2 = x + cartesian_panel_width
        panel_coordinates = [[x,y], [x,y2], [x2,y2], [x2, y]]
        #A polygon representing the panel vertices is constructed. 
        #If it is within the building polygon, it means that it fits inside,
        #the number of maximum panels on the roof-top of a building is incremented by one
        panel = Polygon(panel_coordinates)
        if panel.within(building_polygon):
          correctly_placed_panels.append(panel)
          max_panels += 1
        x = x2

      x = minx
      #Whereas there is no distance between panels on different columns, the distance between panel rows is one panel
      #This distance help to avoid panel shading, in which one panel shadows the one behind it
      y = y2 + cartesian_panel_height

    return max_panels


  

  @classmethod
  def __plot_coords(cls, ax, ob, color=PURPLE, zorder=1, alpha=1):
      x, y = ob.xy
      ax.plot(x, y, 'o', color=color, zorder=zorder, alpha=alpha)

  @classmethod
  def __add_polygon_to_plot(cls, polygon, subplot, facecolor=BLUE, edgecolor=BLUE):
      cls.__plot_coords(subplot, polygon.exterior)
      patch = PolygonPatch(polygon, facecolor=facecolor, edgecolor=edgecolor, alpha=0.5, zorder=2)
      subplot.add_patch(patch)
      return subplot

  @classmethod
  def plot_panel_installation(cls, correctly_placed_panels, building_polygon):
    '''
    It plots a panel installation
    '''
    panels_polygons = MultiPolygon(correctly_placed_panels)
    fig = pyplot.figure()
    subplot = fig.add_subplot(111)
    subplot = cls.__add_polygon_to_plot(building_polygon, subplot, PURPLE, PURPLE)
    for polygon in panels_polygons:
      subplot= cls.__add_polygon_to_plot(polygon, subplot)
    subplot.axis("off")
    pyplot.show()

  @classmethod
  def plot_building(cls, building_polygon):
    '''
    It plots the building polygon
    '''
    fig = pyplot.figure()
    subplot = fig.add_subplot(111)
    subplot.set_xlabel('LONGITUDE')
    subplot.set_ylabel('LATITUDE')
    subplot = cls.__add_polygon_to_plot(building_polygon, subplot, PURPLE, PURPLE)
    pyplot.show()


