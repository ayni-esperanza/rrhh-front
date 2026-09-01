import { DashboardAnalyticsRowComponent } from './dashboard-analytics-row/dashboard-analytics-row.component';
import { DashboardCostsRowComponent } from './dashboard-costs-row/dashboard-costs-row.component';

describe('Dashboard chart formatters', () => {
  it('keeps the currency formatter context when ngx-charts invokes it as a callback', () => {
    const component = new DashboardCostsRowComponent();
    const formatter = (component as unknown as { percentFormat: (value: number) => string }).percentFormat;

    expect(formatter(3000)).toContain('3,000');
  });

  it('formats percentages when invoked as detached callbacks', () => {
    const component = new DashboardAnalyticsRowComponent();
    const formatter = (component as unknown as { percentFormat: (value: number) => string }).percentFormat;

    expect(formatter(25)).toBe('25%');
  });
});
