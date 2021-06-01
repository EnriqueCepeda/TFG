package com.multiagent;

public enum BuildingType {
    CONSUMER {
        @Override
        public String toString() {
            return "Consumer";
        }
    },
    PRODUCER {
        @Override
        public String toString() {
            return "Producer";
        }
    },
    PROSUMER {
        @Override
        public String toString() {
            return "Prosumer";
        }
    }
}
