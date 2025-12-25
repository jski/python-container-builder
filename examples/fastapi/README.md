# FastAPI Example

This example demonstrates building a FastAPI web service using the Python Container Builder.

## Features Demonstrated
- ✅ Web service with external dependencies
- ✅ Using `uv` for fast dependency installation
- ✅ Multi-stage build to distroless runtime
- ✅ Health check endpoint

## Project Structure
```
fastapi/
├── Dockerfile
├── requirements.txt
└── main.py
```

## Building the Image

```bash
docker build -t fastapi-example .
```

## Running the Container

```bash
docker run -p 8000:8000 fastapi-example
```

Then visit http://localhost:8000/docs to see the interactive API documentation.

## Testing the API

```bash
# Health check
curl http://localhost:8000/health

# Get current time
curl http://localhost:8000/time

# Echo endpoint
curl -X POST http://localhost:8000/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, World!"}'
```

## Key Dockerfile Patterns

### Build Stage
```dockerfile
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv
COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt
```

### Runtime Stage
```dockerfile
FROM gcr.io/distroless/python3-debian12
COPY --from=build-venv /.venv /.venv
COPY main.py /app/main.py
WORKDIR /app
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]
```

## Why This Works

1. **Fast builds** - `uv` installs dependencies much faster than pip
2. **Small images** - Distroless runtime contains only what's needed
3. **Security** - No package manager or shell in final image
4. **Reliable** - Virtual environment ensures dependency isolation

## Customization

### Different Python Version
Change the build image tag:
```dockerfile
FROM ghcr.io/jski/python-container-builder:3.11 as build-venv
# Also change the runtime to match:
FROM gcr.io/distroless/python3-debian12
```

### Add More Dependencies
Just update `requirements.txt` and rebuild. The build cache will reuse unchanged layers.

### Production Settings
Consider adding:
- Environment variable for host/port configuration
- Multiple workers (uvicorn --workers)
- Health check monitoring
- Logging configuration
