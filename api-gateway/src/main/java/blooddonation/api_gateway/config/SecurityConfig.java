package blooddonation.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Configuration
public class SecurityConfig {

    @Value("${app.cors.allowed-origin:http://localhost:5173}")
    private String allowedOrigin;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> { })
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/actuator/health").permitAll()

                        // User profiles can be viewed/created/updated by authenticated users,
                        // while deleting a profile is an administrator operation.
                        .pathMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")

                        // Donors manage donation records; admins can also manage them.
                        .pathMatchers(HttpMethod.POST, "/api/donations/**").hasAnyRole("DONOR", "ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/donations/**").hasAnyRole("DONOR", "ADMIN")
                        .pathMatchers(HttpMethod.PATCH, "/api/donations/**").hasAnyRole("DONOR", "ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/donations/**").hasAnyRole("DONOR", "ADMIN")

                        // Blood-bank staff manage banks, stock and requests; admins can also manage them.
                        .pathMatchers(HttpMethod.POST, "/api/bloodbanks/**", "/api/bloodstocks/**", "/api/bloodrequests/**")
                                .hasAnyRole("BLOOD_BANK", "ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/bloodbanks/**", "/api/bloodstocks/**", "/api/bloodrequests/**")
                                .hasAnyRole("BLOOD_BANK", "ADMIN")
                        .pathMatchers(HttpMethod.PATCH, "/api/bloodbanks/**", "/api/bloodstocks/**", "/api/bloodrequests/**")
                                .hasAnyRole("BLOOD_BANK", "ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/bloodbanks/**", "/api/bloodstocks/**", "/api/bloodrequests/**")
                                .hasAnyRole("BLOOD_BANK", "ADMIN")

                        .pathMatchers("/api/**").authenticated()
                        .anyExchange().permitAll())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        converter.setPrincipalClaimName("preferred_username");
        converter.setJwtGrantedAuthoritiesConverter(this::extractRealmRoles);
        return converter;
    }

    
    private Flux<GrantedAuthority> extractRealmRoles(Jwt jwt) {
        Object realmAccessClaim = jwt.getClaims().get("realm_access");
        if (!(realmAccessClaim instanceof Map<?, ?> realmAccess)) {
            return Flux.empty();
        }

        Object rolesClaim = realmAccess.get("roles");
        if (!(rolesClaim instanceof Collection<?> roles)) {
            return Flux.empty();
        }

        return Flux.fromIterable(roles)
                .map(Object::toString)
                .map(role -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigin));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
