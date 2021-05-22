package com.multiagent;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.math.BigDecimal;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.json.JSONArray;
import org.json.JSONObject;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import jade.core.Agent;
import jade.core.behaviours.*;

public class PostRequestAgent extends Agent {

    public void setup() {
        addBehaviour(new PostBehaviour(this));
    }

    public void takeDown() {

    }

}

class PostBehaviour extends Behaviour {

    private JSONObject data = null;
    private final String BUILDING_CONFIGURATION_URI = "http://localhost:8000/building/configuration";
    private final String ENERGY_CONSUMPTION_URI = "http://localhost:8000/building/consumption";

    public PostBehaviour(Agent a) {
        super(a);
    }

    public JSONObject getBuildingData(Object[] args) {
        Double latitude = Double.parseDouble((String) args[0]);
        Double longitude = Double.parseDouble((String) args[1]);
        String type = ((String) args[2]);
        String coordinates = ((String) args[3]).replace("?", ",");
        String consumption = ((String) args[4]).replace("?", ",");
        String buildingRoles = ((String) args[5]).replace("?", ",");
        JSONArray jsonCoordinates = new JSONArray(coordinates);
        JSONArray jsonConsumption = new JSONArray(consumption);
        JSONObject jsonBuildingRoles = new JSONObject(buildingRoles);
        JSONObject data = new JSONObject();
        data.put("latitude", latitude);
        data.put("longitude", longitude);
        data.put("type", type);
        data.put("coordinates", jsonCoordinates);
        data.put("consumption", jsonConsumption);
        data.put("buildingRoles", jsonBuildingRoles);

        if (BuildingType.PRODUCER.name().equalsIgnoreCase(type)
                || BuildingType.PROSUMER.name().equalsIgnoreCase(type)) {
            try {
                JSONObject configurationResponse = getPanelConfiguration(latitude, jsonCoordinates);
                data.put("modules_per_string", configurationResponse.getInt("modules_per_string"));
                data.put("strings_per_inverter", configurationResponse.getInt("strings_per_inverter"));
            } catch (IOException | URISyntaxException e) {
                System.out.println(e);
            }
        }

        return data;
    }

    public JSONObject getPanelConfiguration(Double latitude, JSONArray coordinates)
            throws IOException, ClientProtocolException, URISyntaxException {
        URIBuilder uriBuilder = new URIBuilder(this.BUILDING_CONFIGURATION_URI);
        uriBuilder.addParameter("latitude", latitude.toString());
        URI requestURI = uriBuilder.build();

        StringEntity requestEntity = new StringEntity(coordinates.toString(), ContentType.APPLICATION_JSON);
        HttpPost httpPost = new HttpPost(requestURI);
        httpPost.setEntity(requestEntity);

        CloseableHttpClient httpClient = HttpClients.createDefault();
        CloseableHttpResponse httpResponse = httpClient.execute(httpPost);
        InputStream responseStream = httpResponse.getEntity().getContent();
        JSONObject response = new JSONObject(IOUtils.toString(responseStream));
        return response;

    }

    public Double getBuildingProduction(Integer modules_per_string, Integer strings_per_inverter, Double latitude,
            Double longitude) throws URISyntaxException, ClientProtocolException, IOException {
        URIBuilder uriBuilder = new URIBuilder(this.ENERGY_CONSUMPTION_URI);
        uriBuilder.addParameter("latitude", latitude.toString());
        uriBuilder.addParameter("longitude", longitude.toString());
        uriBuilder.addParameter("strings_per_inverter", strings_per_inverter.toString());
        uriBuilder.addParameter("modules_per_string", modules_per_string.toString());
        URI requestURI = uriBuilder.build();
        HttpPost httpPost = new HttpPost(requestURI);
        CloseableHttpClient httpClient = HttpClients.createDefault();
        CloseableHttpResponse httpResponse = httpClient.execute(httpPost);
        InputStream responseStream = httpResponse.getEntity().getContent();
        JSONArray response = new JSONArray(IOUtils.toString(responseStream));
        System.out.println(response);
        return response.getJSONArray(0).getDouble(1);
    }

    public Double getEstimatedEnergy(JSONObject buildingData) {
        Double hourProduction = 0.0;
        int hour = Instant.now().atZone(ZoneOffset.UTC).getHour();
        Double hourConsumption = ((BigDecimal) (((JSONArray) (buildingData.get("consumption"))).get(hour)))
                .doubleValue();
        if (BuildingType.CONSUMER.name().equalsIgnoreCase(buildingData.getString("type"))) {
            hourProduction = -hourConsumption;
        } else {
            Integer modules_per_string = this.data.getInt("modules_per_string");
            Integer strings_per_inverter = this.data.getInt("strings_per_inverter");
            Double latitude = this.data.getDouble("latitude");
            Double longitude = this.data.getDouble("longitude");
            try {
                hourProduction = getBuildingProduction(modules_per_string, strings_per_inverter, latitude, longitude);
            } catch (URISyntaxException | IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            if (BuildingType.PROSUMER.name().equalsIgnoreCase(buildingData.getString("type"))) {
                hourProduction = hourProduction - hourConsumption;
            }
        }
        return hourProduction;
    }

    public void action() {
        System.out.println("I'm post request agent");
        Object[] args = this.myAgent.getArguments();
        if (args != null && args.length > 0) {
            if (this.data == null) {
                this.data = getBuildingData(args);
                System.out.println(this.data);
            }
            Double estimatedConsumedEnergy = getEstimatedEnergy(this.data);
            System.out.print(estimatedConsumedEnergy);
        }

    }

    public boolean done() {
        return true;
    }

    public int onEnd() {
        return 0;
    }
}
