package multiagent_system.src;

import jade.core.Agent;
import jade.proto.ContractNetResponder;

public class GridAgent extends Agent {

    Double totalEnergy = Double.MAX_VALUE;

    protected void setup() {
        this.addBehaviour(new ProducerInitiatiorBehaviour(this, totalEnergy));
    }

    protected void takeDown() {
        System.out.println("Freeing resources");
    }

}
