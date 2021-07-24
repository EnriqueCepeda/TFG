package com.multiagent;

import jade.core.Agent;
import jade.core.behaviours.*;
import java.lang.Math;

public class AgenteEjercicio14Oct extends Agent {

    private Behaviour comp1;
    private Behaviour comp2;
    private int ejecucionesAgente = 0;
    private int maximasejecucionesAgente = 5;

    protected void setup() {
        comp1 = new Comportamiento1();
        comp2 = new Comportamiento2();
        addBehaviour(comp1);
        addBehaviour(comp2);
    }

    protected void takeDown() {
        System.out.println("Liberando Recursos");
    }

    // Este es el comportamiento.
    private class Comportamiento1 extends Behaviour {

        int numeroEjecuciones;
        int numeroEjecucionesHechas;

        public void onStart() {
            numeroEjecucionesHechas = 0;
            numeroEjecuciones = getEvenEjecuciones();
            System.out.println("Soy " + getBehaviourName());
            System.out.println("Mi número total de ejecuciones es " + numeroEjecuciones);
        }

        public void action() {
            numeroEjecucionesHechas++;
            System.out.println("Soy " + getBehaviourName());
            System.out.println("Mi número de ejecuciones es " + numeroEjecucionesHechas + "\n");
            if (numeroEjecucionesHechas == (numeroEjecuciones / 2)) {
                System.out.println("Bloqueando a comportamiento 2 \n");
                comp2.block();
            }
        }

        public boolean done() {
            return numeroEjecucionesHechas == numeroEjecuciones;
        }

        public int getEvenEjecuciones() {
            int ejecuciones = (int) Math.ceil(Math.random() * 100);
            if (ejecuciones % 2 == 0) {
                return ejecuciones;
            }
            return ejecuciones - 1;
        }

        public int onEnd() {

            if (ejecucionesAgente == maximasejecucionesAgente) {
                myAgent.doDelete();
            } else if (ejecucionesAgente < maximasejecucionesAgente) {
                ejecucionesAgente++;
                System.out.println("EJECUCIÓN " + ejecucionesAgente + " DEL AGENTE\n");
                comp2.reset();
                myAgent.addBehaviour(this);
            }
            return 0;
        }

    }

    private class Comportamiento2 extends Behaviour {

        int numeroEjecuciones;
        int numeroEjecucionesHechas;

        public void onStart() {
            numeroEjecucionesHechas = 0;
            numeroEjecuciones = getEvenEjecuciones();
            System.out.println("Soy " + getBehaviourName());
            System.out.println("Mi número total de ejecuciones es " + numeroEjecuciones);
        }

        public void action() {
            numeroEjecucionesHechas++;
            System.out.println("Soy " + getBehaviourName());
            System.out.println("Mi número de ejecuciones es " + numeroEjecucionesHechas + "\n");
            if (numeroEjecucionesHechas == (numeroEjecuciones / 2)) {
                System.out.println("Bloqueando a comportamiento 1 \n");
                comp1.block();
            }

        }

        public boolean done() {
            return numeroEjecucionesHechas == numeroEjecuciones;
        }

        public int getEvenEjecuciones() {
            int ejecuciones = (int) Math.ceil(Math.random() * 100);
            if (ejecuciones % 2 == 0) {
                return ejecuciones;
            }
            return ejecuciones - 1;
        }

        public int onEnd() {

            if (ejecucionesAgente == maximasejecucionesAgente) {
                myAgent.doDelete();
            } else if (ejecucionesAgente < maximasejecucionesAgente) {
                ejecucionesAgente++;
                System.out.println("EJECUCIÓN " + ejecucionesAgente + " DEL AGENTE\n");
                comp1.reset();
                myAgent.addBehaviour(this);
            }
            return 0;
        }

    }
}
