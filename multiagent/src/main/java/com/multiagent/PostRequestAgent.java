package com.multiagent;

import java.io.IOException;
import java.io.InputStream;
import java.lang.Math;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Map;
import java.util.Vector;

import com.google.gson.Gson;

import java.util.Comparator;

import jade.core.Agent;
import jade.core.behaviours.*;
import jade.domain.DFService;
import jade.domain.FIPAAgentManagement.DFAgentDescription;
import jade.domain.FIPAAgentManagement.FailureException;
import jade.domain.FIPAAgentManagement.NotUnderstoodException;
import jade.domain.FIPAAgentManagement.Property;
import jade.domain.FIPAAgentManagement.RefuseException;
import jade.domain.FIPAAgentManagement.ServiceDescription;
import jade.domain.FIPAException;
import jade.domain.FIPANames;
import jade.lang.acl.ACLMessage;
import jade.lang.acl.MessageTemplate;
import jade.proto.ContractNetInitiator;
import jade.proto.ContractNetResponder;
import org.apache.commons.io.IOUtils;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.JSONObject;
import org.json.JSONArray;

public class PostRequestAgent extends Agent {

    public void setup() {
        addBehaviour(new PostBehaviour(this));
    }

    public void takeDown() {

    }

}

class PostBehaviour extends Behaviour {

    private JSONObject data = null;
    private final String BUILDING_CONFIGURATION_URI = "http://localhost:8000/api/v1/building/configuration";
    private final String ENERGY_CONSUMPTION_URI = "http://localhost:8000/api/v1/building/production";

    public PostBehaviour(Agent a) {
        super(a);
    }

    public JSONObject getBuildingData(Object[] args)
            throws ClientProtocolException, IOException, URISyntaxException, Exception {
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

            JSONObject configurationResponse = getPanelConfiguration(latitude, jsonCoordinates);
            data.put("modules_per_string", configurationResponse.getInt("modules_per_string"));
            data.put("strings_per_inverter", configurationResponse.getInt("strings_per_inverter"));

        }

        return data;
    }

    public JSONObject getPanelConfiguration(Double latitude, JSONArray coordinates)
            throws IOException, ClientProtocolException, URISyntaxException, Exception {
        System.out.println("Agent" + this.myAgent.getLocalName() + ": Getting panel configuration");
        URIBuilder uriBuilder = new URIBuilder(this.BUILDING_CONFIGURATION_URI);
        uriBuilder.addParameter("latitude", latitude.toString());
        URI requestURI = uriBuilder.build();

        StringEntity requestEntity = new StringEntity(coordinates.toString(), ContentType.APPLICATION_JSON);
        HttpPost httpPost = new HttpPost(requestURI);
        httpPost.setEntity(requestEntity);

        CloseableHttpClient httpClient = HttpClients.createDefault();
        CloseableHttpResponse httpResponse = httpClient.execute(httpPost);
        if (httpResponse.getStatusLine().getStatusCode() != 200) {
            System.out.println("Panel configuration cannot be obtained, deleting agent");
        }
        InputStream responseStream = httpResponse.getEntity().getContent();
        httpClient.close();
        JSONObject response = new JSONObject(IOUtils.toString(responseStream));
        return response;

    }

    public Double getBuildingProduction(Integer modules_per_string, Integer strings_per_inverter, Double latitude,
            Double longitude) throws URISyntaxException, ClientProtocolException, IOException, Exception {
        System.out.println("Agent" + this.myAgent.getLocalName() + ": Getting energy production");
        URIBuilder uriBuilder = new URIBuilder(this.ENERGY_CONSUMPTION_URI);
        uriBuilder.addParameter("latitude", latitude.toString());
        uriBuilder.addParameter("longitude", longitude.toString());
        uriBuilder.addParameter("strings_per_inverter", strings_per_inverter.toString());
        uriBuilder.addParameter("modules_per_string", modules_per_string.toString());
        URI requestURI = uriBuilder.build();
        System.out.println(requestURI);
        HttpPost httpPost = new HttpPost(requestURI);
        CloseableHttpClient httpClient = HttpClients.createDefault();
        CloseableHttpResponse httpResponse = httpClient.execute(httpPost);
        if (httpResponse.getStatusLine().getStatusCode() != 200) {
            System.out.println("Building production cannot be obtained, deleting agent");
        }
        InputStream responseStream = httpResponse.getEntity().getContent();
        httpClient.close();
        JSONObject response = new JSONObject(IOUtils.toString(responseStream));
        Double production = response.getDouble(JSONObject.getNames(response)[0]);
        return production;

    }

    public Double getEstimatedEnergy(JSONObject buildingData) throws ClientProtocolException, IOException, Exception {
        System.out.println("Agent" + this.myAgent.getLocalName() + ": Getting energy balance");
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
            hourProduction = getBuildingProduction(modules_per_string, strings_per_inverter, latitude, longitude);

            if (BuildingType.PROSUMER.name().equalsIgnoreCase(buildingData.getString("type"))) {
                hourProduction = hourProduction - hourConsumption;
            }
        }
        return hourProduction;
    }

    public void action() {
        Object[] args = this.myAgent.getArguments();
        if (args != null && args.length > 0) {
            try {
                if (this.data == null) {
                    this.data = getBuildingData(args);
                }
                Double estimatedConsumedEnergy;
                estimatedConsumedEnergy = getEstimatedEnergy(this.data);
                System.out.println(estimatedConsumedEnergy);
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
                System.out.println("Problems obtaining energy or building panel configuration, shutting down agent");
                this.myAgent.doDelete();
            }
        } else {
            System.out.println("Agent" + this.myAgent.getLocalName() + ": There are no arguments, shutting down agent");
            this.myAgent.doDelete();
        }

    }

    public boolean done() {
        return true;
    }

    public int onEnd() {
        return 0;
    }
}
