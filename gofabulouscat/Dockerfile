FROM golang:latest AS build

WORKDIR /app

# Copy the Go module files
COPY go.mod .
COPY go.sum .

# Download the Go module dependencies
RUN go clean --modcache
RUN go mod download

COPY . .
RUN go get github.com/CC-RMD-EpiBio/gofluttercat
RUN CGO_ENABLED=0  go build -o /wdfab ./main.go
 
FROM golang:1.26.0-alpine AS run

# Copy the application executable from the build image
COPY --from=build /wdfab /wdfab

WORKDIR /app
EXPOSE 3000
CMD ["/wdfab",  "server"]

