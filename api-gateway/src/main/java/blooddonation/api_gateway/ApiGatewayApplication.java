package blooddonation.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/*
 * This is the main starting point of our API Gateway.
 *
 * The frontend will communicate with the Gateway
 * instead of directly communicating with microservices.
 */
@SpringBootApplication
public class ApiGatewayApplication {

    /*
     * Java starts the Gateway from this method.
     */
    public static void main(String[] args) {

        // Start Spring Cloud Gateway.
        SpringApplication.run(
                ApiGatewayApplication.class,
                args
        );
    }
}