package com.multiagent;

import java.io.IOException;
import java.io.InputStream;
import java.lang.Math;
import java.math.BigInteger;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
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
import jade.domain.FIPAAgentManagement.RefuseException;
import jade.domain.FIPAAgentManagement.ServiceDescription;
import jade.domain.FIPAException;
import jade.domain.FIPANames;
import jade.lang.acl.ACLMessage;
import jade.lang.acl.MessageTemplate;
import jade.proto.ContractNetInitiator;
import jade.proto.ContractNetResponder;

import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

class GridTime {

	static final int demoNexTimeMs = 3600000;
	Long demoActualTime = 1631088000000L; //10 AM
	// Long demoActualTime = Instant.now().toEpochMilli();
	
	public GridTime() {
	
	}

	public void updateTime() {
		this.demoActualTime += demoNexTimeMs;
	}

	public Long getTime(){
		return this.demoActualTime;
	}

}

public class BuildingAgent extends Agent {
	static final String REGISTER_TRANSACTION_URI = "http://localhost:8000/api/v1/grid/";
	static final String ENERGY_CONSUMPTION_URI = "http://localhost:8000/api/v1/building/production";
	static final int iterationTimeMs = 35000;
	static final boolean DEMO_MODE = true;
	public GridTime gridTime = new GridTime();

	public static void registerTransaction(Integer grid_id, String sender, String receiver, Double energy)
			throws URISyntaxException, ClientProtocolException, IOException {
		String finalURL = BuildingAgent.REGISTER_TRANSACTION_URI + grid_id + "/transaction";
		URIBuilder uriBuilder = new URIBuilder(finalURL);

		uriBuilder.addParameter("sender_name", getRealBuildingId(sender));
		uriBuilder.addParameter("receiver_name", getRealBuildingId(receiver));
		uriBuilder.addParameter("energy", energy.toString());

		URI requestURI = uriBuilder.build();
		HttpPost httpPost = new HttpPost(requestURI);

		CloseableHttpClient httpClient = HttpClients.createDefault();
		CloseableHttpResponse httpResponse = httpClient.execute(httpPost);
		if (httpResponse.getStatusLine().getStatusCode() != 201) {
			System.out.println("Transaction could not be registered");
		}
		InputStream responseStream = httpResponse.getEntity().getContent();
		httpClient.close();

	}

	public GridTime getGridTime(){
		return this.gridTime;
	}

	public static void registerTransaction(Integer grid_id, String sender, String receiver, Double energy, Long timestamp)
			throws URISyntaxException, ClientProtocolException, IOException {
		String finalURL = BuildingAgent.REGISTER_TRANSACTION_URI + grid_id + "/transaction";
		URIBuilder uriBuilder = new URIBuilder(finalURL);

		uriBuilder.addParameter("sender_name", getRealBuildingId(sender));
		uriBuilder.addParameter("receiver_name", getRealBuildingId(receiver));
		uriBuilder.addParameter("energy", energy.toString());

		Timestamp ts = new Timestamp(timestamp);
		String transactionTimestamp = Long.toString(ts.getTime());
		uriBuilder.addParameter("grid_timestamp", transactionTimestamp);

		URI requestURI = uriBuilder.build();
		HttpPost httpPost = new HttpPost(requestURI);

		CloseableHttpClient httpClient = HttpClients.createDefault();
		CloseableHttpResponse httpResponse = httpClient.execute(httpPost);
		if (httpResponse.getStatusLine().getStatusCode() != 201) {
			System.out.println("Transaction could not be registered");
		}
		InputStream responseStream = httpResponse.getEntity().getContent();
		httpClient.close();

	}

	public static String getRealBuildingId(String agentName) {
		if (agentName.equals("grid_agent")) {
			return agentName;
		} else {
			return agentName.split("-")[1];
		}
	}

	protected void setup() {
		addBehaviour(new BuildingAgentInitiator(this));
	}

	protected void takeDown() {
		System.out.println("Agent " + getLocalName() + ": Freeing resources");
		try {
			DFService.deregister(this);
			System.out.println("Agent " + getLocalName() + " has been unregistered from the DF");
		} catch (FIPAException e) {
			System.out.println("Agent " + getLocalName() + " was already unregistered from the DF");
		}
	}

}

