# Poetry CLI Tool Example

This example demonstrates building a CLI application using Poetry for dependency management.

## Features Demonstrated
- ✅ Using Poetry for dependency management
- ✅ Building a CLI tool with Click
- ✅ Exporting requirements from Poetry for Docker optimization
- ✅ Clean separation between dev and production dependencies

## Project Structure
```
poetry-cli/
├── Dockerfile
├── pyproject.toml
├── poetry.lock
└── cli.py
```

## Building the Image

```bash
docker build -t poetry-cli-example .
```

## Running the CLI Tool

```bash
# Show help
docker run --rm poetry-cli-example --help

# Greet someone
docker run --rm poetry-cli-example greet "World"

# Show version
docker run --rm poetry-cli-example --version

# Count words in text
docker run --rm poetry-cli-example count "Hello world from Python"
```

## Key Dockerfile Patterns

### Poetry to Requirements Export
```dockerfile
# Export Poetry dependencies to requirements.txt format
RUN poetry export --without-hashes --format=requirements.txt > requirements.txt
```

This approach:
- Uses Poetry for local development
- Exports to requirements.txt for Docker (faster, more compatible)
- Avoids installing Poetry in the final image

### Alternative: Install with Poetry Directly
```dockerfile
# If you prefer to use Poetry directly in the container:
RUN poetry config virtualenvs.create false && \
    poetry install --only main --no-root
```

## Why This Pattern?

### Poetry for Development
- Lock file ensures reproducible builds
- Easy dependency management (`poetry add requests`)
- Separates dev dependencies from production
- Better dependency resolution

### Requirements.txt for Docker
- Faster installation with uv
- Smaller image (no Poetry needed)
- Standard format for CI/CD
- Better layer caching

## Setting Up Poetry Locally

```bash
# Install dependencies
poetry install

# Add new dependency
poetry add requests

# Run locally
poetry run python cli.py greet "Local Dev"

# Update dependencies
poetry update
```

## Customization

### Add More Commands
Edit `cli.py` and add new Click commands:
```python
@click.command()
def mycommand():
    click.echo("My new command!")

cli.add_command(mycommand)
```

### Change Python Version
Update `pyproject.toml`:
```toml
[tool.poetry.dependencies]
python = "^3.11"
```

Then change Dockerfile:
```dockerfile
FROM ghcr.io/jski/python-container-builder:3.11 as build-venv
FROM gcr.io/distroless/python3-debian12
```

## Production Best Practices

1. **Commit poetry.lock** - Ensures reproducible builds
2. **Use --without-hashes** - Faster builds, still secure with lock file
3. **Separate dev dependencies** - Keep production images lean
4. **Export for Docker** - Faster than installing Poetry in container
