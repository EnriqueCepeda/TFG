package multiagent_system.src;

import java.security.acl.Acl;
import java.util.Collections;
import java.util.Date;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Vector;
import java.util.Comparator;
import java.lang.Math;

import jade.domain.DFService;
import jade.domain.FIPAAgentManagement.*;
import jade.domain.FIPAAgentManagement.FailureException;
import jade.domain.FIPAAgentManagement.NotUnderstoodException;
import jade.domain.FIPAAgentManagement.RefuseException;
import jade.domain.FIPAException;
import jade.domain.FIPANames;
import jade.lang.acl.ACLMessage;
import jade.lang.acl.MessageTemplate;
import jade.proto.ContractNetInitiator;
import jade.proto.ContractNetResponder;
import jade.core.Agent;
import jade.core.AID;
import jade.core.behaviours.*;
import jade.domain.FIPAAgentManagement.Property;

public class BuildingAgent extends Agent {

	Double estimationOneHour = 0.0;

	protected double requestEstimatedEnergy(Object[] args) {
		// Placeholder from a value obtained from the API
		Double productionEstimation = Double.parseDouble((String) args[0]);
		return productionEstimation;
	}

	protected void setup() {
		Object[] args = getArguments();
		if (args != null && args.length > 0) {
			estimationOneHour = requestEstimatedEnergy(args);
			if (estimationOneHour > 0) {
				this.addBehaviour(new ProducerInitiatiorBehaviour(this, estimationOneHour, args));
			} else {
				this.addBehaviour(new ConsumerInitiatorBehaviour(this, Math.abs(estimationOneHour), "Producer", args));
			}
		} else {
			System.out.println("There's no arguments, removing agent");
			doDelete();
		}
	}

	protected void takeDown() {
		System.out.println("Freeing resources");
	}
}
/*
 * private class RefreshDataBehaviour extends TickerBehaviour {
 * 
 * private RefreshDataBehaviour(Agent agent, long period) { super(agent,
 * period); }
 * 
 * private void onTick() {
 * 
 * }
 * 
 * }
 */

class ProducerInitiatiorBehaviour extends OneShotBehaviour {

	Double estimation = 0.0;
	Object[] data;
	String producerType = null;

	public ProducerInitiatiorBehaviour(Agent agent, Double estimation, Object[] data) {
		super(agent);
		this.estimation = estimation;
		this.producerType = "Producer";
		this.data = data; // The data from the frontend
	}

	public ProducerInitiatiorBehaviour(Agent agent, Double estimation) {
		super(agent);
		this.estimation = estimation;
		this.producerType = "Grid agent";
	}

	public void action() {
		System.out.println("Agent " + this.myAgent.getLocalName() + " has a remaining energy of " + this.estimation);
		DFAgentDescription description = new DFAgentDescription();
		description.setName(this.myAgent.getAID());

		ServiceDescription service = new ServiceDescription();
		service.setType(this.producerType);
		// From data when integrated
		service.setName("Openlayers building id");
		Property p = new Property("Energy production", this.estimation);
		service.addProperties(p);
		description.addServices(service);

		try {
			DFService.register(this.myAgent, description);
		} catch (FIPAException e) {
			e.printStackTrace();
		}

		System.out.println("Agent " + this.myAgent.getLocalName() + " waiting for energy needs of other agents.");
		MessageTemplate template = MessageTemplate.and(
				MessageTemplate.MatchProtocol(FIPANames.InteractionProtocol.FIPA_CONTRACT_NET),
				MessageTemplate.MatchPerformative(ACLMessage.CFP));
		this.myAgent.addBehaviour(new ProducerBehaviour(this.myAgent, template, this.estimation));
	}

}

class ProducerBehaviour extends ContractNetResponder {

	Double remainingEnergy = 0.0;

	public ProducerBehaviour(Agent agente, MessageTemplate plantilla, Double estimation) {
		super(agente, plantilla);
		this.remainingEnergy = estimation;
	}

