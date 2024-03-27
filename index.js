"use strict";

import opentelemetry, { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import grpc from "@grpc/grpc-js";

import { OTLPTraceExporter as OTLPTraceExporterGRPC } from "@opentelemetry/exporter-trace-otlp-grpc";
import { OTLPTraceExporter as OTLPTraceExporterProto } from "@opentelemetry/exporter-trace-otlp-proto";
// Not suported yet
// import { OTLPTraceExporter as OTLPTraceExporterJson } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { config } from "dotenv";

config();

const provider = new BasicTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "otel-test-isra-service",
  }),
});

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// SETTING INSTANA EXPORTER
const metadataInstana = new grpc.Metadata();
metadataInstana.set("x-instana-key", process.env.OTEL_EXPORTER_INSTANA_KEY);
metadataInstana.set("x-instana-host", process.env.OTEL_EXPORTER_INSTANA_HOST);

const exporterInstana = new OTLPTraceExporterGRPC({
  url: process.env.OTEL_EXPORTER_INSTANA_ENDPOINT,
  // headers: {
  //   "x-instana-key": process.env.OTEL_EXPORTER_INSTANA_KEY,
  //   "x-instana-host": process.env.OTEL_EXPORTER_INSTANA_HOST,
  // },
  metadata: metadataInstana,
});

diag.debug("CUSTOM INDEX LEVEL LOG: exporter", exporterInstana.url, exporterInstana.headers, exporterInstana.metadata);
provider.addSpanProcessor(new SimpleSpanProcessor(exporterInstana));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

/**
 * Initialize the OpenTelemetry APIs to use the BasicTracerProvider bindings.
 *
 * This registers the tracer provider with the OpenTelemetry API as the global
 * tracer provider. This means when you call API methods like
 * `opentelemetry.trace.getTracer`, they will use this tracer provider. If you
 * do not register a global tracer provider, instrumentation which calls these
 * methods will receive no-op implementations.
 */
provider.register();
// Change the Isra thing...
const tracer = opentelemetry.trace.getTracer("otel-test-isra-service-tracer-node");
// Create a span. A span must be closed.
const parentSpan = tracer.startSpan("main");

for (let i = 0; i < 1; i += 1) {
  doWork(parentSpan);
}
// Be sure to end the span.
parentSpan.end();

//diag.debug("CUSTOM INDEX LEVEL LOG: Parent Span", parentSpan);

// flush and close the connection.
exporterInstana.shutdown();

function doWork(parent) {
  // Start another span. In this example, the main method already started a
  // span, so that'll be the parent span, and this will be a child span.
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parent);
  const span = tracer.startSpan("doWork", undefined, ctx);

  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // empty
  }

  // Set attributes to the span.
  span.setAttribute("otel-test-key", "otel-test-value");

  // Annotate our span to capture metadata about our operation
  span.addEvent("invoking doWork");

  span.end();

  //diag.debug("CUSTOM INDEX LEVEL LOG: DoWork Span", span);
}
