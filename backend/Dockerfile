# syntax=docker/dockerfile:1
# ---- Build stage: Gradle 8 + JDK 21 (no local Gradle needed) ----
FROM gradle:8-jdk21 AS builder
USER root
WORKDIR /app

# Dependencies first: this layer is reused until build.gradle changes, so a
# code-only deploy does not re-download the whole dependency graph.
COPY settings.gradle build.gradle ./
RUN gradle dependencies --no-daemon --console=plain > /dev/null 2>&1 || true

COPY src src
RUN gradle bootJar --no-daemon -x test --console=plain

# ---- Runtime stage: slim JRE 21, non-root ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S -G app app \
    && apk add --no-cache wget
COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown -R app:app /app
USER app
EXPOSE 8080

# Container-aware memory: use up to 75% of the container limit.
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:InitialRAMPercentage=40"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
