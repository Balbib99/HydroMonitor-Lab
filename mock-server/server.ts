import cors from 'cors';
import express from 'express';
import { historicalMeasurements } from './data/historical-measurements';
import { mockMeasurements } from '../src/data/mock-measurements';
import { mockStations } from '../src/data/mock-stations';

const app = express();
const port = 3001;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

app.listen(port, () => {
  console.log(`Mock REST API running at http://localhost:${port}`);
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