	@Override
	protected ACLMessage handleCfp(ACLMessage cfp) throws NotUnderstoodException, RefuseException {
		System.out.println("Agent " + this.myAgent.getLocalName() + ": CFP received from " + cfp.getSender().getName()
				+ ". Action is " + cfp.getContent());

		if (this.remainingEnergy > 0) {
			Double proposal = Double.parseDouble(cfp.getContent());
			Double offeredEnergy = 0.0;
			if (this.remainingEnergy - proposal < 0) {
				offeredEnergy = this.remainingEnergy;
			} else {
				offeredEnergy = proposal;
			}
			// The agent energy can be consumed throughout the energy sharing process.
			System.out.println("Agent " + this.myAgent.getLocalName() + ": Proposing " + offeredEnergy + " Kw");
			ACLMessage propose = cfp.createReply();
			propose.setPerformative(ACLMessage.PROPOSE);
			propose.setContent(String.valueOf(offeredEnergy));
			return propose;
		} else {
			// We refuse to provide a proposal
			System.out.println("Agent " + this.myAgent.getLocalName() + ": Refuse");
			throw new RefuseException("No availability of Energy");
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

class ConsumerInitiatorBehaviour extends OneShotBehaviour {

	Double energyNeed = 0.0;
	Object[] data;
	String producerType = null;

	public ConsumerInitiatorBehaviour(Agent agent, Double energyNeed, String producerType, Object[] data) {
		super(agent);
		this.energyNeed = energyNeed;
		this.producerType = producerType;
		this.data = data; // The data from the frontend
	}

	public void action() {
		ServiceDescription service = new ServiceDescription();
		service.setType(this.producerType);
		DFAgentDescription description = new DFAgentDescription();
		description.addServices(service);
		ACLMessage msgInitiator = new ACLMessage(ACLMessage.CFP);

		try {
			DFAgentDescription[] resultados = DFService.search(this.myAgent, description);
			if (resultados.length == 0) {
				System.out.println("No agent offers the required energy, asking the Grid Agent for energy");
				this.myAgent.addBehaviour(
						new ConsumerInitiatorBehaviour(this.myAgent, this.energyNeed, "Grid agent", this.data));
				// Here is where it communicates with the Grid Agent looking for energy
			} else {
				for (int i = 0; i < resultados.length; ++i) {
					System.out.println(resultados[i].getName());
					msgInitiator.addReceiver(resultados[i].getName());
					Iterator services = resultados[i].getAllServices();
					service = (ServiceDescription) services.next(); // It only has one service
					Property p = ((Iterator<Property>) service.getAllProperties()).next(); // It only has one property
					System.out.println(p.getName());
					System.out.println(p.getValue());
				}

				int waitForOffersMilliseconds = 10000;
				msgInitiator.setReplyByDate(new Date(System.currentTimeMillis() + waitForOffersMilliseconds));
				msgInitiator.setProtocol(FIPANames.InteractionProtocol.FIPA_CONTRACT_NET);
				msgInitiator.setContent(Double.toString(this.energyNeed));
				this.myAgent
						.addBehaviour(new ConsumerBehaviour(this.myAgent, msgInitiator, this.energyNeed, this.data));

			}

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}

class ConsumerBehaviour extends ContractNetInitiator {

	Double energyNeed = 0.0;
	Hashtable<Integer, Double> uncommitedEnergy = new Hashtable<Integer, Double>();
	Object[] data;

	public ConsumerBehaviour(Agent agent, ACLMessage message, Double energyNeed, Object[] data) {
		super(agent, message);
		this.energyNeed = energyNeed;
		this.data = data;
	}

	protected void handlePropose(ACLMessage propose, Vector v) {
		System.out.println("Agent " + propose.getSender().getName() + " proposed " + propose.getContent());
	}

	protected void handleRefuse(ACLMessage refuse) {
		System.out.println("Agent " + refuse.getSender().getName() + " refused");
	}

	protected void handleFailure(ACLMessage failure) {
		// If any producer fails providing energy the consumer initiator behaviour must
		// be launched with the remaining energy
		int senderHash = failure.getSender().hashCode();
		this.energyNeed = this.energyNeed + uncommitedEnergy.get(senderHash);
		System.out.println("Agent " + failure.getSender().getName() + " failed providing the energy");
	}

	protected void handleInform(ACLMessage inform) {
		Double energyTaken = Double.parseDouble(inform.getContent());
		System.out.println("Energy transaction have been completed succesfully: " + energyTaken + " received");
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

		Collections.sort(messageResponses, new ACLSorterByEnergy());
		// Order proposals from high to low energy
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
				System.out.println("Rejecting proposal of " + energyTaken + " Kw, from responder " + msg.getSender());
			} else {
				// Energy is substracted from the total, if any acceptance producer fails, the
				// operation is undone.
				this.energyNeed = this.energyNeed - energyTaken;
				int senderHash = msg.getSender().hashCode();
				uncommitedEnergy.put(senderHash, energyTaken);

				reply.setPerformative(ACLMessage.ACCEPT_PROPOSAL);
				reply.setContent(String.valueOf(energyTaken));
				System.out.println("Accepting proposal of " + energyTaken + " Kw, from responder " + msg.getSender());
			}

			acceptances.addElement(reply);
		}

		if (this.energyNeed > 0) {
			System.out.println("Asking grid agent for: " + this.energyNeed + " Kw");
			this.myAgent.addBehaviour(
					new ConsumerInitiatorBehaviour(this.myAgent, this.energyNeed, "Grid agent", this.data));
		}

		System.out.println("Accepting proposals " + acceptances);

	}

}
