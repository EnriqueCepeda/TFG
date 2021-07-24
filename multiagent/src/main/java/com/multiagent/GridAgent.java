
package com.multiagent;

import jade.core.Agent;
import jade.domain.DFService;
import jade.domain.FIPAException;

public class GridAgent extends Agent {

    Double totalEnergy = Double.MAX_VALUE;

    protected void setup() {
        this.addBehaviour(new ProducerInitiatiorBehaviour(this, totalEnergy));
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