class BuildingAgentInitiator extends OneShotBehaviour {
	private JSONObject data = null;

	public BuildingAgentInitiator(Agent agent) {
		super(agent);
	}

	public BuildingAgentInitiator(Agent agent, JSONObject data) {
		super(agent);
		this.data = data;
	}

	public JSONObject getBuildingData(Object[] args)
			throws ClientProtocolException, IOException, URISyntaxException, Exception {
		Double latitude = (Double) args[0];
		Double longitude = (Double) args[1];
		String type = (String) args[2];
		JSONArray jsonCoordinates = (JSONArray) args[3];
		JSONArray jsonConsumption = (JSONArray) args[4];
		JSONObject jsonBuildingRoles = (JSONObject) args[5];
		Integer grid_id = (Integer) args[6];
		Integer panels = (Integer) args[7];
		Double altitude = (Double) args[8];
		String userTimeZone = (String) args[9];
		JSONObject data = new JSONObject();
		data.put("latitude", latitude);
		data.put("longitude", longitude);
		data.put("altitude", altitude);
		data.put("type", type);
		data.put("coordinates", jsonCoordinates);
		data.put("consumption", jsonConsumption);
		data.put("buildingRoles", jsonBuildingRoles);
		data.put("grid_id", grid_id);
		data.put("panels", panels);
		data.put("userTimeZone", userTimeZone);

		if (BuildingType.PRODUCER.name().equalsIgnoreCase(type)
				|| BuildingType.PROSUMER.name().equalsIgnoreCase(type)) {

			if (panels < 10) {
				data.put("modules_per_string", panels);
				data.put("strings_per_inverter", 1);
			} else {
				data.put("modules_per_string", 10);
				data.put("strings_per_inverter", (int) panels / 10);
			}
		}

		return data;
	}

	public Double getBuildingProduction(Double latitude, Double longitude, Double altitude, Integer modules_per_string,
			Integer strings_per_inverter) throws URISyntaxException, ClientProtocolException, IOException, Exception {

		Timestamp ts = null;
		if (BuildingAgent.DEMO_MODE) {
			ts = new Timestamp(((BuildingAgent) this.myAgent).gridTime.getTime());
		} else {
			ts = Timestamp.from(Instant.now().atZone(ZoneOffset.UTC).toInstant());
		}
		String transactionTimestamp = Long.toString(ts.getTime());

		URIBuilder uriBuilder = new URIBuilder(BuildingAgent.ENERGY_CONSUMPTION_URI);
		uriBuilder.addParameter("latitude", latitude.toString());
		uriBuilder.addParameter("longitude", longitude.toString());
		uriBuilder.addParameter("altitude", altitude.toString());
		uriBuilder.addParameter("strings_per_inverter", strings_per_inverter.toString());
		uriBuilder.addParameter("modules_per_string", modules_per_string.toString());
		uriBuilder.addParameter("timestamp", transactionTimestamp);

		URI requestURI = uriBuilder.build();
		HttpGet httpGet = new HttpGet(requestURI);
		CloseableHttpClient httpClient = HttpClients.createDefault();
		CloseableHttpResponse httpResponse = httpClient.execute(httpGet);
		if (httpResponse.getStatusLine().getStatusCode() != 200) {
			System.out.println("Building production cannot be obtained, deleting agent");
			return 0.0;
		} else {
			HttpEntity entity = httpResponse.getEntity();
			if (entity != null) {
				// return it as a String
				String result = EntityUtils.toString(entity);
				JSONObject productionResult = new JSONObject(result);
				System.out.println("Agent " + this.myAgent.getLocalName() + ": " + productionResult
						.getDouble("production") + " Kwh");
				return productionResult.getDouble("production");
			} else {
				return 0.0;
			}
		}
	}

	public int getNearestHour(ZonedDateTime dt) {
		int minutes = dt.getMinute();
		if (minutes >= 30) {
			dt = dt.plusHours(1);
		}

		// Round down
		dt = dt.truncatedTo(ChronoUnit.HOURS);
		return dt.getHour();
	}

