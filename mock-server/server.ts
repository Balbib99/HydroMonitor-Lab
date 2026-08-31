import cors from 'cors';
import express from 'express';
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
