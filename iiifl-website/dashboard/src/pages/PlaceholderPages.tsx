import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const GenericPage = ({ title }: { title: string }) => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
              <p className="text-muted-foreground">Manage your {title.toLowerCase()} here.</p>
            </div>
       </div>
       <Card>
         <CardHeader>
           <CardTitle>{title} Section</CardTitle>
         </CardHeader>
         <CardContent>
           <p>This feature is coming soon.</p>
         </CardContent>
       </Card>
    </div>
  );
};

export const PortfolioPage = () => <GenericPage title="Portfolio" />;
export const MarketPage = () => <GenericPage title="Market" />;
export const FundsPage = () => <GenericPage title="Funds" />;
export const SettingsPage = () => <GenericPage title="Settings" />;
