import { render, screen } from '@testing-library/react';
import PortfolioSummary from './PortfolioSummary';
import RecentTransactions from './RecentTransactions';
import { describe, it, expect } from 'vitest';

describe('Dashboard Components', () => {
  
  it('renders portfolio summary cards with correct values', () => {
    render(<PortfolioSummary />);
    
    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
    expect(screen.getByText('₹ 24,50,000')).toBeInTheDocument();
    expect(screen.getByText('Available Margin')).toBeInTheDocument();
  });

  it('renders recent transactions table', () => {
    render(<RecentTransactions />);
    
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    expect(screen.getByText('RELIANCE')).toBeInTheDocument();
    expect(screen.getByText('TCS')).toBeInTheDocument();
    
    // Check for badges (multiple BUYs exist)
    const buyBadges = screen.getAllByText('BUY');
    expect(buyBadges.length).toBeGreaterThan(0);
    expect(buyBadges[0]).toBeInTheDocument();

    expect(screen.getByText('SELL')).toBeInTheDocument();
  });

});