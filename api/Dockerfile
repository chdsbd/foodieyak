FROM python:3.11-slim-bullseye

# Install Poetry
# update circleci jobs if you change this version
RUN set -ex && python3 -m pip install pip==23.2.1 && \
  python3 -m pip install poetry==1.5.1 && \
  poetry config virtualenvs.in-project true

# Install Application into container
RUN set -ex && mkdir -p /var/app

WORKDIR /var/app

# Adding dependency files
COPY pyproject.toml pyproject.toml
COPY poetry.lock poetry.lock

# Install our dev dependencies
RUN poetry install

COPY . /var/app

CMD ["/var/app/entrypoint.sh"]
