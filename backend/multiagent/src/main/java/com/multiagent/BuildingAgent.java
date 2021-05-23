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
import java.util.List;
import java.util.Map;
import java.util.Vector;
import java.util.stream.Collectors;

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

public class BuildingAgent extends Agent {

	protected void setup() {
		addBehaviour(new BuildingAgentInitiator(this));
	}

	protected void takeDown() {
		System.out.println("Agent " + getLocalName() + ": Freeing resources");
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

	}

}

class BuildingAgentInitiator extends OneShotBehaviour {
	private JSONObject data = null;
	private final String BUILDING_CONFIGURATION_URI = "http://localhost:8000/building/configuration";
	private final String ENERGY_CONSUMPTION_URI = "http://localhost:8000/building/production";

	public BuildingAgentInitiator(Agent agent) {
		super(agent);
	}

	public BuildingAgentInitiator(Agent agent, JSONObject data) {
		super(agent);
		this.data = data;
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
		Object[] args = this.myAgent.getArguments();
		if (args != null && args.length > 0) {
			if (this.data == null) {
				this.data = getBuildingData(args);
			}
			Double estimatedConsumedEnergy = getEstimatedEnergy(this.data);
			if (estimatedConsumedEnergy > 0) {
				this.myAgent.addBehaviour(
						new ProducerInitiatiorBehaviour(this.myAgent, estimatedConsumedEnergy, this.data));
			} else {
				this.myAgent.addBehaviour(new ConsumerRegistrationBehaviour(this.myAgent,
						Math.abs(estimatedConsumedEnergy), "Producer", this.data));
			}
		} else {
			System.out.println("Agent" + this.myAgent.getLocalName() + ": There are no arguments, shutting down agent");
			this.myAgent.doDelete();
		}

	}
}

class ProducerInitiatiorBehaviour extends OneShotBehaviour {

	Double estimation = 0.0;
	JSONObject data = null;
	String producerType = null;

	public ProducerInitiatiorBehaviour(Agent agent, Double estimation, JSONObject data) {
		super(agent);
		this.estimation = estimation;
		this.producerType = "Producer";
		this.data = data;
	}

	public ProducerInitiatiorBehaviour(Agent agent, Double estimation) {
		super(agent);
		this.estimation = estimation;
		this.producerType = "Grid agent";
	}

	public void action() {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Energy -> " + this.estimation + " Kw");
		DFAgentDescription description = new DFAgentDescription();
		description.setName(this.myAgent.getAID());
		description.addOntologies("FProducer");

		ServiceDescription service = new ServiceDescription();
		// Producer or grid agent, to identify the true role of the agent
		service.setType(this.producerType);
		service.setName(this.myAgent.getLocalName());
		Property p = new Property("Energy production", this.estimation);
		service.addProperties(p);
		description.addServices(service);

		try {
			DFService.register(this.myAgent, description);
		} catch (FIPAException e) {
			e.printStackTrace();
		}

		System.out.println("Agent " + this.myAgent.getLocalName() + ": Waiting for energy requests of other agents.");
		MessageTemplate template = MessageTemplate.and(
				MessageTemplate.MatchProtocol(FIPANames.InteractionProtocol.FIPA_CONTRACT_NET),
				MessageTemplate.MatchPerformative(ACLMessage.CFP));
		this.myAgent.addBehaviour(new ProducerBehaviour(this.myAgent, template, this.estimation, this.data));
	}

}

class ProducerBehaviour extends ContractNetResponder {

	Double remainingEnergy = 0.0;
	JSONObject data = null;

	public ProducerBehaviour(Agent agente, MessageTemplate template, Double estimation, JSONObject data) {
		super(agente, template);
		this.remainingEnergy = estimation;
		this.data = data;
	}

	@Override
	protected ACLMessage handleCfp(ACLMessage cfp) throws NotUnderstoodException, RefuseException {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": CFP received from "
				+ cfp.getSender().getLocalName() + ". Action is " + cfp.getContent());

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
			System.out.println("Agent " + this.myAgent.getLocalName() + ": Proposing " + offeredEnergy + " Kw to "
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
		this.remainingEnergy = this.remainingEnergy - estimationOneHour;
		ACLMessage inform = accept.createReply();
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
		if (this.data.getString("type").equals("Prosumer")) {
			description.addOntologies("FProducer");
		} else {
			description.addOntologies("Consumer");
		}
		// It can be prosumer and consumer
		ServiceDescription service = new ServiceDescription();
		service.setType("Consumer");
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

		try {
			dfProducersAndProsumers = DFService.search(this.myAgent, description);
		} catch (Exception e) {
			e.printStackTrace();
		}

		int producersAndProsumersRoles = 0;

		Collection<String> roles = (Collection<String>) (new Gson()
				.fromJson(this.data.getJSONObject("buildingRoles").toString(), Map.class).values());

		for (String role : roles) {
			if (role.equals("Prosumer") || role.equals("Producer")) {
				producersAndProsumersRoles++;
			}
		}

		System.out.println(producersAndProsumersRoles);
		System.out.println(dfProducersAndProsumers.length);

		// Future +1 for the grid agent
		if (dfProducersAndProsumers != null && producersAndProsumersRoles == dfProducersAndProsumers.length) {
			// The description + the service finds the real producers and the prosumers
			// which produces, as they have a service.
			ServiceDescription service = new ServiceDescription();
			service.setType(this.producerType);
			description.addServices(service);

			DFAgentDescription[] dfProducersOrGrid = null;

			try {
				dfProducersOrGrid = DFService.search(this.myAgent, description);
			} catch (Exception e) {
				e.printStackTrace();
			}
			ACLMessage msgInitiator = new ACLMessage(ACLMessage.CFP);
			// Only if all producers are ready
			for (int i = 0; i < dfProducersOrGrid.length; ++i) {
				System.out.println("Agent " + this.myAgent.getLocalName() + ": Sending energy request to "
						+ dfProducersOrGrid[i].getName());
				msgInitiator.addReceiver(dfProducersOrGrid[i].getName());
				Iterator services = dfProducersOrGrid[i].getAllServices();
				service = (ServiceDescription) services.next(); // It only has one service
				Property p = ((Iterator<Property>) service.getAllProperties()).next(); // It only has one property
			}

			int waitForOffersMilliseconds = 10000;
			msgInitiator.setReplyByDate(new Date(System.currentTimeMillis() + waitForOffersMilliseconds));
			msgInitiator.setProtocol(FIPANames.InteractionProtocol.FIPA_CONTRACT_NET);
			msgInitiator.setContent(Double.toString(this.energyNeed));
			this.finish = true;
			this.myAgent.addBehaviour(new ConsumerBehaviour(this.myAgent, msgInitiator, this.energyNeed, this.data));

		} else {
			System.out.println("Blocking");
			block(50000);
		}
	}

