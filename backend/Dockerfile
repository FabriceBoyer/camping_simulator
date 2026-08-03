# syntax=docker/dockerfile:1

FROM golang:1.26-alpine AS build
WORKDIR /src

COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal

RUN mkdir -p /out/data/saves && \
    CGO_ENABLED=0 GOOS=linux go build -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot AS runtime
WORKDIR /app

COPY --from=build /out/server ./server
COPY --from=build --chown=65532:65532 /out/data ./data

ENV PORT=8787
ENV DATA_DIR=/app/data/saves

EXPOSE 8787
USER 65532:65532

ENTRYPOINT ["./server"]