	public Double getEstimatedEnergy(JSONObject buildingData) throws ClientProtocolException, IOException, Exception {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Getting energy balance");
		Double hourProduction = 0.0;
		ZoneId userTimeZone = ZoneId.of(buildingData.getString("userTimeZone"));
		int hour = 0;
		if (BuildingAgent.DEMO_MODE) {
			ZonedDateTime dt = Instant.ofEpochMilli(((BuildingAgent)this.myAgent).gridTime.getTime()).atZone(userTimeZone);
			hour = getNearestHour(dt);
		} else {
			ZonedDateTime dt = Instant.now().atZone(userTimeZone);
			hour = getNearestHour(dt);
		}
		Double hourConsumption = ((JSONArray) (buildingData.get("consumption"))).getDouble(hour);
		if (BuildingType.CONSUMER.name().equalsIgnoreCase(buildingData.getString("type"))) {
			hourProduction = -hourConsumption;
		} else {
			Double latitude = this.data.getDouble("latitude");
			Double longitude = this.data.getDouble("longitude");
			Double altitude = this.data.getDouble("altitude");
			Integer modules_per_string = this.data.getInt("modules_per_string");
			Integer strings_per_inverter = this.data.getInt("strings_per_inverter");
			hourProduction = getBuildingProduction(latitude, longitude, altitude, modules_per_string,
					strings_per_inverter);

			if (BuildingType.PROSUMER.name().equalsIgnoreCase(buildingData.getString("type"))) {
				if (hourProduction > 0) {
					if (BuildingAgent.DEMO_MODE){
						BuildingAgent.registerTransaction(this.data.getInt("grid_id"), this.myAgent.getLocalName(),
								this.myAgent.getLocalName(), Math.min(hourProduction, hourConsumption), 
								((BuildingAgent) this.myAgent).gridTime.getTime());
					}else{
						BuildingAgent.registerTransaction(this.data.getInt("grid_id"), this.myAgent.getLocalName(),
								this.myAgent.getLocalName(), Math.min(hourProduction, hourConsumption));
					}
				}
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
				if (estimatedConsumedEnergy >= 0) {
					this.myAgent.addBehaviour(
							new ProducerInitiatiorBehaviour(this.myAgent, estimatedConsumedEnergy, this.data));
				} else {
					this.myAgent.addBehaviour(new ConsumerRegistrationBehaviour(this.myAgent,
							Math.abs(estimatedConsumedEnergy), "Producer", this.data));
				}
			} catch (Exception e) {
				e.printStackTrace();
				this.myAgent.doDelete();
			}
		} else {
			System.out.println("Agent" + this.myAgent.getLocalName() + ": There are no arguments, shutting down agent");
			this.myAgent.doDelete();
		}

	}
}

class RefreshDataBehaviour extends TickerBehaviour {
	JSONObject data;

	public RefreshDataBehaviour(Agent agent, long period, JSONObject data) {
		super(agent, period);
		this.data = data;
	}

	protected void onTick() {
		this.myAgent.addBehaviour(new BuildingAgentInitiator(this.myAgent, this.data));
		((BuildingAgent) this.myAgent).gridTime.updateTime();
		this.myAgent.removeBehaviour(this);

	}

}

class CheckFinishedConsumersBehaviour extends TickerBehaviour {

	JSONObject data;
	ProducerBehaviour producerBehaviour;

	public CheckFinishedConsumersBehaviour(Agent agent, JSONObject data, ProducerBehaviour producerBehaviour) {
		super(agent, 5000);
		this.data = data;
		this.producerBehaviour = producerBehaviour;
	}

