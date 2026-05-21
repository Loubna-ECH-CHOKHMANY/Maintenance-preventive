package com.gmpp.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component @Slf4j
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    // userId -> WebSocketSession
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String userId = extractUserId(session);
        if (userId != null) {
            sessions.put(userId, session);
            log.info("WebSocket connected: userId={}", userId);
        } else {
            log.warn("WebSocket connection without userId, session={}", session.getId());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = extractUserId(session);
        if (userId != null) {
            sessions.remove(userId);
            log.debug("WebSocket disconnected: userId={}", userId);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable e) {
        log.warn("WebSocket transport error: {}", e.getMessage());
    }

    public void sendToUser(Long userId, String message) {
        if (userId == null) return;
        WebSocketSession session = sessions.get(String.valueOf(userId));
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
            } catch (Exception e) {
                log.warn("WS send failed userId={}: {}", userId, e.getMessage());
            }
        }
    }

    public void broadcast(String message) {
        sessions.values().stream()
            .filter(WebSocketSession::isOpen)
            .forEach(s -> {
                try { s.sendMessage(new TextMessage(message)); }
                catch (Exception e) { log.warn("WS broadcast error: {}", e.getMessage()); }
            });
    }

    private String extractUserId(WebSocketSession session) {
        try {
            URI uri = session.getUri();
            if (uri == null) return null;
            String query = uri.getQuery();
            if (query != null && query.startsWith("userId=")) {
                return query.split("=", 2)[1];
            }
            // Check HandshakeHeaders
            String authHeader = session.getHandshakeHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                // Could decode JWT here if needed
                return null;
            }
        } catch (Exception e) {
            log.debug("Cannot extract userId from WebSocket: {}", e.getMessage());
        }
        return null;
    }
}
