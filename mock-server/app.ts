import cors from 'cors';
import express from 'express';
import { historicalMeasurements } from './data/historical-measurements';
import { mockMeasurements } from '../src/data/mock-measurements';
import { mockStations } from '../src/data/mock-stations';
import type { Measurement } from '../src/models/measurement';

export const app = express();

const streamIntervalMs = 5000;
const localOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: localOrigins,
  }),
);

app.get('/api/stations', (_request, response) => {
  response.json(mockStations);
});

app.get('/api/stations/:id', (request, response) => {
  const station = mockStations.find(
    (mockStation) => mockStation.id === request.params.id,
  );

  if (!station) {
    response.status(404).json({ message: 'Station not found' });
    return;
  }

  response.json(station);
});

app.get('/api/stations/:id/measurements', (request, response) => {
  const station = mockStations.find(
    (mockStation) => mockStation.id === request.params.id,
  );

  if (!station) {
    response.status(404).json({ message: 'Station not found' });
    return;
  }

  const fromDate = parseDateQuery(request.query.from);
  const toDate = parseDateQuery(request.query.to);

  if (fromDate === 'invalid' || toDate === 'invalid') {
    response.status(400).json({ message: 'Invalid date query parameter' });
    return;
  }

  if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
    response.status(400).json({ message: 'from must be before to' });
    return;
  }

  const measurements = historicalMeasurements.filter((measurement) => {
    if (measurement.stationId !== request.params.id) {
      return false;
    }

    const measurementTime = new Date(measurement.timestamp).getTime();
    const afterFrom = fromDate ? measurementTime >= fromDate.getTime() : true;
    const beforeTo = toDate ? measurementTime <= toDate.getTime() : true;

    return afterFrom && beforeTo;
  });

  response.json(measurements);
});

app.get('/api/stations/:id/measurements/latest', (request, response) => {
  const measurement = mockMeasurements.find(
    (mockMeasurement) => mockMeasurement.stationId === request.params.id,
  );

  if (!measurement) {
    response.status(404).json({ message: 'Measurement not found' });
    return;
  }

  response.json(measurement);
});

app.get('/api/stations/:id/measurements/stream', (request, response) => {
  const station = mockStations.find(
    (mockStation) => mockStation.id === request.params.id,
  );

  if (!station) {
    response.status(404).json({ message: 'Station not found' });
    return;
  }

  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache, no-transform');
  response.setHeader('Connection', 'keep-alive');
  response.setHeader('X-Accel-Buffering', 'no');
  response.flushHeaders();
  response.write(': connected\n\n');

  let step = 0;
  let previousMeasurement = getLastKnownMeasurement(station.id);

  const interval = setInterval(() => {
    step += 1;
    previousMeasurement = createNextMeasurement(previousMeasurement, step);
    response.write(`data: ${JSON.stringify(previousMeasurement)}\n\n`);
  }, streamIntervalMs);

  request.on('close', () => {
    clearInterval(interval);
    response.end();
  });
});

function parseDateQuery(value: unknown): Date | undefined | 'invalid' {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return 'invalid';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'invalid';
  }

  return date;
}

function getLastKnownMeasurement(stationId: string): Measurement {
  const latestMeasurement = mockMeasurements.find(
    (measurement) => measurement.stationId === stationId,
  );

  if (latestMeasurement) {
    return latestMeasurement;
  }

  const historicalMeasurement = historicalMeasurements.findLast(
    (measurement) => measurement.stationId === stationId,
  );

  if (historicalMeasurement) {
    return historicalMeasurement;
  }

  return {
    stationId,
    timestamp: new Date().toISOString(),
    temperature: 0,
    humidity: 0,
    waterLevel: 0,
    flowRate: 0,
    rainfall: 0,
    quality: 'valid',
  };
}

function createNextMeasurement(
  previousMeasurement: Measurement,
  step: number,
): Measurement {
  const wave = Math.sin(step / 2);

  return {
    stationId: previousMeasurement.stationId,
    timestamp: new Date().toISOString(),
    temperature: round(previousMeasurement.temperature + wave * 0.12),
    humidity: round(previousMeasurement.humidity + Math.cos(step / 3) * 0.4),
    waterLevel: round(previousMeasurement.waterLevel + wave * 0.04),
    flowRate: round(previousMeasurement.flowRate + wave * 0.6),
    rainfall: round(previousMeasurement.rainfall + (step % 4 === 0 ? 0.1 : 0)),
    quality: 'valid',
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
