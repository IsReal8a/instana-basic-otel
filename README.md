# Instana Otel Basic

This code should be used test Instana OpenTelemetry capabilities, nothing fancy with Docker and things like that, just to do quick dirty tests.
It's based on [Alessandro Crotti's project](https://github.com/alessandrocrotti/instana-exporter-test)

## Setup
First create an `.env` file with the following:

```
OTEL_EXPORTER_INSTANA_ENDPOINT="https://ENDPOINT:4317"
# you have to set your instana key manually taking the value from Instana backoffice > ... > Agents > Install Agents > Windows > Instana Agent key
OTEL_EXPORTER_INSTANA_KEY="AwesomeKey"
OTEL_EXPORTER_INSTANA_HOST="YourHost(Optional)"
```

More information about the endpoints can be found [HERE](https://www.ibm.com/docs/en/instana-observability/current?topic=opentelemetry-sending-data-instana-backend#endpoints-of-the-instana-backend-otlp-acceptor)
You find your region in "Instana UI -> More -> About Instana"

**Code use gRPC by default**

## How can I run it?

Install dependencies:

```
npm i
```

Then run it:

```
npm run start
```

## How to change the exporter

We support two exporters:

| Exporter module                          | Protocol   | Endpoint Port |
| ---------------------------------------- | ---------- | ------------- |
| @opentelemetry/exporter-trace-otlp-grpc  | gRPC       | 4317          |
| @opentelemetry/exporter-trace-otlp-proto | http/proto | 4318          |

Per default I'm using the gRPC/4317 approach, if you want to use Proto, just comment the metadata parts, uncomment the headers, change this `OTLPTraceExporterGRPC` to this `OTLPTraceExporterProto` and change the exporter URL in the `.env` file:

```
// SETTING INSTANA EXPORTER
// const metadataInstana = new grpc.Metadata();
// metadataInstana.set("x-instana-key", process.env.OTEL_EXPORTER_INSTANA_KEY);
// metadataInstana.set("x-instana-host", process.env.OTEL_EXPORTER_INSTANA_HOST);

const exporterInstana = new OTLPTraceExporterGRPC({
  url: process.env.OTEL_EXPORTER_INSTANA_ENDPOINT,
  headers: {
     "x-instana-key": process.env.OTEL_EXPORTER_INSTANA_KEY,
     "x-instana-host": process.env.OTEL_EXPORTER_INSTANA_HOST,
   },
//  metadata: metadataInstana,
});
```

```
OTEL_EXPORTER_INSTANA_ENDPOINT="https://ENDPOINT:4318/v1/traces"
```

I know, isn't practical but hey, it's Beta version :)

## What do I get?

If everything went well, you are going to see a lot of things in the terminal but the important part is the last three lines:

```
shutdown started
Objects sent
Objects sent
````

That means you were able to sent data into Instana without issues.

Now go to the Instana UI, go to Analytics and in the filter search for Service->Name and then select the otel-test... service.