	protected void onTick() {
		DFAgentDescription description = new DFAgentDescription();
		ServiceDescription service = new ServiceDescription();
		service.setName("type service");
		service.setType("Consumer");
		description.addServices(service);
		ServiceDescription gridservice = new ServiceDescription();
		gridservice.setName("grid service");
		gridservice.setType(String.valueOf(data.getInt("grid_id")));
		description.addServices(gridservice);
		DFAgentDescription[] consumers = null;

		try {
			consumers = DFService.search(this.myAgent, description);
		} catch (Exception e) {
			e.printStackTrace();
		}

		if (consumers != null && consumers.length == 0) {
			if (this.producerBehaviour.remainingEnergy > 0) {
				try {
					if (BuildingAgent.DEMO_MODE){
						BuildingAgent.registerTransaction(this.data.getInt("grid_id"), this.myAgent.getLocalName(),
								"grid_agent", this.producerBehaviour.remainingEnergy, 
								((BuildingAgent) this.myAgent).gridTime.getTime());
					}else{
					BuildingAgent.registerTransaction(this.data.getInt("grid_id"), this.myAgent.getLocalName(),
							"grid_agent", this.producerBehaviour.remainingEnergy);
					}
				} catch (JSONException | URISyntaxException | IOException e1) {
					e1.printStackTrace();
					System.out.println("Problems registering final transaction producer");
				}
			}

			System.out.println("Agent " + this.myAgent.getLocalName() + ": Unregistering from DF");
			this.myAgent.removeBehaviour(this.producerBehaviour);
			try {
				DFService.deregister(this.myAgent);
			} catch (FIPAException e) {
				e.printStackTrace();
			}

			this.myAgent.addBehaviour(new RefreshDataBehaviour(this.myAgent, BuildingAgent.iterationTimeMs, this.data));
			this.myAgent.removeBehaviour(this);

		}

	}
}

class ProducerInitiatiorBehaviour extends OneShotBehaviour {

	Double estimation = 0.0;
	JSONObject data = null;
	String producerType = null;
	Integer grid_id = null;

	public ProducerInitiatiorBehaviour(Agent agent, Double estimation, JSONObject data) {
		super(agent);
		this.estimation = estimation;
		this.producerType = "Producer";
		this.data = data;
	}

	public ProducerInitiatiorBehaviour(Agent agent, Double estimation, Integer grid_id) {
		super(agent);
		this.estimation = estimation;
		this.producerType = "Grid agent";
		this.grid_id = grid_id;
	}

	public void action() {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Energy -> " + this.estimation + " Kwh");
		DFAgentDescription description = new DFAgentDescription();
		description.setName(this.myAgent.getAID());
		description.addOntologies("FProducer");

		ServiceDescription service = new ServiceDescription();
		// Producer or grid agent, to identify the true role of the agent
		service.setType(this.producerType);
		service.setName("type service");
		description.addServices(service);
		if (this.producerType == "Producer") {
			ServiceDescription gridservice = new ServiceDescription();
			gridservice.setName("grid service");
			gridservice.setType(String.valueOf(data.getInt("grid_id")));
			description.addServices(gridservice);
		} else if (this.producerType == "Grid agent") {
			ServiceDescription gridservice = new ServiceDescription();
			gridservice.setName("grid service");
			gridservice.setType(this.grid_id.toString());
			description.addServices(gridservice);
		}

		try {
			DFService.register(this.myAgent, description);
		} catch (FIPAException e) {
			e.printStackTrace();
		}

		MessageTemplate template = MessageTemplate.and(
				MessageTemplate.MatchProtocol(FIPANames.InteractionProtocol.FIPA_CONTRACT_NET),
				MessageTemplate.MatchPerformative(ACLMessage.CFP));
		this.myAgent.addBehaviour(new ProducerBehaviour(this.myAgent, template, this.estimation, this.data));
	}

}

class ProducerBehaviour extends ContractNetResponder {

	Double remainingEnergy = 0.0;
	JSONObject data = null;
	boolean checkingBehaviourAdded = false;

	public ProducerBehaviour(Agent agente, MessageTemplate template, Double estimation, JSONObject data) {
		super(agente, template);
		this.remainingEnergy = estimation;
		this.data = data;
	}

