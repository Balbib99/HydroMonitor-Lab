function disableRealtime() {
  cy.visit('/', {
    onBeforeLoad(win) {
      class MockEventSource implements EventSource {
        static readonly CONNECTING = 0;
        static readonly OPEN = 1;
        static readonly CLOSED = 2;

        readonly CONNECTING = 0;
        readonly OPEN = 1;
        readonly CLOSED = 2;
        readonly url: string;
        readonly withCredentials = false;
        readyState = MockEventSource.CONNECTING;
        onopen: ((event: Event) => void) | null = null;
        onmessage: ((event: MessageEvent) => void) | null = null;
        onerror: ((event: Event) => void) | null = null;

        constructor(url: string | URL) {
          this.url = String(url);

          setTimeout(() => {
            this.readyState = MockEventSource.OPEN;
            this.onopen?.(new Event('open'));
          }, 0);
        }

        close() {
          this.readyState = MockEventSource.CLOSED;
        }

        addEventListener() {
          return;
        }

        removeEventListener() {
          return;
        }

        dispatchEvent() {
          return true;
        }
      }

      win.EventSource = MockEventSource as unknown as typeof EventSource;
    },
  });
}

function interceptDefaultRest() {
  cy.intercept('GET', '**/api/stations', { fixture: 'stations.json' }).as(
    'stations',
  );
  cy.intercept('GET', '**/api/stations/*/measurements/latest', (request) => {
    if (request.url.includes('/VA-003/')) {
      request.reply({ fixture: 'va003-latest.json' });
      return;
    }

    if (request.url.includes('/VA-002/')) {
      request.reply({ fixture: 'va002-latest.json' });
      return;
    }

    request.reply({ fixture: 'va001-latest.json' });
  }).as('latest');
  cy.intercept('GET', '**/api/stations/*/measurements?*', (request) => {
    if (request.url.includes('/VA-003/')) {
      request.reply({ fixture: 'va003-history.json' });
      return;
    }

    request.reply({ fixture: 'va001-history.json' });
  }).as('history');
}

function waitForDashboard() {
  cy.contains('HydroMonitor Lab').should('be.visible');
  cy.get('[data-cy="station-selector"]').should('exist');
  cy.get('[data-cy="sensor-card-waterLevel"]').should('exist');
  cy.get('[data-cy="measurement-chart"]').should('exist');
  cy.get('[data-cy="alarm-panel"]').should('exist');
  cy.get('[data-cy="connection-status"]').should('exist');
}

function selectStation(stationId: string) {
  cy.get('[data-cy="station-selector"]')
    .find('[data-cy="station-select"]')
    .select(stationId);
}

