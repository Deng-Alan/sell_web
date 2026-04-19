package com.example.sellweb.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashSet;
import java.util.List;

/**
 * 在后台数据变更后通知 Next.js 失效公开页缓存。
 */
@Service
public class FrontendRevalidationService {

    private static final Logger log = LoggerFactory.getLogger(FrontendRevalidationService.class);

    private final RestClient restClient;
    private final String revalidateUrl;
    private final String revalidateSecret;

    public FrontendRevalidationService(
            RestClient.Builder restClientBuilder,
            @Value("${app.frontend.revalidate-url:}") String revalidateUrl,
            @Value("${app.frontend.revalidate-secret:}") String revalidateSecret) {
        this.restClient = restClientBuilder.build();
        this.revalidateUrl = normalizeText(revalidateUrl);
        this.revalidateSecret = normalizeText(revalidateSecret);
    }

    public void scheduleRevalidation(List<String> tags, List<String> paths) {
        List<String> normalizedTags = normalizeValues(tags);
        List<String> normalizedPaths = normalizeValues(paths);

        if (normalizedTags.isEmpty() && normalizedPaths.isEmpty()) {
            return;
        }

        if (!isConfigured()) {
            log.debug("Skip frontend revalidation because configuration is incomplete");
            return;
        }

        Runnable task = () -> triggerRevalidation(normalizedTags, normalizedPaths);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    task.run();
                }
            });
            return;
        }

        task.run();
    }

    private void triggerRevalidation(List<String> tags, List<String> paths) {
        try {
            restClient.post()
                    .uri(revalidateUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-revalidate-secret", revalidateSecret)
                    .body(new RevalidatePayload(tags, paths))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException exception) {
            log.warn("Failed to trigger frontend revalidation for tags={} paths={}", tags, paths, exception);
        }
    }

    private boolean isConfigured() {
        return StringUtils.hasText(revalidateUrl) && StringUtils.hasText(revalidateSecret);
    }

    private List<String> normalizeValues(List<String> values) {
        if (values == null || values.isEmpty()) {
            return List.of();
        }

        return values.stream()
                .map(this::normalizeText)
                .filter(StringUtils::hasText)
                .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toCollection(LinkedHashSet::new),
                        List::copyOf
                ));
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }

    private record RevalidatePayload(List<String> tags, List<String> paths) {
    }
}
