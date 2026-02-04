import React, { useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Container,
    Paper,
} from '@mui/material';
import MainLayout from '../../components/layout/MainLayout';
import SalesReport from './components/SalesReport';
import ProductsReport from './components/ProductsReport';
import CustomersReport from './components/CustomersReport';
import InventoryReport from './components/InventoryReport';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const Reports: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <MainLayout title="Reportes">
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ 
                  mb: 3,
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="reportes"
                        sx={{
                            borderBottom: 1,
                            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'divider',
                            backgroundColor: 'transparent',
                        }}
                    >
                        <Tab label="📊 Ventas" id="tab-0" aria-controls="tabpanel-0" />
                        <Tab label="📦 Productos" id="tab-1" aria-controls="tabpanel-1" />
                        <Tab label="👥 Clientes" id="tab-2" aria-controls="tabpanel-2" />
                        <Tab label="📈 Inventario" id="tab-3" aria-controls="tabpanel-3" />
                    </Tabs>
                </Paper>

                <TabPanel value={tabValue} index={0}>
                    <SalesReport />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <ProductsReport />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <CustomersReport />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <InventoryReport />
                </TabPanel>
            </Container>
        </MainLayout>
    );
};

export default Reports;
