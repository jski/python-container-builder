# Examples

This directory contains practical examples demonstrating common use cases for the Python Container Builder.

## Available Examples

### 1. FastAPI Web Service
**Directory:** `fastapi/`

The most common use case - a web service with external dependencies.

**What you'll learn:**
- Building a web API with FastAPI
- Using `uv` for fast dependency installation
- Multi-stage builds to distroless runtime
- Best practices for web services

**Use this when:** You're building REST APIs, microservices, or web applications.

[View FastAPI Example →](fastapi/)

---

### 2. Poetry CLI Tool
**Directory:** `poetry-cli/`

Demonstrates using Poetry for dependency management instead of requirements.txt.

**What you'll learn:**
- Using Poetry in Docker builds
- Exporting Poetry dependencies for optimal builds
- Building CLI applications with Click
- Separating dev and production dependencies

**Use this when:** You prefer Poetry for dependency management or are building CLI tools.

[View Poetry Example →](poetry-cli/)

---

### 3. Data Science Application
**Directory:** `data-science/`

Shows how to handle packages with native extensions that require system dependencies.

**What you'll learn:**
- Installing packages like NumPy, Pandas that need compilation
- Adding system build dependencies (gcc, gfortran)
- Copying runtime libraries to distroless
- Troubleshooting common compilation issues

**Use this when:** You're working with data science, ML, or any packages requiring native compilation.

[View Data Science Example →](data-science/)

---

## Quick Start

Each example is self-contained with:
- ✅ Complete, working Dockerfile
- ✅ Example application code
- ✅ Dependencies file (requirements.txt or pyproject.toml)
- ✅ Detailed README with explanations

### Build and Run Any Example

```bash
# Navigate to an example directory
cd fastapi/

# Build the image
docker build -t example .

# Run the container
docker run -p 8000:8000 example
```

## Choosing the Right Example

| Your Use Case | Recommended Example |
|--------------|---------------------|
| Web API or microservice | FastAPI |
| CLI tool or script | Poetry CLI |
| Using Poetry for dependencies | Poetry CLI |
| Data analysis, ML, scientific computing | Data Science |
| Packages that need compilation (Pillow, psycopg2, lxml) | Data Science |
| Simple Python scripts with dependencies | FastAPI (simplify as needed) |

## Common Patterns Across Examples

### Multi-Stage Build Structure
All examples follow this pattern:
```dockerfile
# Stage 1: Build dependencies
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv
COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

# Stage 2: Minimal runtime
FROM gcr.io/distroless/python3-debian12
COPY --from=build-venv /.venv /.venv
COPY app.py /app/app.py
WORKDIR /app
ENTRYPOINT ["/.venv/bin/python3", "-u", "app.py"]
```

### Version Selection
Choose your Python version by changing the tag:
- `:3.12` - Python 3.12 (recommended for most users)
- `:3.14` or `:latest` - Python 3.14 (newest features)
- `:3.11` - Python 3.11 (long-term stable)
- `:3.9`, `:3.10` - Older versions (use `debian11` distroless)

### Adding System Dependencies
If your packages need compilation:
```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
```

See the Data Science example for details.

## Next Steps

1. **Pick an example** that matches your use case
2. **Read the README** in that directory
3. **Build and run** the example locally
4. **Customize** for your application
5. **Check [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)** if you encounter issues

## Need Help?

- Check the main [README.md](../README.md) for base image documentation
- Read [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for common issues
- Review the [GitHub Actions workflow](../.github/workflows/nightly.yml) to see how images are built
- Open an issue at https://github.com/jski/python-container-builder/issues

## Contributing Examples

Have a useful example to share? Contributions are welcome! Each example should:
- Solve a real-world use case
- Include complete, working code
- Have clear documentation
- Follow the multi-stage build pattern
- Be under 100 lines (Dockerfile + code)
