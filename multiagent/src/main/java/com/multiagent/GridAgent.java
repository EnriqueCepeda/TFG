
package com.multiagent;

import jade.core.Agent;
import jade.core.behaviours.TickerBehaviour;
import jade.domain.DFService;
import jade.domain.FIPAException;

public class GridAgent extends Agent {

    Double totalEnergy = Double.MAX_VALUE;

    public Integer getData(Object[] args) {
        return (Integer) args[0];

    }

    protected void setup() {
        Object[] args = getArguments();
        if (args != null && args.length > 0) {
            Integer grid_id = this.getData(args);
            this.addBehaviour(new ProducerInitiatiorBehaviour(this, totalEnergy, grid_id));
        }
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