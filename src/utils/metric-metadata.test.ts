import { getMetricMetadata } from './metric-metadata';

describe('getMetricMetadata', () => {
  test('returns label and unit for water level', () => {
    const metadata = getMetricMetadata('waterLevel');

    expect(metadata).toEqual({
      label: 'Water Level',
      unit: 'm',
    });
  });

  test('returns label and unit for flow rate', () => {
    const metadata = getMetricMetadata('flowRate');

    expect(metadata).toEqual({
      label: 'Flow Rate',
      unit: 'm\u00b3/s',
    });
  });

  test('returns label and unit for rainfall', () => {
    const metadata = getMetricMetadata('rainfall');

    expect(metadata).toEqual({
      label: 'Rainfall',
      unit: 'mm',
    });
  });
});
