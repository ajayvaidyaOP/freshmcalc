# ---- Build stage: Gradle 8 + JDK 21 (no local Gradle/wrapper needed) ----
FROM gradle:8-jdk21 AS builder
USER root
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src src
RUN gradle bootJar -x test --no-daemon

# ---- Runtime stage: slim JRE 21 ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
