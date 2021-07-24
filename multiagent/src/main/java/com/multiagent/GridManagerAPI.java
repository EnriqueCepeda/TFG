package com.multiagent;

import java.util.HashMap;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.json.JSONObject;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jade.wrapper.StaleProxyException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@SpringBootApplication
@RestController
public class GridManagerAPI {

    GridManager gm = GridManager.getInstance();

    public static void main(String[] args) {
        SpringApplication.run(GridManagerAPI.class, args);
    }

    @RequestMapping(value = "api/v1/grid/{grid_id}/", method = RequestMethod.POST, consumes = MediaType.ALL_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @ResponseBody
    public ResponseEntity<String> launch_grid(@PathVariable(name = "grid_id") Integer grid_id,
            @RequestBody String payload) {
        JSONObject response;
        System.out.println(payload);
        try {
            gm.createSmartGrid(grid_id, payload);
        } catch (StaleProxyException e) {
            response = new JSONObject() {
                {
                    put("error", "The Smart Grid could not be created");
                }
            };
            return new ResponseEntity<String>(response.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        response = new JSONObject() {
            {
                put("id", grid_id);
            }

        };

        return new ResponseEntity<String>(response.toString(), HttpStatus.CREATED);

    }

    @DeleteMapping("api/v1/grid/{grid_id}/")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<String> delete_grid(@PathVariable(name = "grid_id") Integer grid_id) {
        JSONObject response;

        try {
            gm.killSmartGrid(grid_id);
        } catch (StaleProxyException e) {
            response = new JSONObject() {
                {
                    put("error", "The Smart Grid could not be deleted");
                }
            };
            return new ResponseEntity<String>(response.toString(), HttpStatus.INTERNAL_SERVER_ERROR);

        } catch (Exception e) {
            response = new JSONObject() {
                {
                    put("error", "The Smart Grid could not be deleted");
                }
            };
            return new ResponseEntity<String>(response.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        response = new JSONObject() {
            {
                put("id", grid_id);
            }
        };
        return new ResponseEntity<String>(response.toString(), HttpStatus.OK);
    }

}
