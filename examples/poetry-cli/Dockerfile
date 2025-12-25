# Build stage: Use Poetry to export dependencies
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv

# Copy Poetry files
COPY pyproject.toml poetry.lock* /

# Export Poetry dependencies to requirements.txt format
# This is faster and more compatible with uv than installing Poetry in the container
RUN poetry export --without-hashes --format=requirements.txt > requirements.txt

# Install dependencies using uv (much faster than pip)
RUN uv pip install -r requirements.txt

# Copy application code
COPY cli.py /app/cli.py

# Runtime stage: Minimal distroless image
FROM gcr.io/distroless/python3-debian12

# Copy virtual environment and application
COPY --from=build-venv /.venv /.venv
COPY --from=build-venv /app /app

WORKDIR /app

# Run the CLI application
ENTRYPOINT ["/.venv/bin/python3", "-u", "cli.py"]
