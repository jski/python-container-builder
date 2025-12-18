# Based on: https://github.com/GoogleContainerTools/distroless/blob/main/examples/python3-requirements/Dockerfile
# Bugfix for apt-get update errors: https://stackoverflow.com/questions/63526272/release-file-is-not-valid-yet-docker
# Installing uv: https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
FROM debian:bookworm-slim
LABEL MAINTAINER="jskii <blackdanieljames@gmail.com>"
RUN echo "Acquire::Check-Valid-Until \"false\";\nAcquire::Check-Date \"false\";" | cat > /etc/apt/apt.conf.d/10no--check-valid-until
RUN apt-get update && \
    apt-get install --no-install-suggests --no-install-recommends --yes python3-venv libpython3-dev python3-pip
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN uv venv
ENV VIRTUAL_ENV=/.venv
ENV PATH="/bin:$VIRTUAL_ENV/bin:$PATH"