import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

// Mock Recharts
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
    AreaChart: ({ children }: any) => <div>AreaChart {children}</div>,
    PieChart: ({ children }: any) => <div>PieChart {children}</div>,
    Area: () => <div>Area</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>CartesianGrid</div>,
    Tooltip: () => <div>Tooltip</div>,
    Pie: () => <div>Pie</div>,
    Cell: () => <div>Cell</div>,
  };
});

describe('App Dashboard', () => {
  it('renders the main dashboard layout', () => {
    render(<App />);
    
    // Check for Sidebar elements
    expect(screen.getByText(/Pro Trading/i)).toBeInTheDocument();
    
    // Check for Header elements
    expect(screen.getByText(/Ashutosh G./i)).toBeInTheDocument();
    
    // Check for Dashboard Title
    expect(screen.getByText(/Overview of your investments/i)).toBeInTheDocument();
  });
});