	@Override
	protected ACLMessage handleCfp(ACLMessage cfp) throws NotUnderstoodException, RefuseException {
		if (!checkingBehaviourAdded && this.data != null) {
			checkingBehaviourAdded = true;
			this.myAgent.addBehaviour(new CheckFinishedConsumersBehaviour(this.myAgent, this.data, this));
		}
		System.out.println("Agent " + this.myAgent.getLocalName() + ": CFP received from "
				+ cfp.getSender().getLocalName() + " of " + cfp.getContent() + " Kwh");

		if (this.remainingEnergy > 0) {
			Double proposal = Double.parseDouble(cfp.getContent());
			Double offeredEnergy = 0.0;
			if (this.remainingEnergy - proposal < 0) {
				offeredEnergy = this.remainingEnergy;
			} else {
				offeredEnergy = proposal;
			}
			// The agent energy can be consumed throughout the energy sharing process.
			ACLMessage propose = cfp.createReply();
			System.out.println("Agent " + this.myAgent.getLocalName() + ": Proposing " + offeredEnergy + " Kwh to "
					+ cfp.getSender().getLocalName());
			propose.setPerformative(ACLMessage.PROPOSE);
			propose.setContent(String.valueOf(offeredEnergy));
			return propose;
		} else {
			throw new RefuseException("No availability of energy");
		}
	}

	@Override
	protected ACLMessage handleAcceptProposal(ACLMessage cfp, ACLMessage propose, ACLMessage accept)
			throws FailureException {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Proposal accepted");
		System.out.println(
				"Agent " + this.myAgent.getLocalName() + ": Action successfully performed " + accept.getContent());
		Double estimationOneHour = Double.parseDouble(accept.getContent());
		ACLMessage inform = accept.createReply();
		this.remainingEnergy = this.remainingEnergy - estimationOneHour;
		inform.setContent(String.valueOf(estimationOneHour));
		inform.setPerformative(ACLMessage.INFORM);
		return inform;

	}

	protected void handleRejectProposal(ACLMessage cfp, ACLMessage propose, ACLMessage reject) {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Proposal rejected");
	}
}

class ConsumerRegistrationBehaviour extends OneShotBehaviour {

	Double energyNeed = 0.0;
	JSONObject data = null;
	String producerType = null;

	public ConsumerRegistrationBehaviour(Agent agent, Double energyNeed, String producerType, JSONObject data) {
		super(agent);
		this.energyNeed = energyNeed;
		this.producerType = producerType;
		this.data = data;
	}

	public void action() {
		DFAgentDescription description = new DFAgentDescription();
		description.setName(this.myAgent.getAID());
		if (!this.data.getString("type").equals("Consumer")) {
			description.addOntologies("FProducer");
		} else {
			description.addOntologies("Consumer");
		}
		ServiceDescription service = new ServiceDescription();
		service.setName("type service");
		service.setType("Consumer");
		description.addServices(service);

		ServiceDescription gridservice = new ServiceDescription();
		gridservice.setName("grid service");
		gridservice.setType(String.valueOf(data.getInt("grid_id")));
		description.addServices(gridservice);
		try {
			DFService.register(this.myAgent, description);
		} catch (FIPAException e) {
			e.printStackTrace();
		}

		this.myAgent.addBehaviour(
				new ConsumerInitiatorBehaviour(this.myAgent, this.energyNeed, this.producerType, this.data));

	}
}

class ConsumerInitiatorBehaviour extends Behaviour {

	Double energyNeed = 0.0;
	JSONObject data = null;
	String producerType = null;
	Boolean finish = false;

	public ConsumerInitiatorBehaviour(Agent agent, Double energyNeed, String producerType, JSONObject data) {
		super(agent);
		this.energyNeed = energyNeed;
		this.producerType = producerType;
		this.data = data;
	}

