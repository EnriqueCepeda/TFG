package com.multiagent;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import javax.websocket.ContainerProvider;
import javax.websocket.DeploymentException;
import javax.websocket.Session;
import javax.websocket.WebSocketContainer;

import jade.core.Agent;
import jade.core.behaviours.*;

public class WebSocketAgent extends Agent {

    protected void setup() {
        Object[] args = getArguments();
        if (args != null && args.length > 0) {
        }
        this.addBehaviour(new WebSocketBehaviour(this));
    }

    protected void takeDown() {
        System.out.println("Freeing resources");
    }
}

class WebSocketBehaviour extends Behaviour {

    private WebSocketContainer container;
    private HelloEndpoint endpoint;

    public WebSocketBehaviour(Agent a) {
        super(a);
        this.container = ContainerProvider.getWebSocketContainer();
        this.endpoint = new HelloEndpoint();
    }

    public void action() {

        try {
            Session connectToServer = this.container.connectToServer(this.endpoint,
                    new URI("ws://localhost:8000/grid/report"));
            this.endpoint.sendMessage("Hola, soy agente X");
        } catch (DeploymentException | IOException | URISyntaxException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public boolean done() {
        return true;
    }

    public int onEnd() {
        System.out.println("Conexión finalizada");
        return 0;
    }

}