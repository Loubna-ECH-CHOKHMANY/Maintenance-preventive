FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY pom.xml .
RUN mvn dependency:go-offline -B -q
COPY src ./src
RUN mvn clean package -DskipTests -B -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S gmpp && adduser -S gmpp -G gmpp
COPY --from=build /app/target/gmpp-backend-*.jar app.jar
RUN mkdir -p /app/uploads /app/logs && chown -R gmpp:gmpp /app
USER gmpp
EXPOSE 8080
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