	public void action() {

		DFAgentDescription description = new DFAgentDescription();
		description.addOntologies("FProducer");

		DFAgentDescription[] dfProducersAndProsumers = null;
		ServiceDescription gridservice = new ServiceDescription();
		gridservice.setName("grid service");
		gridservice.setType(String.valueOf(this.data.getInt("grid_id")));
		description.addServices(gridservice);

		try {
			dfProducersAndProsumers = DFService.search(this.myAgent, description);
		} catch (Exception e) {
			e.printStackTrace();
		}

		int producersAndProsumersRoles = 1; // grid agent

		Collection<String> roles = (Collection<String>) (new Gson()
				.fromJson(this.data.getJSONObject("buildingRoles").toString(), Map.class).values());
		for (String role : roles) {
			if (role.equals("Prosumer") || role.equals("Producer")) {
				producersAndProsumersRoles++;
			}
		}

		if (dfProducersAndProsumers != null && producersAndProsumersRoles == dfProducersAndProsumers.length) {
			// The description + the service finds the real producers and the prosumers
			// which produces, as they have a service.
			ServiceDescription service = new ServiceDescription();
			service.setName("type service");
			service.setType(this.producerType);
			description.addServices(service);

			DFAgentDescription[] dfProducersOrGrid = null;

			try {
				dfProducersOrGrid = DFService.search(this.myAgent, description);
			} catch (Exception e) {
				e.printStackTrace();
			}

			this.finish = true;

			if (dfProducersOrGrid.length == 0) {
				System.out.println("Agent " + this.myAgent.getLocalName() + ": No producers, asking grid agent for: "
						+ this.energyNeed + " Kwh");
				this.myAgent.addBehaviour(
						new ConsumerInitiatorBehaviour(this.myAgent, this.energyNeed, "Grid agent", this.data));

			} else {
				ACLMessage msgInitiator = new ACLMessage(ACLMessage.CFP);
				// Only if all producers are ready
				for (int i = 0; i < dfProducersOrGrid.length; ++i) {
					System.out.println("Agent " + this.myAgent.getLocalName() + ": Sending energy request to "
							+ dfProducersOrGrid[i].getName().getLocalName());
					msgInitiator.addReceiver(dfProducersOrGrid[i].getName());
				}

				int waitForOffersMilliseconds = 10000;
				msgInitiator.setReplyByDate(new Date(System.currentTimeMillis() + waitForOffersMilliseconds));
				msgInitiator.setProtocol(FIPANames.InteractionProtocol.FIPA_CONTRACT_NET);
				msgInitiator.setContent(Double.toString(this.energyNeed));
				this.myAgent
						.addBehaviour(new ConsumerBehaviour(this.myAgent, msgInitiator, this.energyNeed, this.data));
			}

		} else {
			block(1000);
		}

	}

	@Override
	public boolean done() {
		return this.finish;
	}

}

class ConsumerBehaviour extends ContractNetInitiator {

	Double agreedEnergy = 0.0;
	int offersWithoutResponse = 0;
	JSONObject data = null;

	public ConsumerBehaviour(Agent agent, ACLMessage message, Double agreedEnergy, JSONObject data) {
		super(agent, message);
		this.agreedEnergy = agreedEnergy;
		this.data = data;
	}