	@Override
	public boolean done() {
		return this.finish;
	}

}

class ConsumerBehaviour extends ContractNetInitiator {

	Double energyNeed = 0.0;
	Hashtable<Integer, Double> uncommitedEnergy = new Hashtable<Integer, Double>();
	JSONObject data = null;

	public ConsumerBehaviour(Agent agent, ACLMessage message, Double energyNeed, JSONObject data) {
		super(agent, message);
		this.energyNeed = energyNeed;
		this.data = data;
	}

	protected void handlePropose(ACLMessage propose, Vector v) {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Agent " + propose.getSender().getName()
				+ " proposed " + propose.getContent() + "Kw");
	}

	protected void handleRefuse(ACLMessage refuse) {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Agent " + refuse.getSender().getName()
				+ " refused to make an energy proposal");
	}

	protected void handleFailure(ACLMessage failure) {
		// If any producer fails providing energy the consumer initiator behaviour must
		// be launched with the remaining energy. This edge case won't be controlled
		// at the moment
		int senderHash = failure.getSender().hashCode();
		this.energyNeed = this.energyNeed + uncommitedEnergy.get(senderHash);
		System.out.println("Agent " + this.myAgent.getLocalName() + ": Agent " + failure.getSender().getName()
				+ " failed providing the energy");

	}

	protected void handleInform(ACLMessage inform) {
		Double energyTaken = Double.parseDouble(inform.getContent());
		System.out.println("Agent " + this.myAgent.getLocalName()
				+ ": Energy transaction have been completed succesfully: " + energyTaken + "Kw received");
		// As the failure on handleFailure is not managed, in case of failure it won't
		// deregister
		if (this.energyNeed == 0) {
			try {
				DFService.deregister(this.myAgent);
			} catch (FIPAException e) {
				e.printStackTrace();
			}
			// Initializes the BuildingAgentInitiatorBehaviour in an hour
			int time = 3600000;
			this.myAgent.addBehaviour(new RefreshDataBehaviour(this.myAgent, time, this.data));
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

		// Filtering not-understood and refuse responses
		for (ACLMessage msg : messageResponses) {
			if (msg.getPerformative() != ACLMessage.PROPOSE) {
				messageResponses.remove(msg);
			}
		}

		// Order proposals from high to low energy
		Collections.sort(messageResponses, new ACLSorterByEnergy());

		for (ACLMessage msg : messageResponses) {
			ACLMessage reply = msg.createReply();
			double proposal = Double.parseDouble(msg.getContent());
			double energyTaken = 0.0;
			if (this.energyNeed < proposal) {
				energyTaken = this.energyNeed;
			} else {
				energyTaken = proposal;
			}

			if (this.energyNeed == 0) {
				reply.setPerformative(ACLMessage.REJECT_PROPOSAL);
				System.out.println("Agent " + this.myAgent.getLocalName() + ": Rejecting proposal of " + proposal
						+ " Kw from " + msg.getSender().getName());
			} else {
				// Energy is substracted from the total, if any acceptance producer fails, the
				// operation is undone in the handleFailure through the use of the
				// uncommitedEnergy hash table.
				this.energyNeed = this.energyNeed - energyTaken;
				int senderHash = msg.getSender().hashCode();
				uncommitedEnergy.put(senderHash, energyTaken);

				reply.setPerformative(ACLMessage.ACCEPT_PROPOSAL);
				reply.setContent(String.valueOf(energyTaken));
				if (energyTaken == proposal) {
					System.out.println("Agent " + this.myAgent.getLocalName() + ": Accepting proposal of " + energyTaken
							+ " Kw from " + msg.getSender().getName());
				} else {
					System.out.println("Agent " + this.myAgent.getLocalName() + ": Proposing a consumption of "
							+ energyTaken + " Kw from " + msg.getSender().getName());
				}
			}

			acceptances.addElement(reply);
		}

		if (this.energyNeed > 0) {
			System.out.println("Asking grid agent for: " + this.energyNeed + " Kw");
			this.myAgent.addBehaviour(
					new ConsumerInitiatorBehaviour(this.myAgent, this.energyNeed, "Grid agent", this.data));

		}

	}

	public int onEnd() {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": finished provisioning proccess");
		return 0;
	}

}