describe('HydroMonitor Lab dashboard', () => {
  it('loads the HydroMonitor dashboard', () => {
    cy.visit('/');

    waitForDashboard();
    cy.get('[data-cy="sensor-card-temperature"]').should('exist');
    cy.get('[data-cy="sensor-card-humidity"]').should('exist');
    cy.get('[data-cy="sensor-card-flowRate"]').should('exist');
  });

  it('updates the dashboard when the station changes', () => {
    interceptDefaultRest();
    disableRealtime();
    cy.wait('@stations');
    cy.wait('@latest');
    cy.wait('@history');

    selectStation('VA-003');
    cy.wait('@latest');
    cy.wait('@history');

    cy.contains('Esgueva').should('be.visible');
    cy.get('[data-cy="sensor-card-waterLevel"]').within(() => {
      cy.contains('3.72').should('be.visible');
      cy.contains('WARNING').should('be.visible');
    });
    cy.get('[data-cy="alarm-panel"]').within(() => {
      cy.contains('CRITICAL').should('be.visible');
      cy.contains('Water Level').should('be.visible');
      cy.contains('3.72').should('be.visible');
    });
    cy.get('[data-cy="measurement-chart"]').should('be.visible');
  });

  it('shows loading state while stations are loading', () => {
    cy.intercept('GET', '**/api/stations', {
      delay: 1000,
      fixture: 'stations.json',
    }).as('stations');
    cy.intercept('GET', '**/api/stations/*/measurements/latest', {
      fixture: 'va001-latest.json',
    }).as('latest');
    cy.intercept('GET', '**/api/stations/*/measurements?*', {
      fixture: 'va001-history.json',
    }).as('history');

    disableRealtime();

    cy.contains('Loading stations...').should('be.visible');
    cy.wait('@stations');
    cy.contains('Loading stations...').should('not.exist');
    waitForDashboard();
  });

  it('shows an error when stations request fails', () => {
    cy.intercept('GET', '**/api/stations', {
      statusCode: 500,
      body: { message: 'Server error' },
    }).as('stations');

    disableRealtime();
    cy.wait('@stations');

    cy.contains('Error loading stations').should('be.visible');
  });

  it('keeps latest measurement visible when history fails', () => {
    cy.intercept('GET', '**/api/stations', { fixture: 'stations.json' }).as(
      'stations',
    );
    cy.intercept('GET', '**/api/stations/*/measurements/latest', {
      fixture: 'va001-latest.json',
    }).as('latest');
    cy.intercept('GET', '**/api/stations/*/measurements?*', {
      statusCode: 500,
      body: { message: 'History failed' },
    }).as('history');

    disableRealtime();
    cy.wait('@latest');
    cy.wait('@history');

    cy.get('[data-cy="sensor-card-waterLevel"]').within(() => {
      cy.contains('3.2').should('be.visible');
    });
    cy.contains('Error loading historical data').should('be.visible');
  });

  it('keeps historical chart visible when latest measurement fails', () => {
    cy.intercept('GET', '**/api/stations', { fixture: 'stations.json' }).as(
      'stations',
    );
    cy.intercept('GET', '**/api/stations/*/measurements/latest', {
      statusCode: 500,
      body: { message: 'Latest failed' },
    }).as('latest');
    cy.intercept('GET', '**/api/stations/*/measurements?*', {
      fixture: 'va001-history.json',
    }).as('history');

    disableRealtime();
    cy.wait('@latest');
    cy.wait('@history');

    cy.contains('Error loading measurement').should('be.visible');
    cy.get('[data-cy="measurement-chart"]').should('be.visible');
  });

  it('keeps the latest selected station after rapid changes', () => {
    interceptDefaultRest();
    disableRealtime();
    cy.wait('@stations');
    cy.wait('@latest');
    cy.wait('@history');

    cy.intercept('GET', '**/api/stations/VA-001/measurements/latest', {
      delay: 1200,
      fixture: 'va001-latest.json',
    });
    cy.intercept('GET', '**/api/stations/VA-002/measurements/latest', {
      delay: 600,
      fixture: 'va002-latest.json',
    });
    cy.intercept('GET', '**/api/stations/VA-003/measurements/latest', {
      delay: 50,
      fixture: 'va003-latest.json',
    });

    selectStation('VA-001');
    selectStation('VA-002');
    selectStation('VA-003');

    cy.contains('Esgueva').should('be.visible');
    cy.get('[data-cy="sensor-card-waterLevel"]').within(() => {
      cy.contains('3.72').should('be.visible');
    });
    cy.get('[data-cy="station-selector"]')
      .find('[data-cy="station-select"]')
      .should('have.value', 'VA-003');
  });

  it('shows a critical water level alarm', () => {
    interceptDefaultRest();
    disableRealtime();
    cy.wait('@stations');

    selectStation('VA-003');
    cy.wait('@latest');
    cy.wait('@history');

    cy.get('[data-cy="alarm-panel"]').within(() => {
      cy.contains('CRITICAL').should('be.visible');
      cy.contains('Water Level').should('be.visible');
      cy.contains('3.72').should('be.visible');
    });
  });

  it('does not show a water level alarm below threshold', () => {
    interceptDefaultRest();
    disableRealtime();
    cy.wait('@latest');
    cy.wait('@history');

    cy.get('[data-cy="alarm-panel"]').within(() => {
      cy.contains('No active alerts').should('be.visible');
      cy.contains('CRITICAL').should('not.exist');
    });
  });

  it('updates measurement data from the realtime stream', () => {
    cy.visit('/');
    waitForDashboard();

    cy.get('[data-cy="connection-status"]')
      .contains('CONNECTED', { timeout: 10000 })
      .should('be.visible');
    cy.get('[data-cy="sensor-card-waterLevel"]')
      .find('[data-cy="sensor-reading"]')
      .invoke('text')
      .then((initialText) => {
        cy.get('[data-cy="sensor-card-waterLevel"]')
          .find('[data-cy="sensor-reading"]', { timeout: 16000 })
          .should(($reading) => {
            expect($reading.text()).not.to.equal(initialText);
          });
      });
  });

  it('keeps main content available on mobile viewport', () => {
    interceptDefaultRest();
    cy.viewport('iphone-x');
    disableRealtime();
    cy.wait('@latest');
    cy.wait('@history');

    cy.get('[data-cy="station-selector"]').should('be.visible');
    cy.get('[data-cy="sensor-card-waterLevel"]').should('exist');
    cy.get('[data-cy="measurement-chart"]').should('exist');
  });

  it('changes station through the native select control', () => {
    interceptDefaultRest();
    disableRealtime();
    cy.wait('@stations');

    selectStation('VA-003');

    cy.contains('Esgueva').should('be.visible');
  });
});