	protected void handlePropose(ACLMessage propose, Vector v) {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Agent " + propose.getSender().getName()
				+ " proposed " + propose.getContent() + "Kwh");
	}

	protected void handleRefuse(ACLMessage refuse) {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Agent " + refuse.getSender().getName()
				+ " refused to make an energy proposal");
	}

	protected void handleFailure(ACLMessage failure) {
		this.offersWithoutResponse--;
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Agent " + failure.getSender().getName()
				+ " failed providing the energy");
		if (this.offersWithoutResponse == 0 && this.agreedEnergy > 0) {
			System.out.println(
					"Agent " + this.myAgent.getLocalName() + ": Asking grid agent for: " + this.agreedEnergy + " Kwh");
			this.myAgent.addBehaviour(
					new ConsumerInitiatorBehaviour(this.myAgent, this.agreedEnergy, "Grid agent", this.data));
			this.myAgent.removeBehaviour(this);
		}

	}

	protected void handleInform(ACLMessage inform) {
		this.offersWithoutResponse--;
		Double energyTaken = Double.parseDouble(inform.getContent());
		this.agreedEnergy -= energyTaken;
		try {
			if (BuildingAgent.DEMO_MODE){
				BuildingAgent.registerTransaction(this.data.getInt("grid_id"), inform.getSender().getLocalName(),
						this.myAgent.getLocalName(), energyTaken, ((BuildingAgent) this.myAgent).gridTime.getTime());
			}else{
			BuildingAgent.registerTransaction(this.data.getInt("grid_id"), inform.getSender().getLocalName(),
					this.myAgent.getLocalName(), energyTaken);
			}
		} catch (URISyntaxException | IOException e1) {
			e1.printStackTrace();
		}
		System.out.println("Agent " + this.myAgent.getLocalName()
				+ ": Energy transaction have been completed succesfully: " + energyTaken + "Kwh received");
		if (this.agreedEnergy == 0) {
			try {
				DFService.deregister(this.myAgent);
			} catch (FIPAException e) {
				e.printStackTrace();
			}
			// Initializes the BuildingAgentInitiatorBehaviour in an hour
			System.out.println("Agent " + this.myAgent.getLocalName() + ": Unregistering from DF");
			this.myAgent.addBehaviour(new RefreshDataBehaviour(this.myAgent, BuildingAgent.iterationTimeMs, this.data));
			this.myAgent.removeBehaviour(this);
		} else if (this.offersWithoutResponse == 0 && this.agreedEnergy > 0) {
			System.out.println(
					"Agent " + this.myAgent.getLocalName() + ": Asking grid agent for: " + this.agreedEnergy + " Kwh");
			this.myAgent.addBehaviour(
					new ConsumerInitiatorBehaviour(this.myAgent, this.agreedEnergy, "Grid agent", this.data));
			this.myAgent.removeBehaviour(this);
		}
	}

	protected class ACLSorterByEnergy implements Comparator<ACLMessage> {
		// Sorts messages of a list in descending order
		public int compare(ACLMessage a, ACLMessage b) {
			Double energyA = Double.parseDouble(a.getContent());
			Double energyB = Double.parseDouble(b.getContent());
			return energyB.compareTo(energyA);
		}
	}

	protected void handleAllResponses(Vector responses, Vector acceptances) {

		Vector<ACLMessage> messageResponses = responses;
		Vector<ACLMessage> notProposals = new Vector<ACLMessage>();
		Double energyNeed = this.agreedEnergy;

		// Filtering not-understood and refuse responses
		for (ACLMessage msg : messageResponses) {
			if (msg.getPerformative() != ACLMessage.PROPOSE) {
				notProposals.add(msg);
			}
		}

		messageResponses.removeAll(notProposals);

		if (messageResponses.size() == 0) {
			System.out.println("Agent " + this.myAgent.getLocalName() + ": No proposals. Asking grid agent for: "
					+ this.agreedEnergy + " Kwh");
			this.myAgent.addBehaviour(
					new ConsumerInitiatorBehaviour(this.myAgent, this.agreedEnergy, "Grid agent", this.data));
			this.myAgent.removeBehaviour(this);
		}

		// Order proposals from high to low energy
		Collections.sort(messageResponses, new ACLSorterByEnergy());

		for (ACLMessage msg : messageResponses) {
			ACLMessage reply = msg.createReply();
			double proposal = Double.parseDouble(msg.getContent());
			double energyTaken = 0.0;
			if (energyNeed < proposal) {
				energyTaken = energyNeed;
			} else {
				energyTaken = proposal;
			}

			if (energyNeed == 0) {
				reply.setPerformative(ACLMessage.REJECT_PROPOSAL);
				System.out.println("Agent " + this.myAgent.getLocalName() + ": Rejecting proposal of " + proposal
						+ " Kwh from " + msg.getSender().getName());
			} else {
				// Energy is substracted from the total, if any acceptance producer fails, the
				// operation is undone in the handleFailure through the use of the
				// uncommitedEnergy hash table.
				energyNeed = energyNeed - energyTaken;
				reply.setPerformative(ACLMessage.ACCEPT_PROPOSAL);
				reply.setContent(String.valueOf(energyTaken));
				if (energyTaken == proposal) {
					System.out.println("Agent " + this.myAgent.getLocalName() + ": Accepting proposal of " + energyTaken
							+ " Kwh from " + msg.getSender().getName());
				} else {
					System.out.println("Agent " + this.myAgent.getLocalName() + ": Proposing a consumption of "
							+ energyTaken + " Kwh from " + msg.getSender().getName());
				}
			}
			this.offersWithoutResponse++;
			acceptances.addElement(reply);
		}

	}

	public int onEnd() {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Finished provisioning proccess");
		return 0;
	}

}
