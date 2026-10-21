FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY gradle gradle
COPY gradlew . 2>/dev/null || true
COPY build.gradle settings.gradle ./
COPY src src
RUN --mount=type=cache,root=/root/.gradle gradle bootJar -x test || true

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
