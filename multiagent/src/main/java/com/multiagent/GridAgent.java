
package com.multiagent;

import jade.core.Agent;

public class GridAgent extends Agent {

    Double totalEnergy = Double.MAX_VALUE;

    protected void setup() {
        this.addBehaviour(new ProducerInitiatiorBehaviour(this, totalEnergy));
    }

    protected void takeDown() {
        System.out.println("Freeing resources");
    }

}
