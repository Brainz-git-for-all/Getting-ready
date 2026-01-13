FROM eclipse-temurin:21-jdk

# Set the working directory inside the container
WORKDIR /app

# Copy the jar from the host to the current WORKDIR in the container
COPY Pac/target/Pac-0.0.1-SNAPSHOT.jar /app/Pac.jar

EXPOSE 8080

# Run the jar
CMD ["java", "-jar", "Pac.jar"]