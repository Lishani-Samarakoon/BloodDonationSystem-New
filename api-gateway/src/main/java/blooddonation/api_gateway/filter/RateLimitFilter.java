package blooddonation.api_gateway.filter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

@Component
public class RateLimitFilter implements WebFilter, Ordered {

    private final ReactiveStringRedisTemplate redisTemplate;

    @Value("${rate-limit.max-requests:20}")
    private long maxRequests;

    @Value("${rate-limit.window-seconds:10}")
    private long windowSeconds;

    public RateLimitFilter(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (!path.startsWith("/api/")) {
            return chain.filter(exchange);
        }

        String clientIp = getClientIp(exchange);
        long currentWindow = Instant.now().getEpochSecond() / windowSeconds;
        String redisKey = "rate-limit:" + clientIp + ":" + currentWindow;

        return redisTemplate.opsForValue().increment(redisKey)
                // Fail open only when Redis itself cannot be reached. This keeps a Redis
                // outage from blocking every business request without retrying downstream calls.
                .onErrorReturn(-1L)
                .flatMap(count -> {
                    if (count < 0) {
                        return chain.filter(exchange);
                    }

                    Mono<Boolean> expiration = count == 1
                            ? redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds + 1))
                            : Mono.just(Boolean.TRUE);

                    return expiration.then(Mono.defer(() -> {
                        exchange.getResponse().getHeaders().set("X-RateLimit-Limit", String.valueOf(maxRequests));
                        exchange.getResponse().getHeaders().set(
                                "X-RateLimit-Remaining",
                                String.valueOf(Math.max(0, maxRequests - count)));

                        if (count > maxRequests) {
                            return tooManyRequests(exchange);
                        }

                        return chain.filter(exchange);
                    }));
                });
    }

    private Mono<Void> tooManyRequests(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        exchange.getResponse().getHeaders().set(HttpHeaders.RETRY_AFTER, String.valueOf(windowSeconds));
        byte[] body = "{\"error\":\"Rate limit exceeded. Please try again shortly.\"}"
                .getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse().writeWith(
                Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
    }

    private String getClientIp(ServerWebExchange exchange) {
        String forwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        InetSocketAddress address = exchange.getRequest().getRemoteAddress();
        if (address == null || address.getAddress() == null) {
            return "unknown";
        }
        return address.getAddress().getHostAddress();
    }

    @Override
    public int getOrder() {
        return -10;
    }
}
