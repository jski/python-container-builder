# Build stage: Install dependencies in virtual environment
FROM ghcr.io/jski/python-container-builder:3.11 AS build-venv

COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

# Runtime stage: Minimal distroless image
FROM gcr.io/distroless/python3-debian12

# Copy Python installation and virtual environment from build stage
COPY --from=build-venv /usr/local /usr/local
COPY --from=build-venv /.venv /.venv

# Copy application code
COPY main.py /app/main.py

# Set working directory
WORKDIR /app

# Expose port
EXPOSE 8000

# Run the application using venv Python
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]
