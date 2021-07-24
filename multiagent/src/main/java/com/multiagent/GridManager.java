package com.multiagent;

import jade.core.*;
import jade.core.Runtime;
import jade.wrapper.AgentController;
import jade.wrapper.ContainerController;
import jade.wrapper.StaleProxyException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

public class GridManager {

    private static GridManager instance;
    public HashMap<Integer, ContainerController> grid_controller = null;

    public static GridManager getInstance() {
        if (instance == null) {
            instance = new GridManager();
        }
        return instance;
    }

    public GridManager() {
        this.grid_controller = new HashMap<Integer, ContainerController>();
    }

    public void createSmartGrid(Integer grid_id, String payload) throws StaleProxyException {
        Runtime runtime = Runtime.instance();
        Profile profile = new ProfileImpl();
        profile.setParameter(Profile.CONTAINER_NAME, "Smart Grid " + grid_id);
        profile.setParameter(Profile.MAIN_HOST, "localhost");
        ContainerController container = runtime.createAgentContainer(profile);
        JSONObject data = new JSONObject(payload);
        JSONArray keys = data.names();

        JSONObject buildingRoles = new JSONObject();
        for (Object key : keys) {
            String buildingId = key.toString();
            String buildingRole = (data.getJSONObject(buildingId)).getString("type");
            buildingRoles.put(buildingId, buildingRole);
        }
        ArrayList<AgentController> agList = new ArrayList<AgentController>();
        System.out.println(buildingRoles);

        for (Object key : keys) {
            String buildingId = key.toString();
            JSONObject building = data.getJSONObject(buildingId);
            Double latitude = (Double) building.getDouble("latitude");
            Double longitude = (Double) building.getDouble("longitude");
            String type = (String) building.getString("type");
            Double altitude = (Double) building.getDouble("altitude");
            Integer panels = (Integer) building.getInt("panels");
            JSONArray coordinates = building.getJSONArray("coordinates");
            JSONArray consumption = building.getJSONArray("consumption");
            String agentName = "Grid" + grid_id + "-" + buildingId.replace(" ", "_");
            AgentController ag = container.createNewAgent(agentName, "com.multiagent.BuildingAgent", new Object[] {
                    latitude, longitude, type, coordinates, consumption, buildingRoles, grid_id, panels, altitude });// arguments

            agList.add(ag);
        }

        AgentController agl = container.createNewAgent("Grid" + grid_id + "-" + "grid_agent",
                "com.multiagent.GridAgent", new Object[] {});
        agList.add(agl);

        for (AgentController ag : agList) {
            ag.start();
        }
        this.grid_controller.put(grid_id, container);

    }

    public void killSmartGrid(Integer gridId) throws StaleProxyException, Exception {
        if (this.grid_controller.containsKey(gridId)) {
            ContainerController cc = this.grid_controller.get(gridId);
            cc.kill();
            this.grid_controller.remove(gridId);
        } else {
            throw new Exception("The Smart Grid does not exist");
        }

    }

    public static void main(String[] args) {

    }

}