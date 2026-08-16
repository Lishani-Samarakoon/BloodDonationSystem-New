package blooddonation.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/*
 * This class defines the API Gateway routes.
 *
 * The Gateway receives requests on port 8080
 * and forwards them to the correct microservice.
 */
@Configuration
public class GatewayRoutesConfig {

    /*
     * Address of Auth/User Service.
     *
     * Local default:
     * http://localhost:8081
     */
    @Value("${services.auth.url:http://localhost:8081}")
    private String authServiceUrl;

    /*
     * Address of Donation Service.
     *
     * Local default:
     * http://localhost:8082
     */
    @Value("${services.donation.url:http://localhost:8082}")
    private String donationServiceUrl;

    /*
     * Internal API key required by Auth Service.
     */
    @Value("${services.auth.api-key:auth-service-secret-key}")
    private String authServiceApiKey;

    /*
     * Internal API key required by Donation Service.
     */
    @Value("${services.donation.api-key:donation-service-secret-key}")
    private String donationServiceApiKey;

    /*
     * Address of Blood Bank Service.
     */
    @Value("${services.bloodbank.url:http://localhost:8083}")
    private String bloodBankServiceUrl;

    /*
     * Internal API key required by Blood Bank Service.
     */
    @Value("${services.bloodbank.api-key:bloodbank-service-secret-key}")
    private String bloodBankServiceApiKey;

    /*
     * Build our Gateway routes.
     */
    @Bean
    public RouteLocator gatewayRoutes(
            RouteLocatorBuilder builder) {

        return builder
                .routes()

                .route(
                        "auth-service",
                        route -> route
                                .path("/api/users/**")
                                .filters(filters ->
                                        filters
                                                .removeRequestHeader("X-API-KEY")
                                                .addRequestHeader("X-API-KEY", authServiceApiKey)
                                )
                                .uri(authServiceUrl)
                )

                .route(
                        "donation-service",
                        route -> route
                                .path("/api/donations/**")
                                .filters(filters ->
                                        filters
                                                .removeRequestHeader("X-API-KEY")
                                                .addRequestHeader("X-API-KEY", donationServiceApiKey)
                                )
                                .uri(donationServiceUrl)
                )

                .route(
                        "bloodbank-service",
                        route -> route
                                .path("/api/bloodbanks/**", "/api/bloodstocks/**", "/api/bloodrequests/**")
                                .filters(filters ->
                                        filters
                                                .removeRequestHeader("X-API-KEY")
                                                .addRequestHeader("X-API-KEY", bloodBankServiceApiKey)
                                )
                                .uri(bloodBankServiceUrl)
                )

                .build();
    }
}